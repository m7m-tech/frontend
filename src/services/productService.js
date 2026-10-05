import api from "../api/axios";
import { fetchAllPages, unwrap } from "../api/envelope";

// Endpoints (Postman "2. Product Management" + gateway Swagger):
//   POST   /products                        { companyId, name, price, sku, stockQuantity }
//   GET    /products                        companyId/page/limit/search (query — see orderService)
//   GET    /products/:companyId/:productId
//   PATCH  /products/stock                  { companyId, productId, name, sku, isActive }
//   POST   /products/adjust-stock           { companyId, productId, quantityDelta }
//   DELETE /products/:companyId/:productId

// The backend exposes no low-stock threshold, so this is a frontend display
// rule, used only when a product doesn't carry its own threshold field.
export const DEFAULT_LOW_STOCK_THRESHOLD = 10;

const num = (v) => (v === null || v === undefined || v === "" || isNaN(v) ? null : Number(v));

export const normalizeProduct = (p) => ({
  id: p?.id ?? p?._id ?? null,
  name: p?.name?.trim?.() || p?.name || "Untitled product",
  sku: p?.sku || null,
  price: num(p?.price),
  stockQuantity: num(p?.stockQuantity ?? p?.stock ?? p?.quantity),
  isActive: p?.isActive ?? p?.active ?? true,
  lowStockThreshold: num(p?.lowStockThreshold ?? p?.minStock ?? p?.reorderLevel) ?? DEFAULT_LOW_STOCK_THRESHOLD,
  updatedAt: p?.updatedAt || null,
  raw: p,
});

export const stockLevel = (product) => {
  if (product.stockQuantity === null) return "unknown";
  if (product.stockQuantity <= 0) return "out";
  if (product.stockQuantity <= product.lowStockThreshold) return "low";
  return "ok";
};

export const fetchAllProducts = async (companyId, { signal } = {}) => {
  const result = await fetchAllPages("/products", { companyId }, { signal });
  return { ...result, items: result.items.map(normalizeProduct) };
};

export const getProduct = async (companyId, productId) => {
  const { data } = await api.get(`/products/${companyId}/${productId}`);
  return normalizeProduct(unwrap(data));
};

export const createProduct = async ({ companyId, name, price, sku, stockQuantity }) => {
  const { data } = await api.post("/products", { companyId, name, price, sku, stockQuantity });
  return unwrap(data);
};

export const updateProduct = async ({ companyId, productId, name, sku, isActive }) => {
  const { data } = await api.patch("/products/stock", { companyId, productId, name, sku, isActive });
  return unwrap(data);
};

export const adjustStock = async ({ companyId, productId, quantityDelta }) => {
  const { data } = await api.post("/products/adjust-stock", { companyId, productId, quantityDelta });
  return unwrap(data);
};

export const deleteProduct = async (companyId, productId) => {
  const { data } = await api.delete(`/products/${companyId}/${productId}`);
  return unwrap(data);
};
