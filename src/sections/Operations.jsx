import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Bell, CircleCheck, MessageCircle, Package, TriangleAlert } from "lucide-react";
import PageHeader from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { EmptyState, ErrorState } from "../components/ui/States";
import { OperationsSkeleton } from "../components/skeletons/PageSkeletons";
import OrderDetailsModal from "../components/orders/OrderDetailsModal";
import { useAttentionItems } from "../hooks/useOperations";
import { useOrders } from "../hooks/useOrders";
import useNow from "../hooks/useNow";
import { timeAgo } from "../utils/format";

const KIND_ICON = { whatsapp: MessageCircle, order: TriangleAlert, stock: Package };

const Operations = () => {
  const { companyId } = useOutletContext();
  const { items, isLoading, error, refetch } = useAttentionItems(companyId);
  const { orders } = useOrders(companyId);
  const [openOrder, setOpenOrder] = useState(null);
  const now = useNow();

  if (isLoading) return <OperationsSkeleton />;

  const actionFor = (item) => {
    const cls = "shrink-0 rounded-full border border-line px-3.5 py-1.5 text-[13px] font-medium hover:bg-canvas";
    if (item.kind === "whatsapp") return <Link to="/whatsapp-setup" className={cls}>Reconnect</Link>;
    if (item.kind === "stock") return <Link to="/products" className={cls}>Restock</Link>;
    if (item.kind === "order")
      return (
        <button type="button" className={cls} onClick={() => setOpenOrder(orders.find((o) => o.id === item.orderId) || null)}>
          Review
        </button>
      );
    return null;
  };

  return (
    <div>
      <PageHeader title="Operations" description="What needs your attention right now." />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-5">
            <h2 className="text-lg font-medium">Needs attention</h2>
            {items.length > 0 && (
              <span className="rounded-full bg-alert-soft px-2.5 py-1 text-xs font-semibold text-alert">{items.length}</span>
            )}
          </div>
          {error && items.length === 0 ? (
            <ErrorState title="Unable to load operational data." onRetry={refetch} className="min-h-[300px] border-t border-line" />
          ) : items.length === 0 ? (
            <EmptyState
              icon={CircleCheck}
              title="No active alerts"
              description="Orders flagged for review, stock problems and WhatsApp issues show up here."
              className="min-h-[300px] border-t border-line"
            />
          ) : (
            <ul className="divide-y divide-line border-t border-line">
              {items.map((item) => {
                const Icon = KIND_ICON[item.kind] || TriangleAlert;
                return (
                  <li key={item.id} className="flex items-center gap-3 px-5 py-4">
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                        item.severity === "high" ? "bg-alert-soft text-alert" : "bg-canvas text-black"
                      }`}
                    >
                      <Icon size={17} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        <span className="sr-only">{item.severity === "high" ? "Urgent: " : "Warning: "}</span>
                        {item.title}
                      </p>
                      <p className="truncate text-[13px] text-gray">
                        {item.detail}
                        {item.at && ` · ${timeAgo(item.at, now)}`}
                      </p>
                    </div>
                    {actionFor(item)}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-medium">Notifications</h2>
          <EmptyState
            icon={Bell}
            title="No notifications to show"
            description="Order assignments, deliveries and status changes will appear here once notifications are enabled for your account."
            className="min-h-[260px]"
          />
        </Card>
      </div>

      <OrderDetailsModal companyId={companyId} summary={openOrder} onClose={() => setOpenOrder(null)} />
    </div>
  );
};

export default Operations;
