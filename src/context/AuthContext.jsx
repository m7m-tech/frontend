import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://backend-gateway-wdzv.onrender.com";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const COMPANY_ID_KEY = "smartroute-company-id";

// Every auth endpoint here wraps its real payload as { success, data, timestamp }.
const unwrapEnvelope = (payload) => payload?.data ?? payload;

// A company's own id (company_profiles.id in the DB) is a separate row from
// the user that owns it — confirmed NOT the same as user.id, so don't guess
// at that equivalence. Only trust an explicit companyId-shaped field.
const extractCompanyId = (payload) =>
  payload?.companyId ||
  payload?.company?.id ||
  payload?.companyProfile?.id ||
  payload?.user?.companyId ||
  payload?.user?.company?.id ||
  payload?.user?.companyProfile?.id ||
  null;

const decodeJwtClaims = (token) => {
  try {
    const payloadSegment = token.split(".")[1];
    const decoded = atob(payloadSegment.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
};

const decodeJwtCompanyId = (token) => extractCompanyId(decodeJwtClaims(token));

// The backend's approval status (PENDING/APPROVED/REJECTED/SUSPENDED) lives
// on company_profiles.status, but per the backend dev it should surface
// directly on the authenticated user object once merged server-side — check
// every plausible shape for that merge so whichever one ships just works.
const extractAccountStatus = (payload) =>
  payload?.status ||
  payload?.user?.status ||
  payload?.company?.status ||
  payload?.companyProfile?.status ||
  payload?.user?.company?.status ||
  payload?.user?.companyProfile?.status ||
  null;

const extractRejectionReason = (payload) =>
  payload?.rejectionReason ||
  payload?.user?.rejectionReason ||
  payload?.company?.rejectionReason ||
  payload?.companyProfile?.rejectionReason ||
  payload?.user?.company?.rejectionReason ||
  payload?.user?.companyProfile?.rejectionReason ||
  null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Every function below is wrapped in useCallback with an empty dependency
  // array so its identity stays stable across renders — none of them need
  // to close over component state (they read fresh data from localStorage
  // or the network instead). This matters because AccountUnderReview's
  // effect depends on checkCompanyStatus's identity: without a stable
  // reference, each setUser() call here would hand out a new
  // checkCompanyStatus, re-triggering that effect, calling fetchCurrentUser
  // again, calling setUser again — an infinite request loop.
  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setIsEmailVerified(false);
    localStorage.removeItem("smartroute-user");
    localStorage.removeItem("smartroute-authenticated");
    localStorage.removeItem("smartroute-auth-expiry");
    localStorage.removeItem("token");
    localStorage.removeItem("resetToken");
    localStorage.removeItem(COMPANY_ID_KEY);
    sessionStorage.removeItem("resetToken");
  }, []);

  // The authoritative source for the logged-in user, including their
  // company's live approval status (data.companyProfile on this response) —
  // confirmed working now that the backend deployed GET /auth/me. Used to
  // refresh status on demand (checkCompanyStatus) and on session restore, so
  // a status change made by an admin while the user was away isn't missed.
  const fetchCurrentUser = useCallback(async (signal) => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    });

    if (!response.ok) return null;

    const body = await response.json();
    const freshUser = unwrapEnvelope(body);
    if (!freshUser) return null;

    const normalizedUser = {
      ...freshUser,
      emailVerified: freshUser.isActive ?? true,
      status: extractAccountStatus(freshUser),
      rejectionReason: extractRejectionReason(freshUser),
    };

    setUser(normalizedUser);
    setIsAuthenticated(true);
    setIsEmailVerified(normalizedUser.emailVerified);
    localStorage.setItem("smartroute-user", JSON.stringify(normalizedUser));
    localStorage.setItem("smartroute-authenticated", "true");

    const companyId = extractCompanyId(freshUser);
    if (companyId) localStorage.setItem(COMPANY_ID_KEY, companyId);

    return normalizedUser;
  }, []);

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

          // Not refreshing from /auth/me here on purpose: whichever screen
          // actually needs live status (e.g. account-under-review, via
          // checkCompanyStatus) already fetches it itself. Doing it again
          // here as well doubled every page load's request count and was
          // enough, combined with React StrictMode's dev-only double-invoke,
          // to trip the backend's rate limiter (429) on a single reload.
        }
      }
    } catch (error) {
      console.error("Failed to restore auth state:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password, rememberMe = false) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      // Backend wraps the real payload as { success, data, timestamp }, and
      // /auth/login nests its tokens one level deeper under data.tokens.
      const data = unwrapEnvelope(response.data);
      const token =
        data?.accessToken || data?.token || data?.access_token || data?.tokens?.accessToken;
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
        status: extractAccountStatus(data) || userData.status || null,
        rejectionReason: extractRejectionReason(data) || userData.rejectionReason || null,
      };

      setUser(normalizedUser);
      setIsAuthenticated(true);
      setIsEmailVerified(normalizedUser.emailVerified);

      const expiryDuration = rememberMe ? SEVEN_DAYS_MS : ONE_DAY_MS;
      const expiryTimestamp = Date.now() + expiryDuration;

      localStorage.setItem("smartroute-user", JSON.stringify(normalizedUser));
      localStorage.setItem("smartroute-authenticated", "true");
      localStorage.setItem("smartroute-auth-expiry", expiryTimestamp.toString());

      const companyId = extractCompanyId(data) || (token && decodeJwtCompanyId(token));
      if (companyId) localStorage.setItem(COMPANY_ID_KEY, companyId);

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
  }, []);

  const register = useCallback(async (userData) => {
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

      const companyId = extractCompanyId(unwrapEnvelope(data));
      if (companyId) localStorage.setItem(COMPANY_ID_KEY, companyId);

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        message: "Server connection error. Please check your network.",
      };
    }
  }, []);

  // تم التعديل: إظهار companyName وتمرير قيمة افتراضية لتفادي خطأ Validation الباك إند
  const googleLogin = useCallback(async (
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

      const data = unwrapEnvelope(response.data);
      const token =
        data?.accessToken || data?.token || data?.access_token || data?.tokens?.accessToken;
      const userData = data?.user || data;

      if (token) {
        localStorage.setItem("token", token);
      }

      const normalizedUser = {
        ...userData,
        emailVerified: true,
        status: extractAccountStatus(data) || userData.status || null,
        rejectionReason: extractRejectionReason(data) || userData.rejectionReason || null,
      };

      setUser(normalizedUser);
      setIsAuthenticated(true);
      setIsEmailVerified(true);

      const expiryTimestamp = Date.now() + SEVEN_DAYS_MS;
      localStorage.setItem("smartroute-user", JSON.stringify(normalizedUser));
      localStorage.setItem("smartroute-authenticated", "true");
      localStorage.setItem("smartroute-auth-expiry", expiryTimestamp.toString());

      const companyId = extractCompanyId(data) || (token && decodeJwtCompanyId(token));
      if (companyId) localStorage.setItem(COMPANY_ID_KEY, companyId);

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
  }, []);

  const verifyEmail = useCallback(async (email, otp) => {
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

      // Signup's OTP step may also hand back a real access token (separate
      // from resetToken, which is for the password-reset flow) — store it
      // the same way login() does so the account-under-review screen has an
      // authenticated session to read status from right after signup.
      const accessToken =
        res.data?.accessToken || res.data?.token || res.accessToken || res.token;
      if (accessToken) {
        localStorage.setItem("token", accessToken);
      }

      const companyId = extractCompanyId(res.data) || extractCompanyId(res);
      if (companyId) localStorage.setItem(COMPANY_ID_KEY, companyId);

      // Nothing else in the signup flow calls login(), so this is the only
      // place the just-created user (and their approval status, if the
      // backend includes it here) ever lands in context.
      const verifiedUser = res.data?.user || res.user;
      if (verifiedUser) {
        const normalizedUser = {
          ...verifiedUser,
          emailVerified: true,
          status: extractAccountStatus(res.data) || verifiedUser.status || null,
          rejectionReason:
            extractRejectionReason(res.data) || verifiedUser.rejectionReason || null,
        };

        setUser(normalizedUser);
        setIsAuthenticated(Boolean(accessToken));
        setIsEmailVerified(true);

        localStorage.setItem("smartroute-user", JSON.stringify(normalizedUser));
        localStorage.setItem("smartroute-authenticated", String(Boolean(accessToken)));
        localStorage.setItem(
          "smartroute-auth-expiry",
          (Date.now() + ONE_DAY_MS).toString()
        );
      }

      return { success: true, resetToken, data: res };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, []);

  // companyId isn't returned by register/verify-otp — resolve it from
  // whichever source actually has it: a cached value from a prior auth call
  // (fetchCurrentUser keeps this fresh via /auth/me), or decoded straight
  // out of the JWT as a last resort. Deliberately doesn't read component
  // state (`user`) here — this is only called from the useCallback-stable
  // checkCompanyStatus below, and depending on `user` would make that
  // unstable across renders.
  const resolveCompanyId = () => {
    const cached = localStorage.getItem(COMPANY_ID_KEY);
    if (cached) return cached;

    const token = localStorage.getItem("token");
    return (token && decodeJwtCompanyId(token)) || null;
  };

  // Used by the account-under-review screen to read a company's approval
  // status. GET /auth/me is the confirmed, authoritative source — its
  // data.companyProfile carries { status, rejectionReason }, read via the
  // same extract* helpers used everywhere else. The old
  // GET /companies/:id/status call is kept as a fallback only for the
  // unlikely case /auth/me itself is unreachable but a companyId was
  // already cached from an earlier successful call.
  const checkCompanyStatus = useCallback(async (signal) => {
    try {
      const freshUser = await fetchCurrentUser(signal);
      const status = extractAccountStatus(freshUser);

      if (status) {
        return {
          success: true,
          status,
          message: extractRejectionReason(freshUser) || undefined,
        };
      }
    } catch (error) {
      if (error.name === "AbortError") throw error;
      // fall through to the legacy endpoint below
    }

    const token = localStorage.getItem("token");
    const companyId = resolveCompanyId();

    if (!companyId) {
      return {
        success: false,
        message: "We couldn't find your company. Please try logging in again.",
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/status`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        signal,
      });

      if (!response.ok) {
        // A 404 means this id is wrong (e.g. a stale value cached before the
        // user.id-vs-companyId fix) — drop it so the next attempt doesn't
        // keep repeating the same bad request instead of failing honestly.
        if (response.status === 404) {
          localStorage.removeItem(COMPANY_ID_KEY);
        }

        return {
          success: false,
          message: "Couldn't refresh your status right now. Please try again later.",
        };
      }

      const body = await response.json();
      const { status, message } = body?.data || {};

      return { success: true, status, message };
    } catch (error) {
      if (error.name === "AbortError") throw error;

      return {
        success: false,
        message: "Couldn't refresh your status right now. Please try again later.",
      };
    }
  }, [fetchCurrentUser]);

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
      checkCompanyStatus,
      fetchCurrentUser,
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