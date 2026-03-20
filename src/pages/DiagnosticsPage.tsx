import type { TFunction } from "i18next";
import { useEffect, useMemo, useState } from "react";
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
  getDefaultDiagnosticsIssues,
  getDefaultDiagnosticsPrompt,
  getDefaultDiagnosticsVersions,
  getVersionLabel,
  models,
  relabelVersions,
  runMockDiagnosis,
  runMockOptimization,
  sleep,
} from "../lib/workbench";
import type { DiagnosticsRouteState, VersionRecord } from "../types";

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
  const [selectedModel, setSelectedModel] = useState("claude");
  const [loadingState, setLoadingState] = useState<
    "diagnose" | "optimize" | "optimize-diagnostics" | null
  >(null);
  const [ratio, setRatio] = useState(readRatio);

  useEffect(() => {
    document.title = t("workbench:pageTitle.diagnostics");
  }, [t]);

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

    setLoadingState(useDiagnostics ? "optimize-diagnostics" : "optimize");
    await sleep();
    const nextIndex = versions.length;
    const nextVersion: VersionRecord = {
      id: `version-${Date.now()}`,
      label: getVersionLabel(t, versions.length + 1),
      content: runMockOptimization(prompt, nextIndex, t, useDiagnostics ? issues : undefined),
    };
    setVersions((current) => [...current, nextVersion]);
    setActiveTabId(nextVersion.id);
    setLoadingState(null);
  }

  function handleCloseVersion(versionId: string) {
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
