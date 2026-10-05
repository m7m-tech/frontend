import axios from "axios";

// Same env convention (and fallback) AuthContext uses, so both layers always
// talk to the same gateway. AuthContext keeps its own requests untouched.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://backend-gateway-wdzv.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// The token lives where AuthContext puts it — read it per request rather
// than caching, so login/logout elsewhere is always reflected.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// AuthContext owns logout; the app layout registers a handler here so a 401
// from any new endpoint ends the session through that same logout.
let unauthorizedHandler = null;
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

export class ApiError extends Error {
  constructor(message, { status, data, cause } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.cause = cause;
  }
}

const pickMessage = (data) => {
  const raw = data?.error?.message || data?.message || (typeof data?.error === "string" ? data.error : null);
  if (Array.isArray(raw)) return raw[0];
  return typeof raw === "string" ? raw : null;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);

    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401 && unauthorizedHandler) unauthorizedHandler();

    let message = pickMessage(data);
    if (!error.response) message = "Can't reach the server. Check your connection and try again.";
    else if (status === 429) message = "Too many requests right now. Please wait a moment and try again.";
    else if (status >= 500) message = "The server ran into a problem. Please try again shortly.";

    return Promise.reject(new ApiError(message || "Something went wrong. Please try again.", { status, data, cause: error }));
  }
);

export default api;
