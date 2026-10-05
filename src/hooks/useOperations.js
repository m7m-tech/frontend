import { useMemo } from "react";
import { useOrders } from "./useOrders";
import { useProducts } from "./useProducts";
import { useWhatsAppStatus } from "./useWhatsApp";
import { stockLevel } from "../services/productService";
import { WA_STATE } from "../services/whatsappService";

// The backend has no alerts or notifications endpoints. Until it does, the
// "needs attention" list is derived strictly from real data that already
// signals a problem: orders the backend flagged NEEDS_REVIEW, products that
// are out of / low on stock, and a disconnected WhatsApp channel.
export function useAttentionItems(companyId) {
  const orders = useOrders(companyId);
  const products = useProducts(companyId);
  const whatsapp = useWhatsAppStatus(companyId);

  const items = useMemo(() => {
    const list = [];
    const waState = whatsapp.data?.state;
    if (waState === WA_STATE.DISCONNECTED || waState === WA_STATE.NOT_CONFIGURED) {
      list.push({
        id: "whatsapp",
        kind: "whatsapp",
        severity: "high",
        title: waState === WA_STATE.NOT_CONFIGURED ? "WhatsApp isn't connected" : "WhatsApp disconnected",
        detail: "Orders from WhatsApp conversations can't reach RouteX until it's linked.",
      });
    }
    for (const o of orders.orders.filter((o) => o.status === "NEEDS_REVIEW")) {
      list.push({
        id: `order-${o.id}`,
        kind: "order",
        severity: "high",
        title: `Order ${o.reference} needs review`,
        detail: [o.customerName, o.address].filter(Boolean).join(" · ") || "Flagged for review",
        orderId: o.id,
        at: o.updatedAt || o.createdAt,
      });
    }
    for (const p of products.products) {
      const level = stockLevel(p);
      if (level === "out" || level === "low") {
        list.push({
          id: `product-${p.id}`,
          kind: "stock",
          severity: level === "out" ? "high" : "medium",
          title: level === "out" ? `${p.name} is out of stock` : `${p.name} is low on stock`,
          detail: `${p.stockQuantity} units left${p.sku ? ` · SKU ${p.sku}` : ""}`,
          productId: p.id,
        });
      }
    }
    return list;
  }, [orders.orders, products.products, whatsapp.data]);

  return {
    items,
    isLoading: orders.isLoading || products.isLoading,
    error: orders.error || products.error,
    refetch: () => Promise.all([orders.refetch(), products.refetch(), whatsapp.refetch()]),
  };
}
