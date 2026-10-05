import React from "react";
import { SkeletonBlock, SkeletonCard, SkeletonTableRow, SkeletonText, SrLoading } from "./primitives";
import MapSkeleton from "../map/MapSkeleton";

export const DASHBOARD_GRID = "grid gap-4 lg:grid-cols-[minmax(300px,29%)_minmax(0,1fr)]";
export const MAP_HEIGHT = "h-[clamp(540px,52vh,470px)]";

const CardHead = () => (
  <div className="flex items-center justify-between">
    <SkeletonBlock className="h-5 w-48" />
    <SkeletonBlock className="h-9 w-9 rounded-full!" />
  </div>
);

export const OrdersTableSkeleton = ({ rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonTableRow key={i} columns={6} />
    ))}
  </>
);

const DashboardSkeleton = () => (
  <div className={DASHBOARD_GRID}>
    <SrLoading label="Loading dashboard" />
    <div className="flex flex-col gap-4">
      <SkeletonCard className="p-5">
        <CardHead />
        <div className="mt-5 flex flex-wrap gap-2">
          {[24, 28, 26, 30].map((w, i) => (
            <SkeletonBlock key={i} className="h-8 rounded-full!" style={{ width: `${w * 4}px` }} />
          ))}
        </div>
        <SkeletonBlock className="mt-8 h-24 w-full rounded-2xl!" />
        <SkeletonText className="mt-4" widths={["w-2/3"]} />
      </SkeletonCard>
      <SkeletonCard className="p-5">
        <CardHead />
        <div className="mt-5 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <SkeletonBlock className="h-4 w-4 rounded-full!" />
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="ml-auto h-3 w-40" />
            </div>
          ))}
        </div>
      </SkeletonCard>
      <SkeletonCard className="p-5">
        <CardHead />
        <div className="mt-5 grid grid-cols-3 gap-3">
          <SkeletonText lines={2} />
          <SkeletonBlock className="h-12" />
          <SkeletonText lines={2} />
        </div>
        <SkeletonBlock className="mt-6 h-28 w-full rounded-xl!" />
      </SkeletonCard>
    </div>

    <div className="flex min-w-0 flex-col gap-4">
      <MapSkeleton className={`${MAP_HEIGHT} rounded-[22px]`} />
      <SkeletonCard>
        <div className="flex flex-wrap items-center justify-between gap-3 p-6">
          <SkeletonBlock className="h-6 w-24" />
          <SkeletonBlock className="h-11 w-[min(520px,70%)] rounded-full!" />
        </div>
        <SkeletonBlock className="mx-6 mb-1 h-4 w-[calc(100%-3rem)] rounded!" />
        <OrdersTableSkeleton />
      </SkeletonCard>
    </div>
  </div>
);

export default DashboardSkeleton;
