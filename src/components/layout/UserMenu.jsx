import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, LogOut, Settings } from "lucide-react";

const UserMenu = ({ name, subtitle, initials, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-11 items-center gap-2.5 rounded-full border border-line bg-white py-1 pl-1 pr-3 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-brand"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-[13px] font-bold text-black">{initials}</span>
        <span className="hidden min-w-0 text-left leading-tight md:block">
          <span className="block max-w-[160px] truncate text-sm font-semibold text-black">{name}</span>
          {subtitle && <span className="block max-w-[160px] truncate text-[11px] text-gray">{subtitle}</span>}
        </span>
        <ChevronDown size={16} className={`text-gray transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+8px)] z-[1100] w-56 rounded-2xl border border-line bg-white p-1.5 shadow-xl">
          <div className="px-3 py-2 md:hidden">
            <p className="truncate text-sm font-semibold">{name}</p>
            {subtitle && <p className="truncate text-xs text-gray">{subtitle}</p>}
          </div>
          <Link
            role="menuitem"
            to="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm hover:bg-canvas"
          >
            <Settings size={16} aria-hidden="true" /> Settings
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-alert hover:bg-alert-soft"
          >
            <LogOut size={16} aria-hidden="true" /> Log out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
