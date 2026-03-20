import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "../types";

const STORAGE_KEY = "promptopt.session";

interface AuthContextValue {
  session: Session | null;
  login: (username: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function buildSession(username: string): Session {
  const trimmed = username.trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const initials = parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : trimmed.slice(0, 2).toUpperCase();

  return {
    username: trimmed,
    displayName: trimmed || "Jordan Doe",
    initials: initials || "JD",
  };
}

function readInitialSession(): Session | null {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as Session;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(readInitialSession);

  const value = useMemo(
    () => ({
      session,
      login: async (username: string) => {
        await new Promise((resolve) => window.setTimeout(resolve, 700));
        const next = buildSession(username);
        setSession(next);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      },
      logout: () => {
        setSession(null);
        window.localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
