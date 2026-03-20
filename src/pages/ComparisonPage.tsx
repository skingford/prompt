import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SplitPane } from "../components/SplitPane";
import {
  ComparisonTopBar,
  ComparisonTrailingAction,
  DiffPanel,
  PromptPanel,
  ResultTabs,
  StatusBar,
  isComparisonState,
} from "../components/WorkbenchParts";
import { useToast } from "../context/ToastContext";
import {
  defaultComparisonPrompt,
  defaultComparisonVersions,
} from "../lib/workbench";
import type { ComparisonRouteState, VersionRecord } from "../types";

const SPLIT_KEY = "promptopt.split.comparison";

function readRatio() {
  const stored = Number(window.localStorage.getItem(SPLIT_KEY));
  return Number.isFinite(stored) && stored > 0.2 && stored < 0.8 ? stored : 0.5;
}

function buildInitialState(routeState: unknown): ComparisonRouteState {
  if (isComparisonState(routeState)) {
    return routeState;
  }

  return {
    prompt: defaultComparisonPrompt,
    versions: defaultComparisonVersions,
    activeVersionId: defaultComparisonVersions[0].id,
  };
}

export function ComparisonPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const routeState = useMemo(() => buildInitialState(location.state), [location.key, location.state]);
  const [prompt, setPrompt] = useState(routeState.prompt);
  const [versions, setVersions] = useState(routeState.versions);
  const [activeVersionId, setActiveVersionId] = useState(routeState.activeVersionId);
  const [viewMode, setViewMode] = useState<"preview" | "compare">("compare");
  const [ratio, setRatio] = useState(readRatio);

  useEffect(() => {
    setPrompt(routeState.prompt);
    setVersions(routeState.versions);
    setActiveVersionId(routeState.activeVersionId);
    setViewMode("compare");
  }, [routeState]);

  useEffect(() => {
    window.localStorage.setItem(SPLIT_KEY, String(ratio));
  }, [ratio]);

  const activeVersion = versions.find((version) => version.id === activeVersionId) ?? versions[0];

  function handleCloseVersion(versionId: string) {
    setVersions((current) => {
      const next = current.filter((version) => version.id !== versionId);
      if (!next.length) {
        return current;
      }
      if (activeVersionId === versionId) {
        setActiveVersionId(next[0].id);
      }
      return next;
    });
  }

  function handleExit() {
    navigate("/workbench/diagnostics", {
      state: routeState.returnState,
    });
  }

  function handleAdopt(version: VersionRecord) {
    setPrompt(version.content);
    showToast(`${version.label} adopted into the current prompt.`, "success");
  }

  return (
    <div className="workbench-screen">
      <ComparisonTopBar />
      <main className="workbench-main workbench-main--comparison">
        <SplitPane
          ratio={ratio}
          onRatioChange={setRatio}
          left={(
            <PromptPanel
              title="Current Prompt"
              prompt={prompt}
              onPromptChange={setPrompt}
              charLabel={`Characters: ${prompt.length}`}
              placeholder="Enter your current prompt here..."
              variant="comparison"
            />
          )}
          right={(
            <section className="panel panel--results panel--results-compare">
              <ResultTabs
                activeTabId={activeVersionId}
                versions={versions}
                onSelectTab={setActiveVersionId}
                onCloseVersion={handleCloseVersion}
                trailing={<ComparisonTrailingAction onExit={handleExit} />}
              />
              {activeVersion ? (
                <DiffPanel
                  prompt={prompt}
                  version={activeVersion}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  onAdopt={() => handleAdopt(activeVersion)}
                  onCopied={() => showToast(`${activeVersion.label} copied to clipboard.`, "success")}
                />
              ) : null}
            </section>
          )}
        />
      </main>
      <StatusBar />
    </div>
  );
}
