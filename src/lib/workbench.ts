import type { TFunction } from "i18next";
import type {
  DiagnosticIssue,
  ModelOption,
  VersionRecord,
} from "../types";

type WorkbenchT = TFunction<"workbench">;

export const models: ModelOption[] = [
  { name: "GPT-5.4", identifier: "gpt-5.4", available: true },
  { name: "Claude", identifier: "claude", available: false },
  { name: "Gemini Pro", identifier: "gemini-pro", available: false },
  { name: "Llama 3", identifier: "llama-3", available: false },
];

export const DEFAULT_MODEL_IDENTIFIER =
  models.find((model) => model.available)?.identifier ?? "gpt-5.4";

function issueFromPath(t: WorkbenchT, path: string): DiagnosticIssue {
  return {
    id: path.split(".").pop() ?? path,
    label: t(path + ".label"),
    title: t(path + ".title"),
    description: t(path + ".description"),
    suggestion: t(path + ".suggestion"),
  };
}

export function getVersionLabel(t: WorkbenchT, count: number) {
  return t("workbench:tabs.versionLabel", { count });
}

export function getDefaultDiagnosticsPrompt(t: WorkbenchT) {
  return t("workbench:mock.defaultDiagnosticsPrompt");
}

export function getDefaultComparisonPrompt(t: WorkbenchT) {
  return t("workbench:mock.defaultComparisonPrompt");
}

export function getDefaultDiagnosticsIssues(t: WorkbenchT): DiagnosticIssue[] {
  return [
    issueFromPath(t, "workbench:mock.defaultDiagnosticsIssues.audience"),
    issueFromPath(t, "workbench:mock.defaultDiagnosticsIssues.scope"),
    issueFromPath(t, "workbench:mock.defaultDiagnosticsIssues.constraint"),
  ];
}

export function getDefaultDiagnosticsVersions(t: WorkbenchT): VersionRecord[] {
  return [
    {
      id: "diag-v1",
      label: getVersionLabel(t, 1),
      content: t("workbench:mock.defaultDiagnosticsVersions.v1"),
    },
    {
      id: "diag-v2",
      label: getVersionLabel(t, 2),
      content: t("workbench:mock.defaultDiagnosticsVersions.v2"),
    },
  ];
}

export function relabelVersions(versions: VersionRecord[], t: WorkbenchT) {
  let changed = false;

  const nextVersions = versions.map((version, index) => {
    const nextLabel = getVersionLabel(t, index + 1);
    if (version.label === nextLabel) {
      return version;
    }

    changed = true;
    return {
      ...version,
      label: nextLabel,
    };
  });

  return changed ? nextVersions : versions;
}

export function getDefaultComparisonVersions(t: WorkbenchT): VersionRecord[] {
  return [
    {
      id: "travel-v1",
      label: getVersionLabel(t, 1),
      content: t("workbench:mock.defaultComparisonVersions.v1"),
    },
    {
      id: "travel-v2",
      label: getVersionLabel(t, 2),
      content: t("workbench:mock.defaultComparisonVersions.v2"),
    },
  ];
}

export function sleep(ms = 700) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

const audienceKeywords = [
  /\b(audience|stakeholder|customer|executive|team|reader|decision-maker)\b/i,
  /(受众|对象|利益相关方|高管|管理层|读者|决策者)/,
];
const formatKeywords = [
  /\b(checklist|outline|table|bullet|format|section|deliverable)\b/i,
  /(清单|提纲|表格|要点|格式|结构|分节|输出)/,
];
const timingKeywords = [
  /\b(asap|urgent|next week|tomorrow|deadline)\b/i,
  /(尽快|紧急|下周|明天|截止)/,
];
const toneKeywords = [
  /\b(tone|voice|style|professional|friendly|formal|warm)\b/i,
  /(语气|风格|专业|正式|友好|温暖)/,
];
const stakeholderPromptKeywords = [
  /(stakeholder presentation|stakeholder|executive)/i,
  /(利益相关方|汇报|高管|演示文稿|汇报材料)/,
];
const travelPromptKeywords = [
  /(tokyo|jr pass|shinjuku|shibuya|suica)/i,
  /(东京|jr\s*pass|新宿|涩谷|西瓜卡|寿司|神社)/,
];

function includesKeyword(prompt: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(prompt));
}

export function runMockDiagnosis(prompt: string, t: WorkbenchT): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = [];

  if (!includesKeyword(prompt, audienceKeywords)) {
    issues.push(issueFromPath(t, "workbench:mock.generatedIssues.audience"));
  }

  if (!includesKeyword(prompt, formatKeywords)) {
    issues.push(issueFromPath(t, "workbench:mock.generatedIssues.format"));
  }

  if (includesKeyword(prompt, timingKeywords)) {
    issues.push(issueFromPath(t, "workbench:mock.generatedIssues.timing"));
  }

  if (!includesKeyword(prompt, toneKeywords)) {
    issues.push(issueFromPath(t, "workbench:mock.generatedIssues.tone"));
  }

  if (issues.length === 0) {
    issues.push(issueFromPath(t, "workbench:mock.generatedIssues.refinement"));
  }

  return issues.slice(0, 3).map((issue, index) => ({
    ...issue,
    id: issue.id + "-" + index,
  }));
}

function optimizeStakeholderPrompt(versionIndex: number, t: WorkbenchT) {
  const versions = [
    t("workbench:mock.defaultDiagnosticsVersions.v1"),
    t("workbench:mock.defaultDiagnosticsVersions.v2"),
    t("workbench:mock.defaultDiagnosticsVersions.v3"),
    t("workbench:mock.defaultDiagnosticsVersions.v4"),
  ];

  return versions[versionIndex % versions.length];
}

function optimizeTravelPrompt(versionIndex: number, t: WorkbenchT) {
  const versions = [
    t("workbench:mock.defaultComparisonVersions.v1"),
    t("workbench:mock.defaultComparisonVersions.v2"),
    t("workbench:mock.defaultComparisonVersions.v3"),
    t("workbench:mock.defaultComparisonVersions.v4"),
  ];

  return versions[versionIndex % versions.length];
}

export function runMockOptimization(
  prompt: string,
  versionIndex: number,
  t: WorkbenchT,
  issues?: DiagnosticIssue[],
) {
  if (includesKeyword(prompt, stakeholderPromptKeywords)) {
    return optimizeStakeholderPrompt(versionIndex, t);
  }

  if (includesKeyword(prompt, travelPromptKeywords)) {
    return optimizeTravelPrompt(versionIndex, t);
  }

  const audienceHint = issues?.[0]?.title ?? t("workbench:mock.generatedIssues.audience.title");
  return [
    t("workbench:mock.genericOptimization.line1"),
    t("workbench:mock.genericOptimization.line2", { audience: audienceHint.toLowerCase() }),
    t("workbench:mock.genericOptimization.line3"),
    t("workbench:mock.genericOptimization.line4"),
    "",
    t("workbench:mock.genericOptimization.original", { prompt: prompt.trim() }),
  ].join("\n");
}
