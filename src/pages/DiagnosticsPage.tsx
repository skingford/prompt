import { useEffect, useMemo, useState } from "react";
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
  defaultDiagnosticsIssues,
  defaultDiagnosticsPrompt,
  defaultDiagnosticsVersions,
  models,
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

function buildInitialState(routeState: unknown): DiagnosticsRouteState {
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
    prompt: defaultDiagnosticsPrompt,
    issues: defaultDiagnosticsIssues,
    versions: defaultDiagnosticsVersions,
    activeTabId: "diagnostics",
  };
}

export function DiagnosticsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const routeState = useMemo(() => buildInitialState(location.state), [location.key, location.state]);
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
    setPrompt(routeState.prompt);
    setIssues(routeState.issues);
    setVersions(routeState.versions);
    setActiveTabId(routeState.activeTabId);
  }, [routeState]);

  useEffect(() => {
    window.localStorage.setItem(SPLIT_KEY, String(ratio));
  }, [ratio]);

  const trimmedPrompt = prompt.trim();
  const activeVersion = versions.find((version) => version.id === activeTabId) ?? versions[0];

  async function handleDiagnose() {
    setLoadingState("diagnose");
    await sleep();
    setIssues(runMockDiagnosis(prompt));
    setActiveTabId("diagnostics");
    setLoadingState(null);
  }

  async function handleOptimize(useDiagnostics: boolean) {
    if (versions.length >= 10) {
      showToast("Close an older version tab before creating another one.", "error");
      return;
    }

    setLoadingState(useDiagnostics ? "optimize-diagnostics" : "optimize");
    await sleep();
    const nextIndex = versions.length;
    const nextVersion: VersionRecord = {
      id: `version-${Date.now()}`,
      label: `Version ${versions.length + 1}`,
      content: runMockOptimization(prompt, nextIndex, useDiagnostics ? issues : undefined),
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
    showToast(`${version.label} copied into the editor.`, "success");
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
              title="Prompt Editor"
              prompt={prompt}
              onPromptChange={setPrompt}
              charLabel={`${prompt.length} characters`}
              placeholder="Enter your prompt here..."
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
                  onCopied={() => showToast(`${activeVersion.label} copied to clipboard.`, "success")}
                />
              ) : (
                <EmptyState
                  title="No version selected"
                  body="Generate a new optimized version or reopen an existing tab."
                />
              )}
            </section>
          )}
        />
      </main>
    </div>
  );
}
