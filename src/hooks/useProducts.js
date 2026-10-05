import { useCallback, useMemo, useState } from "react";
import useResource, { invalidate } from "./useResource";
import {
  adjustStock,
  createProduct,
  deleteProduct,
  fetchAllProducts,
  stockLevel,
  updateProduct,
} from "../services/productService";

const productsKey = (companyId) => `products:${companyId}`;

export function useProducts(companyId) {
  const resource = useResource(companyId ? productsKey(companyId) : null, () => fetchAllProducts(companyId), {
    enabled: Boolean(companyId),
    staleTime: 2 * 60000, // stay within the gateway rate limit
  });

  const products = useMemo(
    () => [...(resource.data?.items || [])].sort((a, b) => a.name.localeCompare(b.name)),
    [resource.data]
  );

  const summary = useMemo(() => {
    const levels = products.map(stockLevel);
    return {
      total: products.length,
      active: products.filter((p) => p.isActive).length,
      inStock: levels.filter((l) => l === "ok" || l === "low").length,
      low: levels.filter((l) => l === "low").length,
      out: levels.filter((l) => l === "out").length,
      units: products.reduce((sum, p) => sum + (p.stockQuantity > 0 ? p.stockQuantity : 0), 0),
    };
  }, [products]);

  return { ...resource, products, summary, complete: resource.data?.complete ?? true };
}

function useProductMutation(companyId, fn) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (input) => {
      setPending(true);
      setError(null);
      try {
        const result = await fn({ companyId, ...input });
        invalidate(productsKey(companyId));
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

export const useCreateProduct = (companyId) => useProductMutation(companyId, createProduct);
export const useUpdateProduct = (companyId) => useProductMutation(companyId, updateProduct);
export const useAdjustStock = (companyId) => useProductMutation(companyId, adjustStock);
const deleteFn = ({ companyId, productId }) => deleteProduct(companyId, productId);
export const useDeleteProduct = (companyId) => useProductMutation(companyId, deleteFn);
