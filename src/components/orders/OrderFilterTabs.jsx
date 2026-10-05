import React from "react";
import { ORDER_FILTERS } from "../../hooks/useOrders";

const OrderFilterTabs = ({ value, onChange, counts, filters = ORDER_FILTERS }) => (
  <div className="max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    <div role="tablist" aria-label="Filter orders by status" className="flex w-max items-center gap-0.5 rounded-full border border-line p-1">
      {filters.map((f) => {
        const active = value === f.key;
        return (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(f.key)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
              active ? "bg-brand font-medium text-black" : "text-gray hover:text-black"
            }`}
          >
            {f.label}
            <span className={`text-xs ${active ? "text-black" : f.key === "NEEDS_REVIEW" && counts?.[f.key] ? "text-alert" : "text-gray"}`}>
              {counts?.[f.key] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

export default OrderFilterTabs;
