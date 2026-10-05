import { useCallback, useMemo, useState } from "react";
import useResource, { invalidate } from "./useResource";
import { ACTIVE_STATUSES, createOrder, fetchAllOrders, getOrder, updateOrderStatus } from "../services/orderService";

const ordersKey = (companyId) => `orders:${companyId}`;

export const ORDER_FILTERS = [
  { key: "ALL", label: "All", match: () => true },
  { key: "ACTIVE", label: "Active", match: (o) => ACTIVE_STATUSES.includes(o.status) },
  { key: "IN_TRANSIT", label: "In transit", match: (o) => o.status === "IN_TRANSIT" },
  { key: "DELIVERED", label: "Delivered", match: (o) => o.status === "DELIVERED" },
  { key: "NEEDS_REVIEW", label: "Needs review", match: (o) => o.status === "NEEDS_REVIEW" },
  { key: "CANCELLED", label: "Cancelled", match: (o) => o.status === "CANCELLED" },
];

// Client-side search; only applied to the fully loaded order list.
export const matchesSearch = (o, q) =>
  !q || [o.reference, o.customerName, o.customerPhone, o.address, o.driverName].some((v) => v?.toLowerCase().includes(q));

export const byNewest =(a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0);

export function useOrders(companyId) {
  const resource = useResource(companyId ? ordersKey(companyId) : null, () => fetchAllOrders(companyId), {
    enabled: Boolean(companyId),
    staleTime: 2 * 60000, // stay within the gateway rate limit
  });

  const orders = useMemo(() => [...(resource.data?.items || [])].sort(byNewest), [resource.data]);
  const counts = useMemo(
    () => Object.fromEntries(ORDER_FILTERS.map((f) => [f.key, orders.filter(f.match).length])),
    [orders]
  );

  return { ...resource, orders, counts, complete: resource.data?.complete ?? true };
}

export function useOrderDetails(companyId, orderId) {
  return useResource(companyId && orderId ? `order:${companyId}:${orderId}` : null, () => getOrder(companyId, orderId), {
    staleTime: 15000,
  });
}

// Shared submit-state wrapper for mutations that should refresh orders.
function useOrderMutation(companyId, fn) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (input) => {
      setPending(true);
      setError(null);
      try {
        const result = await fn({ companyId, ...input });
        invalidate(ordersKey(companyId));
        invalidate(`order:${companyId}:`);
        return { ok: true, result };
      } catch (err) {
        setError(err.message);
        return { ok: false, error: err };
      } finally {
        setPending(false);
      }
    },
    [companyId, fn]
  );

  return { mutate, pending, error, resetError: () => setError(null) };
}

export const useCreateOrder = (companyId) => useOrderMutation(companyId, createOrder);
export const useUpdateOrderStatus = (companyId) => useOrderMutation(companyId, updateOrderStatus);
