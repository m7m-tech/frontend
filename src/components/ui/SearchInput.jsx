import React from "react";
import { Search } from "lucide-react";

const SearchInput = ({ value, onChange, placeholder, label, className = "" }) => (
  <label className={`flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 ${className}`}>
    <Search size={17} className="shrink-0 text-gray" aria-hidden="true" />
    <span className="sr-only">{label || placeholder}</span>
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent text-sm outline-none placeholder:text-gray"
    />
  </label>
);

export default SearchInput;
