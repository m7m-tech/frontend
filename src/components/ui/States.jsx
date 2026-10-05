import React from "react";
import { CircleAlert, Info, RefreshCw } from "lucide-react";

export const EmptyState = ({ icon: Icon = Info, title, description, action, className = "" }) => (
  <div className={`flex flex-col items-center justify-center gap-2 px-6 py-8 text-center ${className}`}>
    <span className="grid h-11 w-11 place-items-center rounded-full bg-canvas text-gray">
      <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
    </span>
    <p className="text-sm font-medium text-black">{title}</p>
    {description && <p className="max-w-xs text-[13px] leading-relaxed text-gray">{description}</p>}
    {action}
  </div>
);

export const ErrorState = ({ title = "Something went wrong.", message, onRetry, className = "" }) => (
  <div role="alert" className={`flex flex-col items-center justify-center gap-2 px-6 py-8 text-center ${className}`}>
    <span className="grid h-11 w-11 place-items-center rounded-full bg-alert-soft text-alert">
      <CircleAlert size={20} strokeWidth={1.75} aria-hidden="true" />
    </span>
    <p className="text-sm font-medium text-black">{title}</p>
    {message && <p className="max-w-xs text-[13px] text-gray">{message}</p>}
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[13px] font-medium hover:bg-canvas"
      >
        <RefreshCw size={14} aria-hidden="true" /> Retry
      </button>
    )}
  </div>
);

export const InlineNotice = ({ tone = "neutral", children, className = "" }) => (
  <p
    className={`flex items-start gap-1.5 text-xs leading-relaxed ${tone === "alert" ? "text-alert" : "text-gray"} ${className}`}
  >
    <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
    <span>{children}</span>
  </p>
);
