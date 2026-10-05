import api from "../api/axios";
import { fetchAllPages, unwrap } from "../api/envelope";
import { extractCoords } from "../utils/geo";

// Endpoints (Postman "3. Order Management" + gateway Swagger):
//   POST  /orders                          create
//   GET   /orders                          list — Postman sends companyId/page/limit
//                                          in a GET body, which browsers can't do,
//                                          so they go as query params here
//   GET   /orders/:companyId/:orderId      details
//   PATCH /orders/status                   { companyId, orderId, status }
// (Postman's "Update Order Status" request points at /orders/customer-name;
// Swagger lists a dedicated /orders/status, which is what this uses.)

// Status values documented in the Postman collection.
export const ORDER_STATUSES = ["PENDING", "PROCESSING", "ASSIGNED", "IN_TRANSIT", "NEEDS_REVIEW", "DELIVERED", "CANCELLED"];
export const ACTIVE_STATUSES = ["PENDING", "PROCESSING", "ASSIGNED", "IN_TRANSIT", "NEEDS_REVIEW"];

const personName = (p) => {
  if (!p || typeof p !== "object") return typeof p === "string" ? p : null;
  return p.name || p.fullName || [p.firstName, p.lastName].filter(Boolean).join(" ") || null;
};

export const normalizeOrder = (o) => {
  const id = o?.id ?? o?._id ?? o?.orderId ?? null;
  const driver = o?.driver || o?.assignedDriver || null;
  return {
    id,
    reference: o?.orderNumber || o?.reference || o?.code || (id ? `#${String(id).slice(0, 8).toUpperCase()}` : "—"),
    customerName: o?.customerName || personName(o?.customer) || null,
    customerPhone: o?.customerPhone || o?.customer?.phone || null,
    address: o?.address || o?.deliveryAddress || o?.customerAddress || o?.destination?.address || null,
    notes: o?.notes || null,
    source: o?.source || null,
    status: typeof o?.status === "string" ? o.status.toUpperCase() : null,
    createdAt: o?.createdAt || o?.created_at || null,
    updatedAt: o?.updatedAt || o?.updated_at || null,
    driverId: o?.driverId || driver?.id || null,
    driverName: o?.driverName || personName(driver),
    eta: o?.eta || o?.estimatedDeliveryTime || o?.estimatedArrival || null,
    total: o?.totalAmount ?? o?.totalPrice ?? o?.total ?? null,
    items: Array.isArray(o?.items) ? o.items : Array.isArray(o?.orderItems) ? o.orderItems : [],
    coords: extractCoords(o, o?.location, o?.deliveryLocation, o?.destination, o?.coordinates),
    raw: o,
  };
};

export const fetchAllOrders = async (companyId, { signal } = {}) => {
  const result = await fetchAllPages("/orders", { companyId }, { signal });
  return { ...result, items: result.items.map(normalizeOrder) };
};

export const getOrder = async (companyId, orderId) => {
  const { data } = await api.get(`/orders/${companyId}/${orderId}`);
  return normalizeOrder(unwrap(data));
};

// Body mirrors the Postman "Create Order" example exactly.
export const createOrder = async ({ companyId, customerName, customerPhone, address, items }) => {
  const { data } = await api.post("/orders", { companyId, customerName, customerPhone, address, items });
  return unwrap(data);
};

export const updateOrderStatus = async ({ companyId, orderId, status }) => {
  const { data } = await api.patch("/orders/status", { companyId, orderId, status });
  return unwrap(data);
};
