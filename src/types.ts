export type ThemeMode = "light" | "dark";

export type ToastTone = "neutral" | "success" | "error";

export interface Session {
  username: string;
  displayName: string;
  initials: string;
}

export interface ModelOption {
  name: string;
  identifier: string;
  available: boolean;
}

export interface DiagnosticIssue {
  id: string;
  label: string;
  title: string;
  description: string;
  suggestion: string;
}

export interface VersionRecord {
  id: string;
  label: string;
  content: string;
}

export interface DiagnosticsRouteState {
  prompt: string;
  issues: DiagnosticIssue[];
  versions: VersionRecord[];
  activeTabId: string;
}

export interface ComparisonRouteState {
  prompt: string;
  versions: VersionRecord[];
  activeVersionId: string;
  returnState?: DiagnosticsRouteState;
}
