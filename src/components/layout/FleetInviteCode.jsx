import React, { useState } from "react";
import { Check, Copy, QrCode } from "lucide-react";

// Shows the company's real fleet invite code. The backend doesn't expose one
// yet, so `code` is usually null and the card says so instead of inventing it.
const FleetInviteCode = ({ code, compact = false }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`flex items-center gap-3 rounded-full border border-line bg-white py-1.5 pl-4 pr-1.5 ${compact ? "" : "min-w-[200px]"}`}>
      <QrCode size={18} strokeWidth={1.75} className="shrink-0 text-black" aria-hidden="true" />
      <div className="min-w-0 leading-tight">
        <p className="text-[11px] text-gray">Fleet invite code</p>
        <p className={`truncate text-sm font-semibold tracking-wide ${code ? "text-black" : "text-gray"}`}>
          {code || "Not available"}
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        disabled={!code}
        aria-label={copied ? "Invite code copied" : "Copy fleet invite code"}
        title={code ? "Copy code" : "Your fleet invite code isn't available yet"}
        className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-black transition hover:bg-secondary disabled:cursor-not-allowed disabled:bg-canvas disabled:text-gray/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
};

export default FleetInviteCode;
