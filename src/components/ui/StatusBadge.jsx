import React from "react";

const TONES = {
  lime: "bg-soft text-[#3F6B00]",
  alert: "bg-alert-soft text-alert",
  neutral: "bg-canvas text-gray",
  dark: "bg-black text-white",
};

const DOTS = { lime: "bg-brand", alert: "bg-alert", neutral: "bg-gray/60", dark: "bg-brand" };

export const ORDER_STATUS_META = {
  PENDING: { label: "Pending", tone: "neutral" },
  PROCESSING: { label: "Processing", tone: "neutral" },
  ASSIGNED: { label: "Assigned", tone: "lime" },
  IN_TRANSIT: { label: "In transit", tone: "lime" },
  NEEDS_REVIEW: { label: "Needs review", tone: "alert" },
  DELIVERED: { label: "Delivered", tone: "dark" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
};

export const Badge = ({ tone = "neutral", children, className = "" }) => (
  <span
    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] font-medium ${TONES[tone]} ${className}`}
  >
    <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${DOTS[tone]}`} />
    {children}
  </span>
);

// Unknown statuses are shown verbatim rather than renamed.
export const OrderStatusBadge = ({ status }) => {
  const meta = ORDER_STATUS_META[status] || { label: status || "Unknown", tone: "neutral" };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
};
