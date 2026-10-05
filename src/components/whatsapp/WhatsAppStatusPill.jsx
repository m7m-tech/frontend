import React from "react";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { WA_STATE } from "../../services/whatsappService";

// Compact header indicator. Text always states the status — colour is a
// secondary cue only.
const WhatsAppStatusPill = ({ status }) => {
  const { data, isLoading, refetch } = status;

  if (isLoading) {
    return <div aria-hidden="true" className="skeleton h-11 w-40 rounded-full" />;
  }

  // No data (failed, or no company to ask about) — never guess "Disconnected".
  if (!data) {
    return (
      <button
        type="button"
        onClick={refetch}
        className="flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-[10px] text-gray hover:bg-canvas w-55"
      >
        <RefreshCw size={14} aria-hidden="true" />
        WhatsApp status unavailable · Retry
      </button>
    );
  }

  const state = data?.state;
  const connected = state === WA_STATE.CONNECTED;
  const connecting = state === WA_STATE.CONNECTING;
  // An unrecognised backend value is shown verbatim rather than guessed at.
  const label = connected
    ? "Connected"
    : connecting
    ? "Awaiting scan"
    : state === WA_STATE.NOT_CONFIGURED
    ? "Not connected"
    : state === WA_STATE.UNKNOWN
    ? data.raw || "Status unknown"
    : "Disconnected";

  const body = (
    <>
      <span
        aria-hidden="true"
        className={`h-2 w-2 shrink-0 rounded-full ${connected ? "bg-brand" : connecting ? "bg-yellow" : "bg-alert"}`}
      />
      <span className="text-[13px] leading-tight">
        <span className="block text-[11px] text-gray">WhatsApp</span>
        <span className={`font-medium ${connected ? "text-black" : connecting ? "text-[#9A7400]" : "text-alert"}`}>{label}</span>
      </span>
    </>
  );

  const rawNote = data.raw ? ` (backend status: ${data.raw})` : "";

  if (connected) {
    return (
      <div title={`WhatsApp connected${rawNote}`} className="flex h-11 items-center gap-2.5 rounded-full border border-line bg-white px-4">
        {body}
      </div>
    );
  }

  // Anything but connected (including a linking session still waiting for a
  // scan): the whole pill is the way into the QR flow.
  const action = connecting ? "Finish WhatsApp setup" : state === WA_STATE.NOT_CONFIGURED ? "Connect WhatsApp" : "Reconnect WhatsApp";
  return (
    <Link
      to="/whatsapp-setup"
      title={`${action}${rawNote}`}
      className="flex h-11 items-center gap-2.5 rounded-full border border-alert/25 bg-white pl-4 pr-3 hover:bg-alert-soft focus-visible:outline-2 focus-visible:outline-brand"
    >
      {body}
      <RefreshCw size={14} className="text-alert" aria-hidden="true" />
      <span className="sr-only">{action}</span>
    </Link>
  );
};

export default WhatsAppStatusPill;
