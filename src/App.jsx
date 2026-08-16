import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./sections/Login";
import Register from "./sections/Register";
import AccountUnderReview from "./sections/AccountUnderReview";
import EmailVerification from "./sections/EmailVerification";

function ProtectedRoute({ children }) {
  const { user, isLoading, isEmailVerified } = useAuth();
  const isAuthenticated =
    Boolean(user) ||
    localStorage.getItem("smartroute-authenticated") === "true";
  const shouldAllowAccess =
    isAuthenticated &&
    (isEmailVerified || window.location.pathname === "/verification");

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!shouldAllowAccess) {
    return <Navigate to="/verification" replace />;
  }

  return children;
}

function GuestRoute({ children }) {
  const { user, isLoading, isEmailVerified } = useAuth();
  const location = useLocation();
  const isAuthenticated =
    Boolean(user) ||
    localStorage.getItem("smartroute-authenticated") === "true";

  if (isLoading) {
    return null;
  }

  if (["/login", "/register"].includes(location.pathname)) {
    return children;
  }

  if (!isAuthenticated) {
    return children;
  }

  return isEmailVerified ? (
    <Navigate to="/account-under-review" replace />
  ) : (
    <Navigate to="/verification" replace />
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />
          <Route
            path="/verification"
            element={
              <ProtectedRoute>
                <EmailVerification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account-under-review"
            element={
              <ProtectedRoute>
                <AccountUnderReview />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
