import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, pageCount, total, pageSize, onChange }) => {
  if (pageCount <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const btn = "grid h-9 w-9 place-items-center rounded-full border border-line hover:bg-canvas disabled:opacity-30";
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3 border-t border-line px-6 py-3 text-sm text-gray">
      <span>
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Previous page" className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft size={16} />
        </button>
        <span className="text-black">
          {page} / {pageCount}
        </span>
        <button type="button" aria-label="Next page" className={btn} disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
