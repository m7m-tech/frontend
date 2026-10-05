import React, { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Package, PackagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import PageHeader from "../components/layout/PageHeader";
import { Card, Button } from "../components/ui/Card";
import { Badge } from "../components/ui/StatusBadge";
import { EmptyState, ErrorState, InlineNotice } from "../components/ui/States";
import SearchInput from "../components/ui/SearchInput";
import Pagination from "../components/ui/Pagination";
import { ProductsSkeleton } from "../components/skeletons/PageSkeletons";
import { AdjustStockModal, DeleteProductModal, ProductFormModal } from "../components/products/ProductModals";
import { useProducts } from "../hooks/useProducts";
import { stockLevel } from "../services/productService";
import { formatNumber, formatPrice } from "../utils/format";

const PAGE_SIZE = 10;

const STOCK_BADGE = {
  ok: { tone: "lime", label: "In stock" },
  low: { tone: "alert", label: "Low stock" },
  out: { tone: "alert", label: "Out of stock" },
  unknown: { tone: "neutral", label: "Unknown" },
};

const RowAction = ({ label, onClick, children, danger }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    className={`grid h-9 w-9 place-items-center rounded-full border border-line hover:bg-canvas focus-visible:outline-2 focus-visible:outline-brand ${danger ? "text-alert" : "text-black"}`}
  >
    {children}
  </button>
);

const Products = () => {
  const { companyId } = useOutletContext();
  const { products, summary, isLoading, error, data, refetch, complete } = useProducts(companyId);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [formState, setFormState] = useState({ open: false, product: null });
  const [adjusting, setAdjusting] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () => products.filter((p) => !q || p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)),
    [products, q]
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (isLoading) return <ProductsSkeleton />;

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${formatNumber(summary.total)} products · ${summary.low} low stock · ${summary.out} out of stock`}
      >
        <Button variant="dark" className="py-3!" onClick={() => setFormState({ open: true, product: null })}>
          <Plus size={16} aria-hidden="true" /> New product
        </Button>
      </PageHeader>

      <Card className="overflow-hidden">
        <div className="p-5">
          <SearchInput
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search by name or SKU"
            className="w-full max-w-sm"
          />
        </div>
        {!complete && <InlineNotice className="px-6 pb-3">Showing a partial product list — not every page could be loaded.</InlineNotice>}

        {error && !data ? (
          <ErrorState title="Unable to load products." message={error.message} onRetry={refetch} className="min-h-[360px]" />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Package}
            title={products.length === 0 ? "No products yet" : "No products match"}
            description={products.length === 0 ? "Add your first product to start taking orders." : "Try a different search."}
            className="min-h-[360px] border-t border-line"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead>
                  <tr className="bg-canvas/70 text-[13px] text-gray">
                    <th scope="col" className="px-6 py-3 font-normal">Product</th>
                    <th scope="col" className="px-3 py-3 font-normal">SKU</th>
                    <th scope="col" className="px-3 py-3 text-right font-normal">Price</th>
                    <th scope="col" className="px-3 py-3 text-right font-normal">Stock</th>
                    <th scope="col" className="px-3 py-3 font-normal">Stock status</th>
                    <th scope="col" className="px-3 py-3 font-normal">Visibility</th>
                    <th scope="col" className="px-6 py-3 text-right font-normal">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => {
                    const badge = STOCK_BADGE[stockLevel(p)];
                    return (
                      <tr key={p.id} className="h-16 border-t border-line">
                        <td className="px-6 py-2.5">
                          <span className="flex items-center gap-3">
                            <span className="grid h-9 w-9 place-items-center rounded-full bg-canvas">
                              <Package size={16} strokeWidth={1.75} aria-hidden="true" />
                            </span>
                            <span className="text-[15px] font-medium">{p.name}</span>
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-sm text-gray">{p.sku || "—"}</td>
                        <td className="px-3 py-2.5 text-right text-sm tabular-nums">{formatPrice(p.price)}</td>
                        <td className="px-3 py-2.5 text-right text-sm font-medium tabular-nums">{formatNumber(p.stockQuantity)}</td>
                        <td className="px-3 py-2.5">
                          <Badge tone={badge.tone}>{badge.label}</Badge>
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge tone={p.isActive ? "dark" : "neutral"}>{p.isActive ? "Active" : "Inactive"}</Badge>
                        </td>
                        <td className="px-6 py-2.5">
                          <div className="flex justify-end gap-1.5">
                            <RowAction label={`Adjust stock for ${p.name}`} onClick={() => setAdjusting(p)}>
                              <PackagePlus size={16} />
                            </RowAction>
                            <RowAction label={`Edit ${p.name}`} onClick={() => setFormState({ open: true, product: p })}>
                              <Pencil size={15} />
                            </RowAction>
                            <RowAction label={`Delete ${p.name}`} onClick={() => setDeleting(p)} danger>
                              <Trash2 size={15} />
                            </RowAction>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={currentPage} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </Card>

      <ProductFormModal
        open={formState.open}
        product={formState.product}
        companyId={companyId}
        onClose={() => setFormState({ open: false, product: null })}
      />
      <AdjustStockModal product={adjusting} companyId={companyId} onClose={() => setAdjusting(null)} />
      <DeleteProductModal product={deleting} companyId={companyId} onClose={() => setDeleting(null)} />
    </div>
  );
};

export default Products;
