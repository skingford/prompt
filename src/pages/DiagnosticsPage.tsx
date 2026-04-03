import type { TFunction } from "i18next";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { SplitPane } from "../components/SplitPane";
import {
  DiagnosticsPanel,
  DiagnosticsTopBar,
  EmptyState,
  PromptPanel,
  ResultTabs,
  VersionPanel,
} from "../components/WorkbenchParts";
import { useToast } from "../context/ToastContext";
import {
  ChatCompletionError,
  optimizePrompt,
} from "../lib/chatCompletions";
import {
  DEFAULT_MODEL_IDENTIFIER,
  getDefaultDiagnosticsIssues,
  getDefaultDiagnosticsPrompt,
  getDefaultDiagnosticsVersions,
  getVersionLabel,
  models,
  relabelVersions,
  runMockDiagnosis,
  sleep,
} from "../lib/workbench";
import type {
  DiagnosticsRouteState,
  VersionRecord,
} from "../types";

const SPLIT_KEY = "promptopt.split.diagnostics";

function readRatio() {
  const stored = Number(window.localStorage.getItem(SPLIT_KEY));
  return Number.isFinite(stored) && stored > 0.2 && stored < 0.8 ? stored : 0.4;
}

function buildInitialState(routeState: unknown, t: TFunction<"workbench">): DiagnosticsRouteState {
  if (
    routeState &&
    typeof routeState === "object" &&
    "prompt" in routeState &&
    "issues" in routeState &&
    "versions" in routeState &&
    "activeTabId" in routeState
  ) {
    return routeState as DiagnosticsRouteState;
  }

  return {
    prompt: getDefaultDiagnosticsPrompt(t),
    issues: getDefaultDiagnosticsIssues(t),
    versions: getDefaultDiagnosticsVersions(t),
    activeTabId: "diagnostics",
  };
}

function buildOptimizeErrorMessage(
  error: unknown,
  t: TFunction<"workbench">,
) {
  if (
    error instanceof ChatCompletionError &&
    error.message === "The gateway returned no completion text."
  ) {
    return t("workbench:toasts.gatewayEmptyResponse");
  }

  if (
    error instanceof ChatCompletionError &&
    error.message ===
      "Unable to reach the local chat gateway. Restart the Vite server after updating the proxy settings."
  ) {
    return t("workbench:toasts.gatewayUnavailable");
  }

  if (error instanceof Error && error.name === "AbortError") {
    return null;
  }

  const detail =
    error instanceof Error && error.message.trim().length > 0
      ? error.message.trim()
      : t("workbench:toasts.gatewayEmptyResponse");

  return t("workbench:toasts.gatewayRequestFailed", { message: detail });
}

export function DiagnosticsPage() {
  const { t } = useTranslation("workbench");
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const routeState = useMemo(
    () => buildInitialState(location.state, t),
    [location.key, location.state],
  );
  const [prompt, setPrompt] = useState(routeState.prompt);
  const [issues, setIssues] = useState(routeState.issues);
  const [versions, setVersions] = useState(routeState.versions);
  const [activeTabId, setActiveTabId] = useState<"diagnostics" | string>(routeState.activeTabId);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL_IDENTIFIER);
  const [loadingState, setLoadingState] = useState<
    "diagnose" | "optimize" | "optimize-diagnostics" | null
  >(null);
  const [ratio, setRatio] = useState(readRatio);
  const optimizeAbortRef = useRef<AbortController | null>(null);
  const receivedStreamingContentRef = useRef("");
  const displayedStreamingContentRef = useRef("");
  const typingFrameRef = useRef<number | null>(null);
  const streamingVersionIdRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  function cancelTypingFrame() {
    if (typingFrameRef.current !== null) {
      window.cancelAnimationFrame(typingFrameRef.current);
      typingFrameRef.current = null;
    }
  }

  function syncStreamingVersion(
    versionId: string,
    content: string,
    isStreaming: boolean,
  ) {
    setVersions((current) =>
      current.map((version) =>
        version.id === versionId
          ? {
              ...version,
              content,
              isStreaming,
            }
          : version,
      ),
    );
  }

  function scheduleTypewriter(versionId: string) {
    if (typingFrameRef.current !== null) {
      return;
    }

    typingFrameRef.current = window.requestAnimationFrame(() => {
      typingFrameRef.current = null;

      if (!isMountedRef.current || streamingVersionIdRef.current !== versionId) {
        return;
      }

      const received = receivedStreamingContentRef.current;
      const displayed = displayedStreamingContentRef.current;
      const backlog = received.length - displayed.length;

      if (backlog <= 0) {
        return;
      }

      const nextDisplayed = received;
      displayedStreamingContentRef.current = nextDisplayed;
      startTransition(() => {
        syncStreamingVersion(versionId, nextDisplayed, true);
      });

      if (
        displayedStreamingContentRef.current.length <
        receivedStreamingContentRef.current.length
      ) {
        scheduleTypewriter(versionId);
      }
    });
  }

  async function waitForTypewriterToCatchUp(versionId: string) {
    while (isMountedRef.current && streamingVersionIdRef.current === versionId) {
      if (
        displayedStreamingContentRef.current.length >=
        receivedStreamingContentRef.current.length
      ) {
        return;
      }

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 16);
      });
    }
  }

  useEffect(() => {
    document.title = t("workbench:pageTitle.diagnostics");
  }, [t]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      optimizeAbortRef.current?.abort();
      cancelTypingFrame();
      receivedStreamingContentRef.current = "";
      displayedStreamingContentRef.current = "";
      streamingVersionIdRef.current = null;
    };
  }, []);

  useEffect(() => {
    setPrompt(routeState.prompt);
    setIssues(routeState.issues);
    setVersions(routeState.versions);
    setActiveTabId(routeState.activeTabId);
  }, [routeState]);

  useEffect(() => {
    setVersions((current) => relabelVersions(current, t));
  }, [t]);

  useEffect(() => {
    window.localStorage.setItem(SPLIT_KEY, String(ratio));
  }, [ratio]);

  const trimmedPrompt = prompt.trim();
  const activeVersion = versions.find((version) => version.id === activeTabId) ?? versions[0];

  async function handleDiagnose() {
    setLoadingState("diagnose");
    await sleep();
    setIssues(runMockDiagnosis(prompt, t));
    setActiveTabId("diagnostics");
    setLoadingState(null);
  }

  async function handleOptimize(useDiagnostics: boolean) {
    if (versions.length >= 10) {
      showToast(t("workbench:toasts.closeOlderVersion"), "error");
      return;
    }

    optimizeAbortRef.current?.abort();
    cancelTypingFrame();
    const controller = new AbortController();
    optimizeAbortRef.current = controller;
    setLoadingState(useDiagnostics ? "optimize-diagnostics" : "optimize");
    const nextVersionId = `version-${Date.now()}`;
    const nextVersionLabel = getVersionLabel(t, versions.length + 1);
    let receivedDelta = false;

    receivedStreamingContentRef.current = "";
    displayedStreamingContentRef.current = "";
    streamingVersionIdRef.current = nextVersionId;
    setVersions((current) => [
      ...current,
      {
        id: nextVersionId,
        label: nextVersionLabel,
        content: "",
        isStreaming: true,
      },
    ]);
    setActiveTabId(nextVersionId);

    try {
      const nextContent = await optimizePrompt({
        prompt,
        model: selectedModel,
        issues: useDiagnostics ? issues : undefined,
        onDelta: (delta) => {
          if (!isMountedRef.current) {
            return;
          }

          receivedDelta = true;
          receivedStreamingContentRef.current += delta;
          scheduleTypewriter(nextVersionId);
        },
        signal: controller.signal,
      });
      const content = nextContent;

      if (!content.trim()) {
        throw new ChatCompletionError("The gateway returned no completion text.");
      }

      if (!isMountedRef.current) {
        return;
      }

      receivedStreamingContentRef.current = content;
      scheduleTypewriter(nextVersionId);
      await waitForTypewriterToCatchUp(nextVersionId);

      if (!isMountedRef.current || streamingVersionIdRef.current !== nextVersionId) {
        return;
      }

      cancelTypingFrame();
      syncStreamingVersion(
        nextVersionId,
        displayedStreamingContentRef.current,
        false,
      );
    } catch (error) {
      if (isMountedRef.current) {
        cancelTypingFrame();
        const displayedContent = displayedStreamingContentRef.current;
        const receivedContent = receivedStreamingContentRef.current;
        setVersions((current) => {
          if (!receivedDelta) {
            return current.filter((version) => version.id !== nextVersionId);
          }

          return current.map((version) =>
            version.id === nextVersionId
              ? {
                  ...version,
                  content: displayedContent || receivedContent,
                  isStreaming: false,
                }
              : version,
            );
        });

        if (!receivedDelta) {
          setActiveTabId((current) =>
            current === nextVersionId ? "diagnostics" : current,
          );
        }
      }

      const message = buildOptimizeErrorMessage(error, t);

      if (message) {
        showToast(message, "error");
      }
    } finally {
      if (optimizeAbortRef.current === controller) {
        optimizeAbortRef.current = null;
      }

      if (streamingVersionIdRef.current === nextVersionId) {
        receivedStreamingContentRef.current = "";
        displayedStreamingContentRef.current = "";
        streamingVersionIdRef.current = null;
      }

      if (isMountedRef.current) {
        setLoadingState(null);
      }
    }
  }

  function handleCloseVersion(versionId: string) {
    if (streamingVersionIdRef.current === versionId) {
      optimizeAbortRef.current?.abort();
      cancelTypingFrame();
      receivedStreamingContentRef.current = "";
      displayedStreamingContentRef.current = "";
      streamingVersionIdRef.current = null;
    }

    setVersions((current) => {
      const next = current.filter((version) => version.id !== versionId);
      if (activeTabId === versionId) {
        setActiveTabId(next[0]?.id ?? "diagnostics");
      }
      return next;
    });
  }

  function handleAdopt(version: VersionRecord) {
    setPrompt(version.content);
    showToast(t("workbench:toasts.versionCopiedToEditor", { label: version.label }), "success");
  }

  function handleCompare(version: VersionRecord) {
    navigate("/workbench/comparison", {
      state: {
        prompt,
        versions,
        activeVersionId: version.id,
        returnState: {
          prompt,
          issues,
          versions,
          activeTabId: version.id,
        },
      },
    });
  }

  return (
    <div className="workbench-screen">
      <DiagnosticsTopBar
        modelOptions={models}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
      />
      <main className="workbench-main workbench-main--diagnostics">
        <SplitPane
          ratio={ratio}
          onRatioChange={setRatio}
          left={(
            <PromptPanel
              title={t("workbench:prompt.editorTitle")}
              prompt={prompt}
              onPromptChange={setPrompt}
              charLabel={t("workbench:prompt.charCount", { count: prompt.length })}
              placeholder={t("workbench:prompt.diagnosticsPlaceholder")}
              variant="diagnostics"
              showActions
              canSubmit={trimmedPrompt.length > 0}
              loadingState={loadingState}
              onDiagnose={handleDiagnose}
              onOptimize={() => handleOptimize(false)}
            />
          )}
          right={(
            <section className="panel panel--results">
              <ResultTabs
                activeTabId={activeTabId}
                versions={versions}
                onSelectTab={setActiveTabId}
                onCloseVersion={handleCloseVersion}
                showDiagnosticsTab
              />
              {activeTabId === "diagnostics" ? (
                <DiagnosticsPanel
                  issues={issues}
                  onOptimize={() => handleOptimize(true)}
                  isLoading={loadingState === "optimize-diagnostics"}
                />
              ) : activeVersion ? (
                <VersionPanel
                  version={activeVersion}
                  onAdopt={() => handleAdopt(activeVersion)}
                  onCompare={() => handleCompare(activeVersion)}
                  onCopied={() =>
                    showToast(t("workbench:toasts.copiedToClipboard", { label: activeVersion.label }), "success")
                  }
                />
              ) : (
                <EmptyState
                  title={t("workbench:states.noVersionTitle")}
                  body={t("workbench:states.noVersionBody")}
                />
              )}
            </section>
          )}
        />
      </main>
    </div>
  );
}
