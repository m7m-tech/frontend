import { useCallback, useEffect, useRef, useState } from "react";
import useResource, { invalidate, setResourceData } from "./useResource";
import {
  WA_STATE,
  connectWhatsApp,
  disconnectWhatsApp,
  getWhatsAppQr,
  getWhatsAppStatus,
} from "../services/whatsappService";

const statusKey = (companyId) => `wa:status:${companyId}`;

// Connection status for the header, gate and settings. Fetched once and
// re-validated at most every minute on navigation — no background polling;
// polling only happens on the setup screen while waiting for a scan.
export function useWhatsAppStatus(companyId) {
  return useResource(companyId ? statusKey(companyId) : null, () => getWhatsAppStatus(companyId), {
    enabled: Boolean(companyId),
    // Gateway budget is ~100 requests / 15 min per IP — re-check sparingly.
    staleTime: 5 * 60000,
  });
}

export function useWhatsAppDisconnect(companyId) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const disconnect = useCallback(async () => {
    setPending(true);
    setError(null);
    try {
      await disconnectWhatsApp(companyId);
      return true;
    } catch (err) {
      setError(err.message || "Unable to disconnect WhatsApp.");
      return false;
    } finally {
      // Re-read the real state from the backend rather than assuming it.
      invalidate(statusKey(companyId));
      setPending(false);
    }
  }, [companyId]);

  return { disconnect, pending, error };
}

const POLL_MS = 10000;
const MAX_BACKOFF_MS = 30000;
// Stop polling after this long without a scan; the user can start a fresh
// session. Bounds one attempt to ~15 requests — not presented as a QR expiry.
const SESSION_WINDOW_MS = 150 * 1000;

export const SETUP_PHASE = {
  CHECKING: "checking", // reading current status
  STARTING: "starting", // POST /whatsapp/connect in flight
  WAITING_QR: "waiting_qr", // session started, QR not ready yet
  SHOW_QR: "show_qr",
  CONNECTED: "connected",
  PAUSED: "paused", // stopped waiting (window elapsed)
  RATE_LIMITED: "rate_limited", // gateway returned 429 — stopped polling
  ERROR: "error",
};

// Drives the QR linking flow: check status → start a session → poll status
// (and refresh the QR, which WhatsApp rotates) until connected.
export function useWhatsAppSetup(companyId) {
  const [phase, setPhase] = useState(SETUP_PHASE.CHECKING);
  const [qr, setQr] = useState(null);
  const [error, setError] = useState(null);
  const [phone, setPhone] = useState(null);

  const timerRef = useRef(null);
  const runIdRef = useRef(0);

  const stop = useCallback(() => {
    runIdRef.current += 1;
    clearTimeout(timerRef.current);
  }, []);

  const markConnected = useCallback(
    (status) => {
      stop();
      setPhone(status?.phone || null);
      setQr(null);
      setPhase(SETUP_PHASE.CONNECTED);
      // Keep the connected status the backend just reported rather than
      // re-fetching it immediately (also saves a rate-limited request).
      setResourceData(statusKey(companyId), { ...status, state: WA_STATE.CONNECTED });
    },
    [companyId, stop]
  );

  // The gateway allows ~100 requests per 15 minutes per IP, so every tick
  // makes exactly ONE request: the QR until one exists, then mostly status
  // with a QR refresh every other tick — every 20s, matching how often
  // WhatsApp rotates the code.
  const poll = useCallback(
    function pollStep(runId, startedAt, delay, tick = 0, hasQr = false) {
      timerRef.current = setTimeout(async () => {
        if (runId !== runIdRef.current) return;
        if (Date.now() - startedAt > SESSION_WINDOW_MS) {
          setPhase(SETUP_PHASE.PAUSED);
          setQr(null);
          return;
        }

        let nextDelay = POLL_MS;
        let gotQr = hasQr;
        try {
          if (!hasQr || tick % 2 === 1) {
            const { qr: freshQr, status } = await getWhatsAppQr(companyId);
            if (runId !== runIdRef.current) return;
            if (status?.state === WA_STATE.CONNECTED) return markConnected(status);
            if (freshQr) {
              gotQr = true;
              setQr(freshQr);
              setPhase(SETUP_PHASE.SHOW_QR);
            }
          } else {
            const status = await getWhatsAppStatus(companyId);
            if (runId !== runIdRef.current) return;
            if (status.state === WA_STATE.CONNECTED) return markConnected(status);
          }
          setError(null);
        } catch (err) {
          if (runId !== runIdRef.current) return;
          if (err.status === 401) return stop();
          // Rate-limited: retrying would only extend the block — stop and let
          // the user try again later.
          if (err.status === 429) {
            setQr(null);
            setError(err.message);
            setPhase(SETUP_PHASE.RATE_LIMITED);
            return;
          }
          nextDelay = Math.min((delay || POLL_MS) * 2, MAX_BACKOFF_MS);
          setError(err.message);
        }
        pollStep(runId, startedAt, nextDelay, tick + 1, gotQr);
      }, delay);
    },
    [companyId, markConnected, stop]
  );

  const start = useCallback(async () => {
    stop();
    const runId = runIdRef.current;
    setError(null);
    setQr(null);
    setPhase(SETUP_PHASE.STARTING);
    try {
      const started = await connectWhatsApp(companyId);
      if (runId !== runIdRef.current) return;
      if (started.state === WA_STATE.CONNECTED) return markConnected(started);
      if (started.qr) {
        setQr(started.qr);
        setPhase(SETUP_PHASE.SHOW_QR);
      } else {
        setPhase(SETUP_PHASE.WAITING_QR);
      }
      poll(runId, Date.now(), started.qr ? POLL_MS : 2500, 0, Boolean(started.qr));
    } catch (err) {
      if (runId !== runIdRef.current) return;
      setError(err.message || "Unable to start WhatsApp linking.");
      setPhase(err.status === 429 ? SETUP_PHASE.RATE_LIMITED : SETUP_PHASE.ERROR);
    }
  }, [companyId, markConnected, poll, stop]);

  // Reuse the shared (cached) status instead of firing another request.
  const initial = useWhatsAppStatus(companyId);
  const initialState = initial.data?.state;
  const initialError = initial.error && !initial.data ? initial.error : null;

  useEffect(() => {
    if (!companyId || (!initialState && !initialError)) return undefined;
    if (initialState === WA_STATE.CONNECTED) {
      markConnected(initial.data);
      return undefined;
    }
    if (initialError) {
      setError(initialError.message || "Unable to load WhatsApp status.");
      setPhase(initialError.status === 429 ? SETUP_PHASE.RATE_LIMITED : SETUP_PHASE.ERROR);
      return undefined;
    }
    // A linking session is already open and waiting for a scan — show its
    // QR instead of opening another one.
    if (initialState === WA_STATE.CONNECTING) {
      stop();
      setPhase(SETUP_PHASE.WAITING_QR);
      poll(runIdRef.current, Date.now(), 0);
      return stop;
    }
    // Deferred a tick so StrictMode's mount→unmount→mount doesn't open two
    // backend sessions: the first mount's timer is cleared before it fires.
    timerRef.current = setTimeout(start, 0);
    return stop;
    // Start once per arrival — not again when the status cache refreshes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, Boolean(initialState || initialError)]);

  return { phase, qr, error, phone, restart: start };
}
