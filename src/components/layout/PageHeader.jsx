import React from "react";

const PageHeader = ({ title, description, children }) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-[28px] font-medium tracking-[-0.02em] text-black">{title}</h1>
      {description && <p className="mt-1 text-sm text-gray">{description}</p>}
    </div>
    {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
  </div>
);

export default PageHeader;
