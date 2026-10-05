import React from "react";

export const SkeletonBlock = ({ className = "", style }) => (
  <div aria-hidden="true" style={style} className={`skeleton rounded-lg ${className}`} />
);

export const SkeletonText = ({ lines = 1, className = "", widths = ["w-3/4", "w-1/2", "w-2/3"] }) => (
  <div aria-hidden="true" className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`skeleton h-3 rounded-full ${widths[i % widths.length]}`} />
    ))}
  </div>
);

export const SkeletonCard = ({ className = "", children }) => (
  <div aria-hidden="true" className={`rounded-[22px] border border-line bg-white ${className}`}>
    {children}
  </div>
);

// Mirrors the 64px order/product rows so content swaps in without shifting.
export const SkeletonTableRow = ({ columns = 6 }) => (
  <div aria-hidden="true" className="flex h-16 items-center gap-6 border-t border-line px-6">
    <div className="skeleton h-9 w-9 shrink-0 rounded-full" />
    {Array.from({ length: columns - 1 }).map((_, i) => (
      <div key={i} className="flex-1 space-y-2">
        <div className="skeleton h-3 w-4/5 rounded-full" />
        {i % 2 === 0 && <div className="skeleton h-2.5 w-1/2 rounded-full" />}
      </div>
    ))}
  </div>
);

export const SrLoading = ({ label }) => (
  <span className="sr-only" role="status">
    {label}
  </span>
);
