import {
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { diffText } from "../lib/diff";
import {
  BoltIcon,
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  CopyIcon,
  LogoutIcon,
  MoonIcon,
  SunIcon,
} from "./Icons";
import type {
  ComparisonRouteState,
  DiagnosticIssue,
  ModelOption,
  VersionRecord,
} from "../types";

type ActiveTabId = "diagnostics" | string;

function badgeClass(label: string) {
  switch (label.toLowerCase()) {
    case "optimization":
      return "badge badge--mint";
    case "missing":
      return "badge badge--rose";
    default:
      return "badge badge--teal";
  }
}

export function BrandLockup({
  compact = false,
  title = "PromptOpt",
  subtitle,
}: {
  compact?: boolean;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className={`brand-lockup ${compact ? "is-compact" : ""}`}>
      <div className="brand-lockup__mark">
        <BoltIcon className="brand-lockup__icon" />
      </div>
      <div className="brand-lockup__copy">
        <span className="brand-lockup__title">{title}</span>
        {subtitle ? <span className="brand-lockup__subtitle">{subtitle}</span> : null}
      </div>
    </div>
  );
}

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="icon-button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <MoonIcon className="icon-button__icon" />
      ) : (
        <SunIcon className="icon-button__icon" />
      )}
    </button>
  );
}

export function ModelSelect({
  options,
  value,
  onChange,
}: {
  options: ModelOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="select-field">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="select-field__native"
      >
        {options.map((option) => (
          <option
            key={option.identifier}
            value={option.identifier}
            disabled={!option.available}
          >
            {option.available ? option.name : `${option.name} (Not configured)`}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="select-field__chevron" />
    </label>
  );
}

export function UserMenu() {
  const { session, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        type="button"
        className="user-menu__trigger"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="user-menu__avatar">{session?.initials ?? "JD"}</span>
      </button>
      {open ? (
        <div className="user-menu__dropdown" role="menu">
          <div className="user-menu__identity">
            <strong>{session?.displayName ?? "Jordan Doe"}</strong>
            <span>{session?.username ?? "Jordan Doe"}</span>
          </div>
          <button
            type="button"
            className="user-menu__action"
            onClick={logout}
          >
            <LogoutIcon className="user-menu__action-icon" />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function DiagnosticsTopBar({
  modelOptions,
  selectedModel,
  onSelectModel,
}: {
  modelOptions: ModelOption[];
  selectedModel: string;
  onSelectModel: (value: string) => void;
}) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        <BrandLockup compact title="PromptOpt" />
        <ModelSelect
          options={modelOptions}
          value={selectedModel}
          onChange={onSelectModel}
        />
      </div>
      <div className="topbar__right">
        <ThemeToggleButton />
        <UserMenu />
      </div>
    </header>
  );
}

export function ComparisonTopBar() {
  return (
    <header className="topbar topbar--comparison">
      <div className="topbar__left">
        <BrandLockup title="PromptOpt" subtitle="Workbench" />
      </div>
      <div className="topbar__right">
        <nav className="segment-nav" aria-label="Workbench sections">
          <button type="button" className="segment-nav__item">
            Project
          </button>
          <button type="button" className="segment-nav__item is-active">
            Workbench
          </button>
          <button type="button" className="segment-nav__item">
            History
          </button>
        </nav>
        <ThemeToggleButton />
        <UserMenu />
      </div>
    </header>
  );
}

interface PromptPanelProps {
  title: string;
  prompt: string;
  onPromptChange: (value: string) => void;
  charLabel: string;
  placeholder: string;
  variant: "diagnostics" | "comparison";
  showActions?: boolean;
  canSubmit?: boolean;
  loadingState?: "diagnose" | "optimize" | "optimize-diagnostics" | null;
  onDiagnose?: () => void;
  onOptimize?: () => void;
}

export function PromptPanel({
  title,
  prompt,
  onPromptChange,
  charLabel,
  placeholder,
  variant,
  showActions = false,
  canSubmit = false,
  loadingState = null,
  onDiagnose,
  onOptimize,
}: PromptPanelProps) {
  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.key !== "Tab") {
      return;
    }

    event.preventDefault();
    const textarea = event.currentTarget;
    const { selectionStart, selectionEnd } = textarea;
    const nextValue =
      prompt.slice(0, selectionStart) + "  " + prompt.slice(selectionEnd);
    onPromptChange(nextValue);

    window.requestAnimationFrame(() => {
      textarea.selectionStart = selectionStart + 2;
      textarea.selectionEnd = selectionStart + 2;
    });
  }

  const textareaProps: TextareaHTMLAttributes<HTMLTextAreaElement> = {
    className: `editor-textarea editor-textarea--${variant}`,
    value: prompt,
    onChange: (event) => onPromptChange(event.target.value),
    placeholder,
    onKeyDown: handleKeyDown,
  };

  return (
    <section className={`panel panel--editor panel--${variant}`}>
      <div className="panel__header">
        <h2 className={`panel__title ${variant === "comparison" ? "is-uppercase" : ""}`}>
          {title}
        </h2>
        <span className="panel__meta">{charLabel}</span>
      </div>
      <div className={`panel__body panel__body--${variant}`}>
        <textarea {...textareaProps} />
      </div>
      {showActions ? (
        <div className="panel__footer-actions">
          <button
            type="button"
            className="button button--ghost"
            onClick={onDiagnose}
            disabled={!canSubmit || loadingState !== null}
          >
            {loadingState === "diagnose" ? "Diagnosing..." : "Diagnose"}
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={onOptimize}
            disabled={!canSubmit || loadingState !== null}
          >
            {loadingState === "optimize" ? "Optimizing..." : "Optimize"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

export function ResultTabs({
  activeTabId,
  versions,
  onSelectTab,
  onCloseVersion,
  showDiagnosticsTab,
  trailing,
}: {
  activeTabId: ActiveTabId;
  versions: VersionRecord[];
  onSelectTab: (tabId: ActiveTabId) => void;
  onCloseVersion: (versionId: string) => void;
  showDiagnosticsTab?: boolean;
  trailing?: ReactNode;
}) {
  return (
    <div className="results-tabs">
      <div className="results-tabs__list" role="tablist">
        {showDiagnosticsTab ? (
          <button
            type="button"
            role="tab"
            className={`results-tab ${activeTabId === "diagnostics" ? "is-active" : ""}`}
            onClick={() => onSelectTab("diagnostics")}
          >
            Diagnostics
          </button>
        ) : null}
        {versions.map((version) => (
          <button
            key={version.id}
            type="button"
            role="tab"
            className={`results-tab ${activeTabId === version.id ? "is-active" : ""}`}
            onClick={() => onSelectTab(version.id)}
          >
            <span>{version.label}</span>
            <span
              className="results-tab__close"
              onClick={(event) => {
                event.stopPropagation();
                onCloseVersion(version.id);
              }}
              aria-hidden
            >
              <CloseIcon className="results-tab__close-icon" />
            </span>
          </button>
        ))}
      </div>
      {trailing ? <div className="results-tabs__trailing">{trailing}</div> : null}
    </div>
  );
}

export function DiagnosticsPanel({
  issues,
  onOptimize,
  isLoading,
}: {
  issues: DiagnosticIssue[];
  onOptimize: () => void;
  isLoading: boolean;
}) {
  return (
    <section className="results-shell">
      <div className="results-scroll">
        {issues.map((issue) => (
          <article key={issue.id} className="diagnostic-card">
            <div className="diagnostic-card__header">
              <span className={badgeClass(issue.label)}>{issue.label}</span>
              <h3 className="diagnostic-card__title">{issue.title}</h3>
            </div>
            <p className="diagnostic-card__body">{issue.description}</p>
            <div className="diagnostic-card__suggestion">
              <span className="diagnostic-card__suggestion-label">Suggestion</span>
              <p>{issue.suggestion}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="results-footer">
        <button type="button" className="button button--accent button--wide" onClick={onOptimize}>
          <BoltIcon className="button__icon" />
          {isLoading ? "Optimizing..." : "Optimize based on diagnostics"}
        </button>
      </div>
    </section>
  );
}

async function writeToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export function VersionPanel({
  version,
  onAdopt,
  onCompare,
  onCopied,
}: {
  version: VersionRecord;
  onAdopt: () => void;
  onCompare: () => void;
  onCopied: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await writeToClipboard(version.content);
    setCopied(true);
    onCopied();
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className="results-shell">
      <div className="results-scroll">
        <div className="version-card">
          <pre className="version-card__content">{version.content}</pre>
        </div>
      </div>
      <div className="results-footer results-footer--inline">
        <div className="button-row">
          <button type="button" className="button button--accent" onClick={onAdopt}>
            Adopt
          </button>
          <button type="button" className="button button--ghost" onClick={handleCopy}>
            {copied ? <CheckIcon className="button__icon" /> : <CopyIcon className="button__icon" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <button type="button" className="button button--ghost" onClick={onCompare}>
          Compare
        </button>
      </div>
    </section>
  );
}

export function DiffPanel({
  prompt,
  version,
  viewMode,
  onViewModeChange,
  onAdopt,
  onCopied,
}: {
  prompt: string;
  version: VersionRecord;
  viewMode: "preview" | "compare";
  onViewModeChange: (mode: "preview" | "compare") => void;
  onAdopt: () => void;
  onCopied: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const diffChunks = useMemo(() => diffText(prompt, version.content), [prompt, version.content]);

  async function handleCopy() {
    await writeToClipboard(version.content);
    setCopied(true);
    onCopied();
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className="results-shell">
      <div className="results-scroll results-scroll--compare">
        <div className="diff-card">
          {viewMode === "preview" ? (
            <pre className="version-card__content">{version.content}</pre>
          ) : (
            <div className="diff-card__content">
              {diffChunks.map((chunk, index) => (
                <span
                  key={`${chunk.type}-${index}`}
                  className={
                    chunk.type === "added"
                      ? "diff-card__chunk is-added"
                      : chunk.type === "removed"
                        ? "diff-card__chunk is-removed"
                        : undefined
                  }
                >
                  {chunk.value}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="results-footer results-footer--inline">
        <div className="button-row">
          <button type="button" className="button button--accent" onClick={onAdopt}>
            Adopt
          </button>
          <button type="button" className="button button--ghost" onClick={handleCopy}>
            {copied ? <CheckIcon className="button__icon" /> : <CopyIcon className="button__icon" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="toggle-pill">
          <button
            type="button"
            className={`toggle-pill__item ${viewMode === "preview" ? "is-active" : ""}`}
            onClick={() => onViewModeChange("preview")}
          >
            Preview
          </button>
          <button
            type="button"
            className={`toggle-pill__item ${viewMode === "compare" ? "is-active" : ""}`}
            onClick={() => onViewModeChange("compare")}
          >
            Compare
          </button>
        </div>
      </div>
    </section>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <BoltIcon className="empty-state__icon-svg" />
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}

export function ComparisonTrailingAction({
  onExit,
}: {
  onExit: () => void;
}) {
  return (
    <button type="button" className="button button--ghost button--small" onClick={onExit}>
      <CloseIcon className="button__icon" />
      Exit Comparison
    </button>
  );
}

export function StatusBar() {
  return (
    <footer className="status-bar">
      <div>Prompt Optimization Tool v2.4.1</div>
      <div className="status-bar__right">
        <span>Ready</span>
        <span className="status-pill">
          <span className="status-pill__dot" />
          System Online
        </span>
      </div>
    </footer>
  );
}

export function WorkbenchLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link to={to} className="link-button">
      {children}
    </Link>
  );
}

export function isComparisonState(value: unknown): value is ComparisonRouteState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ComparisonRouteState>;
  return (
    typeof candidate.prompt === "string" &&
    Array.isArray(candidate.versions) &&
    typeof candidate.activeVersionId === "string"
  );
}
