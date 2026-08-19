import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    console.log("Reset password requested for:", state?.email);
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <main className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-10">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 text-center">
          Reset your password
        </h1>
        <p className="text-slate-500 text-sm text-center mt-2 mb-7">
          Choose a new password for {state?.email || "your account"}.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="New password"
            autoComplete="new-password"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <input
            type="password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            Save new password
          </button>
        </form>
      </main>
    </div>
  );
};

export default ResetPassword;
