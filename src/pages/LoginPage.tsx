import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { BoltIcon } from "../components/Icons";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Enter both username and password to continue.");
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
      setError("We could not sign you in. Please try again.");
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
          <h1>Prompt Optimization Tool</h1>
          <p>Refine your AI interactions with precision</p>
        </header>

        <section className="auth-card">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="text-field"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
              />
            </div>

            <div className="field-group">
              <div className="field-group__meta">
                <label htmlFor="password">Password</label>
                <button type="button" className="inline-link">
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                className="text-field"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error ? <p className="form-error">{error}</p> : null}

            <button type="submit" className="button button--primary button--wide" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>

            <p className="auth-form__footnote">
              Don&apos;t have an account?{" "}
              <button type="button" className="inline-link inline-link--strong">
                Sign up for free
              </button>
            </p>
          </form>
        </section>

        <footer className="login-footer">
          <div className="login-footer__links">
            <button type="button">Privacy Policy</button>
            <button type="button">Terms of Service</button>
            <button type="button">Support</button>
          </div>
          <p>© 2023 Prompt Optimization Tool. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
