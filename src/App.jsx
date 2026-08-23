import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./sections/Login";
import Register from "./sections/Register";
import AccountUnderReview from "./sections/AccountUnderReview";
import EmailVerification from "./sections/EmailVerification";
import EmailForgotPassword from "./components/EmailForgotPassword";
import PasswordEmailVerification from "./components/PasswordEmailVerification";
import ResetPassword from "./components/ResetPassword";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/email-forgot-password" element={<EmailForgotPassword />} />
          <Route path="/password-email-verification" element={<PasswordEmailVerification />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verification" element={<EmailVerification />} />
          <Route path="/account-under-review" element={<AccountUnderReview />} />
          
          {/* Catch All */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;