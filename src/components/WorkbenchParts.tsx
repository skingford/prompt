import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { diffText } from "../lib/diff";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { CustomSelect } from "./CustomSelect";
import {
  BoltIcon,
  CheckIcon,
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

function badgeClass(
  label: string,
  optimizationLabel: string,
  missingLabel: string,
) {
  const normalized = label.toLowerCase();
  const optimizationTokens = new Set([optimizationLabel.toLowerCase(), "optimization", "可优化"]);
  const missingTokens = new Set([missingLabel.toLowerCase(), "missing", "缺失"]);

  if (optimizationTokens.has(normalized)) {
    return "badge badge--mint";
  }

  if (missingTokens.has(normalized)) {
    return "badge badge--rose";
  }

  return "badge badge--teal";
}

export function BrandLockup({
  compact = false,
  title,
  subtitle,
  mark = "bolt",
  showDivider = false,
}: {
  compact?: boolean;
  title?: string;
  subtitle?: string;
  mark?: "bolt" | "letter";
  showDivider?: boolean;
}) {
  const { t } = useTranslation("common");
  const resolvedTitle = title ?? t("common:brand.short");

  return (
    <div className={`brand-lockup ${compact ? "is-compact" : ""}`}>
      <div className={`brand-lockup__mark brand-lockup__mark--${mark}`}>
        {mark === "letter" ? (
          <span className="brand-lockup__letter">P</span>
        ) : (
          <BoltIcon className="brand-lockup__icon" />
        )}
      </div>
      <div className="brand-lockup__copy">
        <span className="brand-lockup__title">{resolvedTitle}</span>
        {subtitle ? (
          <>
            {showDivider ? <span className="brand-lockup__divider">|</span> : null}
            <span className="brand-lockup__subtitle">{subtitle}</span>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function ThemeToggleButton() {
  const { t } = useTranslation("common");
  const { theme, toggleTheme } = useTheme();
  const nextThemeLabel =
    theme === "light"
      ? t("common:theme.switchToDark")
      : t("common:theme.switchToLight");

  return (
    <button
      type="button"
      className="icon-button"
      onClick={toggleTheme}
      aria-pressed={theme === "dark"}
      aria-label={nextThemeLabel}
      title={nextThemeLabel}
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
  const { t } = useTranslation("common");

  return (
    <CustomSelect
      ariaLabel={t("common:modelSelector")}
      options={options.map((option) => ({
        label: option.name,
        value: option.identifier,
        disabled: !option.available,
        meta: option.available ? undefined : t("common:notConfigured"),
      }))}
      value={value}
      onChange={onChange}
    />
  );
}

export function UserMenu() {
  const { t } = useTranslation(["common", "workbench"]);
  const { session, logout } = useAuth();
  const closeTimerRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [renderMenu, setRenderMenu] = useState(false);
  const [closing, setClosing] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  function clearCloseTimer() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function openMenu() {
    clearCloseTimer();
    setClosing(false);
    setRenderMenu(true);
    setOpen(true);
  }

  function closeMenu() {
    if (!renderMenu) {
      setOpen(false);
      return;
    }

    setOpen(false);
    setClosing(true);
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setClosing(false);
      setRenderMenu(false);
      closeTimerRef.current = null;
    }, 160);
  }

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    }

    function handleWindowBlur() {
      closeMenu();
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      clearCloseTimer();
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [renderMenu]);

  return (
    <div
      className={["user-menu", open ? "is-open" : "", closing ? "is-closing" : ""]
        .filter(Boolean)
        .join(" ")}
      ref={menuRef}
    >
      <button
        type="button"
        className="user-menu__trigger"
        onClick={() => {
          if (open) {
            closeMenu();
          } else {
            openMenu();
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeMenu();
          }
        }}
        aria-label={t("common:accountMenu")}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="user-menu__avatar">{session?.initials ?? "JD"}</span>
      </button>
      {renderMenu ? (
        <div
          className={`user-menu__dropdown ${closing ? "is-closing" : ""}`}
          role="menu"
        >
          <div className="user-menu__identity">
            <strong>{session?.displayName ?? t("common:account")}</strong>
            <span>{session?.username ?? t("common:brand.short")}</span>
          </div>
          <div className="user-menu__section">
            <span className="user-menu__section-label">{t("workbench:menu.language")}</span>
            <LocaleSwitcher className="user-menu__locale" />
          </div>
          <button
            type="button"
            className="user-menu__action"
            onClick={logout}
          >
            <LogoutIcon className="user-menu__action-icon" />
            {t("common:logout")}
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
  const { t } = useTranslation("common");

  return (
    <header className="topbar">
      <div className="topbar__left">
        <BrandLockup compact title={t("common:brand.short")} mark="letter" />
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
  const { t } = useTranslation(["common", "workbench"]);

  return (
    <header className="topbar topbar--comparison">
      <div className="topbar__left">
        <BrandLockup
          title={t("common:brand.short")}
          subtitle={t("workbench:topbar.subtitle")}
          showDivider
        />
      </div>
      <div className="topbar__right">
        <nav className="segment-nav" aria-label={t("workbench:topbar.navAria")}>
          <button type="button" className="segment-nav__item">
            {t("workbench:topbar.nav.project")}
          </button>
          <button type="button" className="segment-nav__item is-active">
            {t("workbench:topbar.nav.workbench")}
          </button>
          <button type="button" className="segment-nav__item">
            {t("workbench:topbar.nav.history")}
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
  const { t } = useTranslation("workbench");

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
            {loadingState === "diagnose"
              ? t("workbench:actions.diagnosing")
              : t("workbench:actions.diagnose")}
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={onOptimize}
            disabled={!canSubmit || loadingState !== null}
          >
            {loadingState === "optimize"
              ? t("workbench:actions.optimizing")
              : t("workbench:actions.optimize")}
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
  const { t } = useTranslation("workbench");

  return (
    <div className="results-tabs">
      <div className="results-tabs__list" role="tablist">
        {showDiagnosticsTab ? (
          <div className={`results-tab ${activeTabId === "diagnostics" ? "is-active" : ""}`}>
            <button
              type="button"
              role="tab"
              aria-selected={activeTabId === "diagnostics"}
              tabIndex={activeTabId === "diagnostics" ? 0 : -1}
              className="results-tab__button"
              onClick={() => onSelectTab("diagnostics")}
            >
              {t("workbench:tabs.diagnostics")}
            </button>
          </div>
        ) : null}
        {versions.map((version) => (
          <div
            key={version.id}
            className={`results-tab ${activeTabId === version.id ? "is-active" : ""}`}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTabId === version.id}
              tabIndex={activeTabId === version.id ? 0 : -1}
              className="results-tab__button"
              onClick={() => onSelectTab(version.id)}
            >
              <span>{version.label}</span>
            </button>
            <button
              type="button"
              className="results-tab__close"
              aria-label={t("workbench:tabs.closeVersion", { label: version.label })}
              onClick={(event) => {
                event.stopPropagation();
                onCloseVersion(version.id);
              }}
            >
              <CloseIcon className="results-tab__close-icon" />
            </button>
          </div>
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
  const { t } = useTranslation("workbench");
  const optimizationLabel = t("workbench:badges.optimization");
  const missingLabel = t("workbench:badges.missing");

  return (
    <section className="results-shell">
      <div className="results-scroll">
        <div className="results-stack">
          {issues.map((issue) => (
            <article key={issue.id} className="diagnostic-card">
              <div className="diagnostic-card__header">
                <span className={badgeClass(issue.label, optimizationLabel, missingLabel)}>
                  {issue.label}
                </span>
                <h3 className="diagnostic-card__title">{issue.title}</h3>
              </div>
              <p className="diagnostic-card__body">{issue.description}</p>
              <div className="diagnostic-card__suggestion">
                <span className="diagnostic-card__suggestion-label">
                  {t("workbench:states.suggestion")}
                </span>
                <p>{issue.suggestion}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="results-footer">
        <button type="button" className="button button--accent button--wide" onClick={onOptimize}>
          <BoltIcon className="button__icon" />
          {isLoading
            ? t("workbench:actions.optimizing")
            : t("workbench:actions.optimizeFromDiagnostics")}
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
  const { t } = useTranslation("workbench");
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
            {t("workbench:actions.adopt")}
          </button>
          <button type="button" className="button button--ghost" onClick={handleCopy}>
            {copied ? <CheckIcon className="button__icon" /> : <CopyIcon className="button__icon" />}
            {copied ? t("workbench:actions.copied") : t("workbench:actions.copy")}
          </button>
        </div>
        <button type="button" className="button button--ghost" onClick={onCompare}>
          {t("workbench:actions.compare")}
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
  const { t } = useTranslation("workbench");
  const [copied, setCopied] = useState(false);
  const diffChunks = useMemo(() => diffText(prompt, version.content), [prompt, version.content]);

  async function handleCopy() {
    await writeToClipboard(version.content);
    setCopied(true);
    onCopied();
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className="results-shell results-shell--compare">
      <div className="results-scroll results-scroll--compare">
        <div className="diff-card diff-card--comparison">
          {viewMode === "preview" ? (
            <pre className="version-card__content">{version.content}</pre>
          ) : (
            <div className="diff-card__content diff-card__content--comparison">
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
      <div className="results-footer results-footer--inline results-footer--compare">
        <div className="button-row button-row--compare">
          <button type="button" className="button button--accent" onClick={onAdopt}>
            {t("workbench:actions.adopt")}
          </button>
          <button type="button" className="button button--ghost" onClick={handleCopy}>
            {copied ? <CheckIcon className="button__icon" /> : <CopyIcon className="button__icon" />}
            {copied ? t("workbench:actions.copied") : t("workbench:actions.copy")}
          </button>
        </div>
        <div className="toggle-pill toggle-pill--compare">
          <button
            type="button"
            className={`toggle-pill__item ${viewMode === "preview" ? "is-active" : ""}`}
            onClick={() => onViewModeChange("preview")}
          >
            {t("workbench:actions.preview")}
          </button>
          <button
            type="button"
            className={`toggle-pill__item ${viewMode === "compare" ? "is-active" : ""}`}
            onClick={() => onViewModeChange("compare")}
          >
            {t("workbench:actions.compare")}
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
  const { t } = useTranslation("workbench");

  return (
    <button
      type="button"
      className="button comparison-trailing-action"
      onClick={onExit}
    >
      <CloseIcon className="button__icon" />
      {t("workbench:actions.exitComparison")}
    </button>
  );
}

export function StatusBar() {
  const { t } = useTranslation(["common", "workbench"]);

  return (
    <footer className="status-bar">
      <div>{t("common:brand.full")} v2.4.1</div>
      <div className="status-bar__right">
        <span>{t("workbench:states.ready")}</span>
        <span className="status-pill">
          <span className="status-pill__dot" />
          {t("workbench:states.systemOnline")}
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
