import type { TFunction } from "i18next";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
  getDefaultComparisonPrompt,
  getDefaultComparisonVersions,
  relabelVersions,
} from "../lib/workbench";
import type { ComparisonRouteState, VersionRecord } from "../types";

const SPLIT_KEY = "promptopt.split.comparison";

function readRatio() {
  const stored = Number(window.localStorage.getItem(SPLIT_KEY));
  return Number.isFinite(stored) && stored > 0.2 && stored < 0.8 ? stored : 0.5;
}

function buildInitialState(routeState: unknown, t: TFunction<"workbench">): ComparisonRouteState {
  if (isComparisonState(routeState)) {
    return routeState;
  }

  const defaultComparisonVersions = getDefaultComparisonVersions(t);
  return {
    prompt: getDefaultComparisonPrompt(t),
    versions: defaultComparisonVersions,
    activeVersionId: defaultComparisonVersions[0].id,
  };
}

export function ComparisonPage() {
  const { t } = useTranslation("workbench");
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const routeState = useMemo(
    () => buildInitialState(location.state, t),
    [location.key, location.state],
  );
  const [prompt, setPrompt] = useState(routeState.prompt);
  const [versions, setVersions] = useState(routeState.versions);
  const [activeVersionId, setActiveVersionId] = useState(routeState.activeVersionId);
  const [viewMode, setViewMode] = useState<"preview" | "compare">("compare");
  const [ratio, setRatio] = useState(readRatio);

  useEffect(() => {
    document.title = t("workbench:pageTitle.comparison");
  }, [t]);

  useEffect(() => {
    setPrompt(routeState.prompt);
    setVersions(routeState.versions);
    setActiveVersionId(routeState.activeVersionId);
    setViewMode("compare");
  }, [routeState]);

  useEffect(() => {
    setVersions((current) => relabelVersions(current, t));
  }, [t]);

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
    showToast(t("workbench:toasts.adoptedToCurrentPrompt", { label: version.label }), "success");
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
              title={t("workbench:prompt.currentTitle")}
              prompt={prompt}
              onPromptChange={setPrompt}
              charLabel={t("workbench:prompt.comparisonCharCount", { count: prompt.length })}
              placeholder={t("workbench:prompt.comparisonPlaceholder")}
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
                  onCopied={() =>
                    showToast(t("workbench:toasts.copiedToClipboard", { label: activeVersion.label }), "success")
                  }
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
