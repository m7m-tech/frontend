import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { WA_STATE } from "../../services/whatsappService";

// Prominent prompt for a company whose WhatsApp link dropped (or was never
// made, or was started but never scanned). Renders nothing while connected
// or when the status is unknown.
const WhatsAppBanner = ({ state }) => {
  if (state !== WA_STATE.DISCONNECTED && state !== WA_STATE.NOT_CONFIGURED && state !== WA_STATE.CONNECTING) return null;
  const neverLinked = state === WA_STATE.NOT_CONFIGURED;
  const pending = state === WA_STATE.CONNECTING;

  return (
    <div role="status" className="mb-4 flex flex-wrap items-center gap-3 rounded-[22px] border border-alert/20 bg-alert-soft px-5 py-3.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-alert">
        <MessageCircle size={18} aria-hidden="true" />
      </span>
      <div className="mr-auto min-w-0">
        <p className="text-sm font-semibold text-black">
          {pending ? "WhatsApp setup isn't finished" : `WhatsApp ${neverLinked ? "not connected" : "disconnected"}`}
        </p>
        <p className="text-[13px] text-gray">New orders from WhatsApp conversations can't reach RouteX until you {neverLinked || pending ? "link" : "re-link"} your number.</p>
      </div>
      <Link
        to="/whatsapp-setup"
        className="rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {pending ? "Finish setup" : neverLinked ? "Connect WhatsApp" : "Reconnect"}
      </Link>
    </div>
  );
};

export default WhatsAppBanner;
