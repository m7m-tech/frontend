import React, { useRef } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { CircleCheck, LogOut, MessageCircle, RefreshCw, Smartphone } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import useCompany from "../hooks/useCompany";
import { SETUP_PHASE, useWhatsAppSetup, useWhatsAppStatus } from "../hooks/useWhatsApp";
import { WA_STATE } from "../services/whatsappService";
import RouteXLogo from "../components/layout/RouteXLogo";
import WhatsAppQr from "../components/whatsapp/WhatsAppQr";
import { NON_APPROVED_STATUSES } from "../services/companyService";

const STEPS = [
  "Open WhatsApp on the phone you use for your business",
  "Tap Menu or Settings, then Linked devices",
  "Tap Link a device",
  "Point your phone at the QR code on this screen",
];

const QR_SIZE = 264;

const QrPanel = ({ phase, qr, error, phone, onRestart, onContinue }) => {
  if (phase === SETUP_PHASE.CONNECTED) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-brand">
          <CircleCheck size={30} aria-hidden="true" />
        </span>
        <p className="text-xl font-semibold">WhatsApp connected</p>
        {phone && (
          <p className="text-sm text-gray">
            Linked to <span dir="ltr" className="font-medium text-black">{phone}</span>
          </p>
        )}
        <button
          type="button"
          onClick={onContinue}
          className="mt-2 w-full max-w-[280px] rounded-xl bg-brand py-3 text-sm font-semibold text-black shadow-sm hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (phase === SETUP_PHASE.PAUSED || phase === SETUP_PHASE.ERROR || phase === SETUP_PHASE.RATE_LIMITED) {
    const copy = {
      [SETUP_PHASE.PAUSED]: ["Still there?", "We stopped waiting for a scan. Generate a new QR code when you're ready."],
      [SETUP_PHASE.RATE_LIMITED]: [
        "Too many requests",
        "RouteX paused to stay within the server's request limit. Please wait a few minutes, then generate a new QR code.",
      ],
      [SETUP_PHASE.ERROR]: ["We couldn't start WhatsApp linking", error || "Please try again in a moment."],
    }[phase];
    return (
      <div className="flex flex-col items-center gap-3 text-center" style={{ minHeight: QR_SIZE }}>
        <span className="mt-6 grid h-14 w-14 place-items-center rounded-full bg-canvas">
          <RefreshCw size={22} aria-hidden="true" />
        </span>
        <p className="font-semibold">{copy[0]}</p>
        <p className="max-w-[260px] text-sm text-gray">{copy[1]}</p>
        <button
          type="button"
          onClick={onRestart}
          className="mt-1 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-deep"
        >
          Generate new QR
        </button>
      </div>
    );
  }

  const showQr = phase === SETUP_PHASE.SHOW_QR && qr;
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-2xl border border-line bg-white p-3">
        {showQr ? (
          <WhatsAppQr value={qr} size={QR_SIZE} />
        ) : (
          <div className="skeleton rounded-xl" style={{ width: QR_SIZE, height: QR_SIZE }} aria-hidden="true" />
        )}
      </div>
      <p role="status" className="flex items-center gap-2 text-sm text-gray">
        <span className={`h-2 w-2 rounded-full ${showQr ? "animate-pulse bg-brand" : "bg-muted"}`} aria-hidden="true" />
        {showQr
          ? "Waiting for you to scan…"
          : phase === SETUP_PHASE.WAITING_QR
          ? "Generating your QR code…"
          : "Preparing a secure connection…"}
      </p>
      {showQr && <p className="text-xs text-gray">The code refreshes automatically while this page is open.</p>}
      {error && <p className="max-w-[280px] text-center text-xs text-alert">{error} Retrying…</p>}
    </div>
  );
};

const SetupFlow = ({ companyId }) => {
  const navigate = useNavigate();
  const status = useWhatsAppStatus(companyId);
  const { phase, qr, error, phone, restart } = useWhatsAppSetup(companyId);
  // Latch the state we arrived with, so the copy doesn't flip from "Connect"
  // to "Reconnect" the moment linking succeeds and the status refreshes.
  const arrivalState = useRef(undefined);
  if (arrivalState.current === undefined && status.data) arrivalState.current = status.data.state;
  const isFirstSetup = arrivalState.current === WA_STATE.NOT_CONFIGURED;

  return (
    <div className="grid min-h-dvh w-full lg:grid-cols-[minmax(0,44%)_minmax(0,1fr)]">
      <div className="flex flex-col px-6 py-8 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between">
          <RouteXLogo />
          <LogoutLink />
        </div>

        <div className="my-auto max-w-[440px] py-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-soft px-3 py-1 text-xs font-medium">
            <MessageCircle size={13} aria-hidden="true" /> {isFirstSetup ? "Final setup step" : "WhatsApp connection"}
          </span>
          <h1 className="mt-4 text-[clamp(2rem,4vh,2.6rem)] leading-tight font-bold">
            {isFirstSetup ? "Connect your" : "Reconnect your"}
            <br />
            <span className="text-brand">WhatsApp.</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray">
            RouteX reads incoming customer messages on your business WhatsApp and turns them into orders. Link your number once — you
            won't need to scan again while it stays connected.
          </p>

          <ol className="mt-7 space-y-3.5">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-3 text-sm">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-xs font-semibold">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>

          {!isFirstSetup && phase !== SETUP_PHASE.CONNECTED && (
            <Link to="/dashboard" className="mt-8 inline-block text-sm font-medium underline underline-offset-2">
              Back to dashboard
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center bg-linear-to-tl from-brand/25 to-soft p-6 lg:m-1.5 lg:rounded-2xl">
        <div className="w-full max-w-[400px] rounded-[28px] bg-white p-8 shadow-[0_20px_60px_rgba(34,34,34,0.12)]">
          <div className="mb-6 flex items-center gap-2 text-sm text-gray">
            <Smartphone size={16} aria-hidden="true" /> Scan with WhatsApp
          </div>
          <QrPanel
            phase={phase}
            qr={qr}
            error={phase === SETUP_PHASE.PAUSED ? null : error}
            phone={phone}
            onRestart={restart}
            onContinue={() => navigate("/dashboard", { replace: true })}
          />
        </div>
      </div>
    </div>
  );
};

const LogoutLink = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => {
        logout();
        navigate("/login", { replace: true });
      }}
      className="flex items-center gap-1.5 text-xs font-medium text-gray hover:text-black"
    >
      <LogOut size={14} aria-hidden="true" /> Log out
    </button>
  );
};

const WhatsAppSetup = () => {
  const { user, isAuthenticated } = useAuth();
  const { companyId, isResolving } = useCompany();

  if (!isAuthenticated || !localStorage.getItem("token")) return <Navigate to="/login" replace />;
  if (NON_APPROVED_STATUSES.has(user?.status)) return <Navigate to="/account-under-review" replace />;

  if (isResolving) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg" aria-busy="true">
        <div className="skeleton h-[340px] w-[min(400px,90vw)] rounded-[28px]" />
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center">
        <div className="max-w-sm space-y-3">
          <p className="font-semibold">We couldn't identify your company.</p>
          <p className="text-sm text-gray">Please log out and sign in again.</p>
          <LogoutLink />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg font-base text-black">
      <SetupFlow companyId={companyId} />
    </div>
  );
};

export default WhatsAppSetup;
