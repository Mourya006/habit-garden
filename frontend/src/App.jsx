import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SessionPage from "./pages/Session.jsx";
import Progress from "./pages/Progress.jsx";

import FloatingDashboard from "./components/FloatingDashboard.jsx";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {children}
      <FloatingDashboard />
    </>
  );
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#102719]">
      <div className="w-10 h-10 rounded-full border-2 border-garden-leaf border-t-transparent animate-spin" />
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>

      {/* =====================================================
          LOGIN
      ===================================================== */}

      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <Login />
          )
        }
      />

      {/* =====================================================
          SIGNUP
      ===================================================== */}

      <Route
        path="/signup"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <Signup />
          )
        }
      />

      {/* =====================================================
          FORGOT PASSWORD
      ===================================================== */}

      <Route
        path="/forgot-password"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <ForgotPassword />
          )
        }
      />

      {/* =====================================================
          RESET PASSWORD
      ===================================================== */}

      <Route
        path="/reset-password/:token"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <ResetPassword />
          )
        }
      />

      {/* =====================================================
          HOME — ALWAYS SKILL SELECTION
      ===================================================== */}

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Onboarding />
          </PrivateRoute>
        }
      />

      {/* Old onboarding URL */}

      <Route
        path="/onboarding"
        element={
          <Navigate to="/" replace />
        }
      />

      {/* =====================================================
          GARDEN
      ===================================================== */}

      <Route
        path="/garden"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* =====================================================
          SESSION
      ===================================================== */}

      <Route
        path="/session/:habitId"
        element={
          <PrivateRoute>
            <SessionPage />
          </PrivateRoute>
        }
      />

      {/* =====================================================
          PROGRESS
      ===================================================== */}

      <Route
        path="/progress"
        element={
          <PrivateRoute>
            <Progress />
          </PrivateRoute>
        }
      />

      <Route
        path="/progress/:habitId"
        element={
          <PrivateRoute>
            <Progress />
          </PrivateRoute>
        }
      />

      {/* =====================================================
          FALLBACK
      ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate to="/" replace />
        }
      />

    </Routes>
  );
}