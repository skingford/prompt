import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { BoltIcon } from "../components/Icons";
import { LocaleSwitcher } from "../components/LocaleSwitcher";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { t } = useTranslation(["login"]);
  const { session, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (session) {
    return <Navigate to="/workbench/diagnostics" replace />;
  }

  useEffect(() => {
    document.title = t("login:pageTitle");
  }, [t]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError(t("login:errors.missingCredentials"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(username);
      const redirectTarget =
        (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
        "/workbench/diagnostics";
      navigate(redirectTarget, { replace: true });
    } catch {
      setError(t("login:errors.signInFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-shell">
        <header className="login-hero">
          <div className="login-hero__mark">
            <BoltIcon className="login-hero__icon" />
          </div>
          <h1>{t("login:title")}</h1>
          <p>{t("login:subtitle")}</p>
        </header>

        <section className="auth-card">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field-group">
              <label htmlFor="username">{t("login:fields.username")}</label>
              <input
                id="username"
                type="text"
                className="text-field"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder={t("login:placeholders.username")}
              />
            </div>

            <div className="field-group">
              <div className="field-group__meta">
                <label htmlFor="password">{t("login:fields.password")}</label>
                <button type="button" className="inline-link">
                  {t("login:forgotPassword")}
                </button>
              </div>
              <input
                id="password"
                type="password"
                className="text-field"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t("login:placeholders.password")}
              />
            </div>

            {error ? <p className="form-error">{error}</p> : null}

            <button type="submit" className="button button--primary button--wide" disabled={loading}>
              {loading ? t("login:submitLoading") : t("login:submit")}
            </button>

            <p className="auth-form__footnote">
              {t("login:signupLead")}{" "}
              <button type="button" className="inline-link inline-link--strong">
                {t("login:signupAction")}
              </button>
            </p>
          </form>
        </section>

        <footer className="login-footer">
          <LocaleSwitcher className="login-footer__locale" />
          <div className="login-footer__links">
            <button type="button">{t("login:footer.privacy")}</button>
            <button type="button">{t("login:footer.terms")}</button>
            <button type="button">{t("login:footer.support")}</button>
          </div>
          <p>{t("login:footer.copyright")}</p>
        </footer>
      </div>
    </main>
  );
}
