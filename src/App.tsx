import type { ReactElement } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ComparisonPage } from "./pages/ComparisonPage";
import { DiagnosticsPage } from "./pages/DiagnosticsPage";
import { LoginPage } from "./pages/LoginPage";

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { session } = useAuth();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function HomeRedirect() {
  const { session } = useAuth();
  return (
    <Navigate
      to={session ? "/workbench/diagnostics" : "/login"}
      replace
    />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/workbench/diagnostics"
        element={
          <ProtectedRoute>
            <DiagnosticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workbench/comparison"
        element={
          <ProtectedRoute>
            <ComparisonPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
