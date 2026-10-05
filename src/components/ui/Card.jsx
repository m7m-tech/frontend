import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export const Card = ({ as: Tag = "section", className = "", children, ...rest }) => (
  <Tag
    className={`rounded-[22px] border border-line bg-white shadow-[0_1px_2px_rgba(20,20,20,0.03)] ${className}`}
    {...rest}
  >
    {children}
  </Tag>
);

export const CardHeader = ({ title, to, linkLabel, children, className = "" }) => (
  <div className={`flex items-center justify-between gap-3 ${className}`}>
    <h2 className="text-[19px] font-medium tracking-[-0.01em] text-black">{title}</h2>
    <div className="flex items-center gap-2">
      {children}
      {to && (
        <Link
          to={to}
          aria-label={linkLabel || `Open ${title}`}
          className="grid h-9 w-9 place-items-center rounded-full border border-line text-black transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-brand"
        >
          <ArrowUpRight size={16} strokeWidth={1.75} />
        </Link>
      )}
    </div>
  </div>
);

export const IconButton = ({ label, className = "", children, ...rest }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-white text-black transition-colors hover:bg-canvas disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-brand ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export const Button = ({ variant = "primary", className = "", children, ...rest }) => {
  const styles = {
    primary: "bg-brand text-black hover:bg-secondary",
    dark: "bg-black text-white hover:bg-deep",
    outline: "border border-line bg-white text-black hover:bg-canvas",
    danger: "bg-alert text-white hover:brightness-95",
    ghost: "text-black hover:bg-canvas",
  };
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
