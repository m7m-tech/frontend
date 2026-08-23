import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const tokenFromUrl = queryParams.get("resetToken") || queryParams.get("token");

  // 🔑 البحث عن التوكن في كل المصادر الممكنة بترتيب الأولوية
  const resetToken =
    localStorage.getItem("resetToken") ||
    sessionStorage.getItem("resetToken") ||
    location.state?.resetToken ||
    tokenFromUrl ||
    "";

  // ✉️ البحث عن البريد في كل المصادر الممكنة
  const userEmail =
    localStorage.getItem("userEmail") ||
    sessionStorage.getItem("userEmail") ||
    location.state?.email ||
    "";

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 💾 مزامنة التوكن والإيميل فوراً وحفظهما بجميع وسائل التخزين
  useEffect(() => {
    const currentToken = location.state?.resetToken || tokenFromUrl;
    if (currentToken) {
      localStorage.setItem("resetToken", currentToken);
      sessionStorage.setItem("resetToken", currentToken);
    }

    const currentEmail = location.state?.email;
    if (currentEmail) {
      localStorage.setItem("userEmail", currentEmail);
      sessionStorage.setItem("userEmail", currentEmail);
    }
  }, [location.state, tokenFromUrl]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!resetToken) {
      setError("Reset token is missing or expired. Please request a new password reset.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

      const response = await fetch(`${baseUrl}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resetToken: resetToken,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = Array.isArray(data.message)
          ? data.message.join(" | ")
          : data.message || "Failed to reset password.";
        throw new Error(errorMessage);
      }

      const targetEmail = data?.email || userEmail;

      // 🧹 تنظيف الستوريدج بعد النجاح
      localStorage.removeItem("resetToken");
      sessionStorage.removeItem("resetToken");
      localStorage.removeItem("userEmail");
      sessionStorage.removeItem("userEmail");

      navigate("/login", {
        state: { email: targetEmail },
        replace: true,
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <main className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-10">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 text-center">
          Reset your password
        </h1>
        <p className="text-slate-500 text-sm text-center mt-2 mb-7">
          Choose a new password for{" "}
          <span className="font-semibold text-slate-700">
            {userEmail || "your account"}
          </span>
          .
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

          {error && <p className="text-red-500 text-xs text-left dir-ltr">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Saving..." : "Save new password"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ResetPassword;