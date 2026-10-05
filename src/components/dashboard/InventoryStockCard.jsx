import React, { useMemo } from "react";
import { Package } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { EmptyState, ErrorState, InlineNotice } from "../ui/States";
import { stockLevel } from "../../services/productService";
import { formatNumber, pct } from "../../utils/format";

const BAR_COLORS = { ok: "bg-black", low: "bg-alert", out: "bg-alert/30", unknown: "bg-muted" };
const MAX_BARS = 40;

// No stock history exists in the API, so instead of the reference's trend
// line this shows the real current stock of each product (largest first).
const StockBars = ({ products }) => {
  const bars = useMemo(
    () =>
      [...products]
        .filter((p) => p.stockQuantity !== null)
        .sort((a, b) => b.stockQuantity - a.stockQuantity)
        .slice(0, MAX_BARS),
    [products]
  );
  const max = Math.max(1, ...bars.map((p) => p.stockQuantity));

  return (
    <div>
      <div className="flex h-[104px] items-end gap-[3px] border-b border-line" role="img" aria-label="Current stock per product">
        {bars.map((p) => {
          const level = stockLevel(p);
          return (
            <div
              key={p.id}
              title={`${p.name}: ${formatNumber(p.stockQuantity)} units`}
              className={`min-w-[3px] max-w-[14px] flex-1 rounded-t-full ${BAR_COLORS[level]}`}
              style={{ height: `${Math.max(4, (Math.max(0, p.stockQuantity) / max) * 100)}%` }}
            />
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray">
        <span>Current stock per product{products.length > MAX_BARS ? ` · top ${MAX_BARS}` : ""}</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-black" />Healthy</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-alert" />Low / out</span>
        </span>
      </div>
    </div>
  );
};

const InventoryStockCard = ({ products, summary, error, complete, onRetry }) => (
  <Card className="flex min-h-[300px] flex-col p-5">
    <CardHeader title="Inventory & stock" to="/products" linkLabel="Open products" />
    {error ? (
      <ErrorState title="Unable to load products." message={error?.message} onRetry={onRetry} className="flex-1" />
    ) : summary.total === 0 ? (
      <EmptyState icon={Package} title="No products yet" description="Add products to track stock levels here." className="flex-1" />
    ) : (
      <>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-start gap-3">
          <div className="space-y-3">
            <div>
              <p className="text-[17px] font-semibold">{pct(summary.inStock, summary.total)}%</p>
              <p className="text-xs text-gray">In stock</p>
            </div>
            <div>
              <p className="text-[17px] font-semibold">{pct(summary.out, summary.total)}%</p>
              <p className="text-xs text-gray">Out of stock</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray">Total products</p>
            <p className="text-[44px] leading-tight font-semibold tracking-[-0.03em]">{formatNumber(summary.total)}</p>
          </div>
          <div className="space-y-3 text-right">
            <div>
              <p className={`text-[17px] font-semibold ${summary.low ? "text-alert" : ""}`}>
                {summary.low} product{summary.low === 1 ? "" : "s"}
              </p>
              <p className="text-xs text-gray">Low stock</p>
            </div>
            <div>
              <p className="text-[17px] font-semibold">{formatNumber(summary.units)}</p>
              <p className="text-xs text-gray">Units in stock</p>
            </div>
          </div>
        </div>
        <div className="mt-auto pt-5">
          <StockBars products={products} />
          {!complete && <InlineNotice className="mt-2">Showing a partial product list.</InlineNotice>}
        </div>
      </>
    )}
  </Card>
);

export default InventoryStockCard;
