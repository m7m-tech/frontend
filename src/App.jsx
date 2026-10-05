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
import Dashboard from "./sections/Dashboard";
import Orders from "./sections/Orders";
import Products from "./sections/Products";
import Drivers from "./sections/Drivers";
import LiveTracking from "./sections/LiveTracking";
import Operations from "./sections/Operations";
import Settings from "./sections/Settings";
import WhatsAppSetup from "./sections/WhatsAppSetup";
import AppLayout from "./components/layout/AppLayout";

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
          <Route path="/whatsapp-setup" element={<WhatsAppSetup />} />

          {/* Signed-in app: shared top navigation stays mounted across pages. */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/products" element={<Products />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/live-tracking" element={<LiveTracking />} />
            <Route path="/operations" element={<Operations />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;