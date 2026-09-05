import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://backend-gateway-wdzv.onrender.com";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsEmailVerified(false);
    localStorage.removeItem("smartroute-user");
    localStorage.removeItem("smartroute-authenticated");
    localStorage.removeItem("smartroute-auth-expiry");
    localStorage.removeItem("token");
    localStorage.removeItem("resetToken");
    sessionStorage.removeItem("resetToken");
  };

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("smartroute-user");
      const savedAuth = localStorage.getItem("smartroute-authenticated");
      const expiryTime = localStorage.getItem("smartroute-auth-expiry");
      const token = localStorage.getItem("token");

      if (savedUser && token && expiryTime) {
        const isExpired = Date.now() > parseInt(expiryTime, 10);

        if (isExpired) {
          logout();
        } else {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsAuthenticated(savedAuth === "true");
          setIsEmailVerified(parsedUser?.emailVerified || false);
        }
      }
    } catch (error) {
      console.error("Failed to restore auth state:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const data = response.data;
      const token = data?.accessToken || data?.token || data?.access_token;
      const userData = data?.user || {
        email,
        id: data?.id || Date.now().toString(),
      };

      if (token) {
        localStorage.setItem("token", token);
      }

      const normalizedUser = {
        ...userData,
        emailVerified: userData.emailVerified ?? false,
      };

      setUser(normalizedUser);
      setIsAuthenticated(true);
      setIsEmailVerified(normalizedUser.emailVerified);

      const expiryDuration = rememberMe ? SEVEN_DAYS_MS : ONE_DAY_MS;
      const expiryTimestamp = Date.now() + expiryDuration;

      localStorage.setItem("smartroute-user", JSON.stringify(normalizedUser));
      localStorage.setItem("smartroute-authenticated", "true");
      localStorage.setItem("smartroute-auth-expiry", expiryTimestamp.toString());

      return { success: true, data };
    } catch (error) {
      const rawMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.response?.data?.error;

      const errorMessage = Array.isArray(rawMessage)
        ? rawMessage[0]
        : typeof rawMessage === "string"
        ? rawMessage
        : "Invalid credentials or server error";

      return { success: false, message: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        const rawMessage =
          data?.error?.message ||
          data?.message ||
          (typeof data?.error === "string" ? data.error : null);

        const backendMessage = Array.isArray(rawMessage)
          ? rawMessage[0]
          : rawMessage || "Registration failed. Please try again.";

        const normalizedMessage =
          response.status === 409 &&
          (!backendMessage ||
            backendMessage.toLowerCase().includes("already exists") ||
            backendMessage.toLowerCase().includes("duplicate"))
            ? "User with this email or phone number already exists."
            : backendMessage;

        return { success: false, message: normalizedMessage };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        message: "Server connection error. Please check your network.",
      };
    }
  };

  // تم التعديل: إظهار companyName وتمرير قيمة افتراضية لتفادي خطأ Validation الباك إند
  const googleLogin = async (
    idToken,
    platform = "WEB",
    companyName = "N/A",
    registrationNumber = "N/A"
  ) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/google`, {
        idToken,
        platform,
        companyName: companyName || "N/A",
        registrationNumber: registrationNumber || "N/A",
      });

      const data = response.data;
      const token = data?.accessToken || data?.token || data?.access_token;
      const userData = data?.user || data;

      if (token) {
        localStorage.setItem("token", token);
      }

      const normalizedUser = {
        ...userData,
        emailVerified: true,
      };

      setUser(normalizedUser);
      setIsAuthenticated(true);
      setIsEmailVerified(true);

      const expiryTimestamp = Date.now() + SEVEN_DAYS_MS;
      localStorage.setItem("smartroute-user", JSON.stringify(normalizedUser));
      localStorage.setItem("smartroute-authenticated", "true");
      localStorage.setItem("smartroute-auth-expiry", expiryTimestamp.toString());

      return { success: true, data };
    } catch (error) {
      const rawMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.response?.data?.error;

      const errorMessage = Array.isArray(rawMessage)
        ? rawMessage[0]
        : typeof rawMessage === "string"
        ? rawMessage
        : "Google authentication failed";

      return { success: false, message: errorMessage };
    }
  };

  const verifyEmail = async (email, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const res = await response.json();

      if (!response.ok) {
        const errorMessage = Array.isArray(res.message)
          ? res.message.join(" | ")
          : res.message || "Invalid OTP code";
        throw new Error(errorMessage);
      }

      const resetToken = res.data?.resetToken || res.resetToken;

      if (resetToken) {
        localStorage.setItem("resetToken", resetToken);
        sessionStorage.setItem("resetToken", resetToken);
      }

      return { success: true, resetToken, data: res };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isEmailVerified,
      isLoading,
      login,
      googleLogin,
      register,
      verifyEmail,
      logout,
    }),
    [user, isAuthenticated, isEmailVerified, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-3 text-slate-600">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            <p className="text-sm font-medium">Loading your session...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;