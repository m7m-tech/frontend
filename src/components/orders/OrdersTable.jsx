import React from "react";
import { Box, MessageCircle } from "lucide-react";
import { OrderStatusBadge } from "../ui/StatusBadge";
import { initialsOf } from "../../services/companyService";
import { formatDateTime, timeAgo } from "../../utils/format";

const sourceLabel = (source) => {
  if (!source) return null;
  if (source === "WHATSAPP") return "From WhatsApp";
  return `Via ${source.charAt(0)}${source.slice(1).toLowerCase().replace(/_/g, " ")}`;
};

const OrdersTable = ({ orders, onRowClick, now = Date.now() }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[860px] border-collapse text-left">
      <thead>
        <tr className="bg-canvas/70 text-[13px] text-gray">
          <th scope="col" className="px-6 py-3 font-normal">Order ID</th>
          <th scope="col" className="px-3 py-3 font-normal">Customer</th>
          <th scope="col" className="px-3 py-3 font-normal">Destination</th>
          <th scope="col" className="px-3 py-3 font-normal">Driver</th>
          <th scope="col" className="px-3 py-3 font-normal">Created</th>
          <th scope="col" className="px-6 py-3 text-right font-normal">Status</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr
            key={o.id}
            onClick={onRowClick ? () => onRowClick(o) : undefined}
            className={`h-16 border-t border-line align-middle ${onRowClick ? "cursor-pointer hover:bg-canvas/50" : ""}`}
          >
            <td className="px-6 py-2.5">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-canvas text-black">
                  <Box size={16} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div className="leading-tight">
                  {onRowClick ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(o);
                      }}
                      className="text-[15px] font-semibold text-black hover:underline focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      {o.reference}
                    </button>
                  ) : (
                    <span className="text-[15px] font-semibold text-black">{o.reference}</span>
                  )}
                  {sourceLabel(o.source) && (
                    <span className={`mt-0.5 flex items-center gap-1 text-xs ${o.source === "WHATSAPP" ? "text-[#4C8A00]" : "text-gray"}`}>
                      {o.source === "WHATSAPP" && <MessageCircle size={11} aria-hidden="true" />}
                      {sourceLabel(o.source)}
                    </span>
                  )}
                </div>
              </div>
            </td>
            <td className="px-3 py-2.5 leading-tight">
              <p className="text-[15px] text-black">{o.customerName || "—"}</p>
              {o.customerPhone && <p className="mt-0.5 text-xs text-gray" dir="ltr">{o.customerPhone}</p>}
            </td>
            <td className="max-w-[240px] px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm text-black">
                <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                <span className="truncate">{o.address || "No address"}</span>
              </span>
            </td>
            <td className="px-3 py-2.5">
              {o.driverName ? (
                <span className="flex items-center gap-2.5 text-[15px] text-black">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-canvas text-[10px] font-semibold">
                    {initialsOf(o.driverName)}
                  </span>
                  {o.driverName}
                </span>
              ) : (
                <span className="text-sm text-gray">Unassigned</span>
              )}
            </td>
            <td className="px-3 py-2.5 text-sm text-black" title={formatDateTime(o.createdAt)}>
              {timeAgo(o.createdAt, now) || "—"}
            </td>
            <td className="px-6 py-2.5 text-right">
              <OrderStatusBadge status={o.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default OrdersTable;
