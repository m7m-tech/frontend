import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Inbox, Plus } from "lucide-react";
import { Card, Button } from "../ui/Card";
import { EmptyState, ErrorState } from "../ui/States";
import OrdersTable from "../orders/OrdersTable";
import OrderFilterTabs from "../orders/OrderFilterTabs";
import OrderDetailsModal from "../orders/OrderDetailsModal";
import CreateOrderModal from "../orders/CreateOrderModal";
import { ORDER_FILTERS } from "../../hooks/useOrders";

const PREVIEW_ROWS = 5;

const OrdersPreview = ({ companyId, orders, counts, error, onRetry, now }) => {
  const [filterKey, setFilterKey] = useState("ACTIVE");
  const [openOrder, setOpenOrder] = useState(null);
  const [creating, setCreating] = useState(false);

  const filter = ORDER_FILTERS.find((f) => f.key === filterKey);
  const visible = useMemo(() => orders.filter(filter.match).slice(0, PREVIEW_ROWS), [orders, filter]);
  const totalInFilter = counts[filterKey] ?? 0;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 p-5 sm:px-6">
        <h2 className="mr-auto text-[22px] font-medium tracking-[-0.01em]">Orders</h2>
        <OrderFilterTabs value={filterKey} onChange={setFilterKey} counts={counts} />
        <Button variant="dark" onClick={() => setCreating(true)} className="py-3!">
          <Plus size={16} aria-hidden="true" /> New order
        </Button>
      </div>

      {error ? (
        <ErrorState title="Unable to load orders." message={error?.message} onRetry={onRetry} className="min-h-[320px]" />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={orders.length === 0 ? "No orders yet" : `No ${filter.label.toLowerCase()} orders`}
          description={orders.length === 0 ? "New orders from WhatsApp or created here will show up in this list." : undefined}
          className="min-h-[320px] border-t border-line"
        />
      ) : (
        <>
          <OrdersTable orders={visible} onRowClick={setOpenOrder} now={now} />
          {totalInFilter > PREVIEW_ROWS && (
            <Link
              to={`/orders?status=${filterKey}`}
              className="flex items-center justify-center gap-1.5 border-t border-line py-3.5 text-sm font-medium hover:bg-canvas/60"
            >
              View all {totalInFilter} orders <ArrowRight size={15} aria-hidden="true" />
            </Link>
          )}
        </>
      )}

      <OrderDetailsModal companyId={companyId} summary={openOrder} onClose={() => setOpenOrder(null)} />
      <CreateOrderModal open={creating} onClose={() => setCreating(false)} companyId={companyId} />
    </Card>
  );
};

export default OrdersPreview;
