import api from "../api/axios";
import { unwrap } from "../api/envelope";

// Endpoints (gateway Swagger /api/docs + Postman "1. WhatsApp Management"):
//   POST /whatsapp/connect        { companyId }
//   GET  /whatsapp/qr?companyId=  (Postman shows a GET body; browsers can't
//                                  send one — Swagger documents the query param)
//   GET  /whatsapp/status?companyId=
//   POST /whatsapp/disconnect     { companyId }
// The legacy /whatsapp_get_status-style routes in Postman return 404.

export const WA_STATE = {
  CONNECTED: "connected",
  CONNECTING: "connecting",
  DISCONNECTED: "disconnected",
  NOT_CONFIGURED: "not_configured",
  UNKNOWN: "unknown",
};

// Response bodies aren't documented anywhere, so the raw value is mapped onto
// the states the UI needs. NOT_CONFIGURED is only ever produced from an
// explicit "no session" style value — never inferred from a plain
// disconnect — so an existing company is never pushed back into onboarding.
const RAW_TO_STATE = [
  [/^(connected|open|ready|authenticated|online|active|logged_?in|working)$/i, WA_STATE.CONNECTED],
  [/^(connecting|initiali[sz]ing|starting|qr|qr_?ready|qr_?generated|scan_?qr(_?code)?|pairing|pending|loading|syncing|opening|reconnecting)$/i, WA_STATE.CONNECTING],
  [/^(not_?configured|not_?initiali[sz]ed|not_?found|no_?session|none|new|unregistered|not_?connected_?yet|never_?connected)$/i, WA_STATE.NOT_CONFIGURED],
  [/^(disconnected|closed|close|logged_?out|logout|offline|failed|failure|expired|conflict|unpaired|stopped|inactive)$/i, WA_STATE.DISCONNECTED],
];

const readRawStatus = (body) => {
  if (typeof body === "string") return body;
  if (!body || typeof body !== "object") return null;
  const raw = body.status ?? body.state ?? body.connectionStatus ?? body.connectionState ?? body.sessionStatus;
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object") return readRawStatus(raw);
  return null;
};

export const normalizeStatus = (payload) => {
  const body = unwrap(payload);
  const raw = readRawStatus(body);

  let state = WA_STATE.UNKNOWN;
  if (body?.connected === true || body?.isConnected === true) state = WA_STATE.CONNECTED;
  else if (raw) state = RAW_TO_STATE.find(([re]) => re.test(raw.trim()))?.[1] ?? WA_STATE.UNKNOWN;
  else if (body?.connected === false || body?.isConnected === false) state = WA_STATE.DISCONNECTED;

  const phone =
    body?.phone || body?.phoneNumber || body?.number || body?.me?.id?.split?.(":")[0] || body?.user?.id?.split?.(":")[0] || null;

  return { state, raw: raw || null, phone, qr: extractQr(body) };
};

export const extractQr = (payload) => {
  const body = unwrap(payload);
  if (typeof body === "string") return body.trim() || null;
  if (!body || typeof body !== "object") return null;
  const qr = body.qrCodeBase64 ?? body.qrBase64 ?? body.qr ?? body.qrCode ?? body.qrcode ?? body.qrImage ?? body.qrCodeUrl ?? body.qrDataUrl ?? body.base64 ?? null;
  if (typeof qr === "string" && qr.trim()) return qr.trim();
  if (qr && typeof qr === "object") return extractQr(qr);
  return null;
};

export const getWhatsAppStatus = async (companyId, { signal } = {}) => {
  try {
    const { data } = await api.get("/whatsapp/status", { params: { companyId }, signal });
    return normalizeStatus(data);
  } catch (error) {
    // A 404 for this company's session is the backend saying "nothing set up".
    if (error.status === 404) return { state: WA_STATE.NOT_CONFIGURED, raw: "NOT_FOUND", phone: null, qr: null };
    throw error;
  }
};

export const connectWhatsApp = async (companyId) => {
  const { data } = await api.post("/whatsapp/connect", { companyId });
  return normalizeStatus(data);
};

export const getWhatsAppQr = async (companyId, { signal } = {}) => {
  try {
    const { data } = await api.get("/whatsapp/qr", { params: { companyId }, signal });
    return { qr: extractQr(data), status: normalizeStatus(data) };
  } catch (error) {
    // QR not generated yet (or no longer needed) — keep waiting via status.
    if (error.status === 404) return { qr: null, status: null };
    throw error;
  }
};

export const disconnectWhatsApp = async (companyId) => {
  const { data } = await api.post("/whatsapp/disconnect", { companyId });
  return unwrap(data);
};
