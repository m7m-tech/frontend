import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

// تحديد الرابط الأساسي للـ API
const API_BASE_URL = "http://localhost:3000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // استرجاع جلسة المستخدم عند فتح التطبيق
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("smartroute-user");
      const savedAuth = localStorage.getItem("smartroute-authenticated");
      const token = localStorage.getItem("token");

      if (savedUser && token) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(savedAuth === "true");
        setIsEmailVerified(parsedUser?.emailVerified || false);
      }
    } catch (error) {
      console.error("Failed to restore auth state:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // دالة تسجيل الدخول الربط الفعلي مع الـ API
  const login = async (email, password) => {
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

      localStorage.setItem("smartroute-user", JSON.stringify(normalizedUser));
      localStorage.setItem("smartroute-authenticated", "true");

      return { success: true, data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        (Array.isArray(error.response?.data?.message)
          ? error.response.data.message[0]
          : "Invalid credentials or server error");

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
        return {
          success: false,
          message: data.message || "Registration failed. Please try again.",
        };
      }

      // حفظ البيانات مؤقتاً إذا كان يلزم
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        message: "Server connection error. Please check your network.",
      };
    }
  };

  const verifyEmail = async (email, otp) => {
    try {
      const response = await fetch("http://localhost:3000/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP code");
      }

      // يمكنك هنا حفظ الـ token إن كان الـ API يرجعه
      // if (data.token) localStorage.setItem("token", data.token);

      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsEmailVerified(false);
    localStorage.removeItem("smartroute-user");
    localStorage.removeItem("smartroute-authenticated");
    localStorage.removeItem("token");
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isEmailVerified,
      isLoading,
      login,
      register,
      verifyEmail,
      logout,
    }),
    [user, isAuthenticated, isEmailVerified, isLoading],
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
