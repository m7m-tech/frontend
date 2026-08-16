import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("smartroute-user");
      const savedAuth = localStorage.getItem("smartroute-authenticated");

      if (savedUser) {
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

  //   لتجربة حالة اللودينح مستخدم الكود هادا
  // useEffect(() => {
  //   // تأخير لمدة 2 ثانية لرؤية الـ Spinner
  //   const timer = setTimeout(() => {
  //     try {
  //       const savedUser = localStorage.getItem("smartroute-user");
  //       const savedAuth = localStorage.getItem("smartroute-authenticated");

  //       if (savedUser) {
  //         setUser(JSON.parse(savedUser));
  //         setIsAuthenticated(savedAuth === "true");
  //       }
  //     } catch (error) {
  //       console.error("Failed to restore auth state:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }, 2000); // 2000ms = 2 seconds

  //   return () => clearTimeout(timer); // Cleanup
  // }, []);

  const login = (userData) => {
    const normalizedUser = {
      id: userData.id || Date.now().toString(),
      emailVerified: false,
      ...userData,
    };

    setUser(normalizedUser);
    setIsAuthenticated(true);
    setIsEmailVerified(false);
    localStorage.setItem("smartroute-user", JSON.stringify(normalizedUser));
    localStorage.setItem("smartroute-authenticated", "true");
  };

  const register = (userData) => {
    login(userData);
  };

  const verifyEmail = () => {
    setIsEmailVerified(true);
    setUser((currentUser) => {
      const updatedUser = currentUser
        ? { ...currentUser, emailVerified: true }
        : { emailVerified: true };
      localStorage.setItem("smartroute-user", JSON.stringify(updatedUser));
      return updatedUser;
    });
    localStorage.setItem("smartroute-authenticated", "true");
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
