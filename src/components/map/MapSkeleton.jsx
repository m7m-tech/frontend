import React from "react";
import { SkeletonBlock } from "../skeletons/primitives";

// Same box as the live map: toolbar pills top-left, control column right.
const MapSkeleton = ({ className = "" }) => (
  <div aria-hidden="true" className={`relative overflow-hidden skeleton ${className}`}>
    <div className="absolute left-4 top-4 flex gap-2">
      <SkeletonBlock className="h-11 w-[min(300px,50vw)] rounded-full! bg-white/70!" />
      <SkeletonBlock className="hidden h-11 w-36 rounded-full! bg-white/70! sm:block" />
    </div>
    <SkeletonBlock className="absolute right-4 top-4 h-10 w-10 rounded-full! bg-white/70!" />
    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
      <SkeletonBlock className="h-10 w-10 rounded-full! bg-white/70!" />
      <SkeletonBlock className="h-10 w-10 rounded-full! bg-white/70!" />
    </div>
  </div>
);

export default MapSkeleton;
