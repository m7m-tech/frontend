import React, { useEffect, useMemo, useState } from "react";
import { useProducts } from "../../hooks/useProducts";
import Modal, { inputClass } from "../ui/Modal";
import { Button } from "../ui/Card";
import { ErrorState } from "../ui/States";
import { OrderStatusBadge, ORDER_STATUS_META } from "../ui/StatusBadge";
import { SkeletonText } from "../skeletons/primitives";
import { useOrderDetails, useUpdateOrderStatus } from "../../hooks/useOrders";
import { ORDER_STATUSES } from "../../services/orderService";
import { formatDateTime, formatPrice } from "../../utils/format";

const Row = ({ label, children }) => (
  <div className="flex justify-between gap-4 border-t border-line py-2.5 text-sm first:border-t-0">
    <dt className="text-gray">{label}</dt>
    <dd className="text-right text-black">{children}</dd>
  </div>
);

// Order items carry only productId (+ unitPrice); resolve the name from the
// company's product list.
const itemName = (it, productsById) =>
  it?.product?.name || it?.productName || it?.name || productsById.get(it?.productId)?.name || "Unknown product";

// `summary` is the row the user clicked (shown instantly); details then load
// from GET /orders/:companyId/:orderId.
const OrderDetailsModal = ({ companyId, summary, onClose }) => {
  const details = useOrderDetails(companyId, summary?.id);
  const order = details.data || summary;
  const [status, setStatus] = useState(order?.status || "");
  const { mutate, pending, error } = useUpdateOrderStatus(companyId);
  const { products } = useProducts(summary ? companyId : null);
  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  useEffect(() => setStatus(order?.status || ""), [order?.status]);

  const save = async () => {
    const result = await mutate({ orderId: order.id, status });
    if (result.ok) details.refetch();
  };

  return (
    <Modal open={Boolean(summary)} onClose={onClose} title={order ? `Order ${order.reference}` : "Order"} width="max-w-xl">
      {!order ? null : (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <OrderStatusBadge status={order.status} />
            <span className="text-xs text-gray">Created {formatDateTime(order.createdAt)}</span>
          </div>

          <dl>
            <Row label="Customer">{order.customerName || "—"}</Row>
            <Row label="Phone"><span dir="ltr">{order.customerPhone || "—"}</span></Row>
            <Row label="Address">{order.address || "—"}</Row>
            <Row label="Source">{order.source || "—"}</Row>
            <Row label="Driver">{order.driverName || "Unassigned"}</Row>
            {order.eta && <Row label="ETA">{formatDateTime(order.eta)}</Row>}
            {order.total !== null && <Row label="Total">{formatPrice(order.total)}</Row>}
            {order.notes && <Row label="Notes">{order.notes}</Row>}
          </dl>

          <div>
            <h3 className="mb-2 text-sm font-medium">Items</h3>
            {details.isLoading ? (
              <SkeletonText lines={2} />
            ) : details.error && !details.data ? (
              <ErrorState title="Unable to load order details." onRetry={details.refetch} className="py-4!" />
            ) : order.items.length === 0 ? (
              <p className="text-sm text-gray">No items listed.</p>
            ) : (
              <ul className="divide-y divide-line rounded-xl border border-line">
                {order.items.map((it, i) => (
                  <li key={it.id || i} className="flex justify-between px-3 py-2 text-sm">
                    <span>{itemName(it, productsById)}</span>
                    <span className="text-gray">
                      × {it.quantity ?? "—"}
                      {it.unitPrice != null && ` · ${formatPrice(it.unitPrice)}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl bg-canvas p-4">
            <label htmlFor="order-status" className="text-[13px] font-medium">
              Update status
            </label>
            <div className="mt-2 flex gap-2">
              <select id="order-status" className={`${inputClass} flex-1`} value={status} onChange={(e) => setStatus(e.target.value)}>
                {!ORDER_STATUSES.includes(status) && status && <option value={status}>{status}</option>}
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_META[s]?.label || s}
                  </option>
                ))}
              </select>
              <Button variant="dark" onClick={save} disabled={pending || !status || status === order.status}>
                {pending ? "Saving…" : "Save"}
              </Button>
            </div>
            {error && <p role="alert" className="mt-2 text-xs text-alert">{error}</p>}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default OrderDetailsModal;
