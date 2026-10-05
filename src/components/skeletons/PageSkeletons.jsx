import React from "react";
import { SkeletonBlock, SkeletonCard, SkeletonTableRow, SkeletonText, SrLoading } from "./primitives";
import MapSkeleton from "../map/MapSkeleton";

// Page title row shared by every non-dashboard page.
export const PageHeaderSkeleton = ({ action = true }) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div className="space-y-2">
      <SkeletonBlock className="h-7 w-44" />
      <SkeletonBlock className="h-3.5 w-72 max-w-[70vw]" />
    </div>
    {action && <SkeletonBlock className="h-11 w-36 rounded-full!" />}
  </div>
);

const TablePage = ({ label, tabs = 0, rows = 8, columns = 6 }) => (
  <div>
    <SrLoading label={label} />
    <PageHeaderSkeleton />
    <SkeletonCard>
      <div className="flex flex-wrap items-center gap-3 p-5">
        <SkeletonBlock className="h-11 w-full max-w-sm rounded-full!" />
        {tabs > 0 && <SkeletonBlock className="h-11 w-[min(560px,100%)] rounded-full!" />}
      </div>
      <SkeletonBlock className="mx-6 mb-1 h-4 w-[calc(100%-3rem)] rounded!" />
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} columns={columns} />
      ))}
    </SkeletonCard>
  </div>
);

export const OrdersSkeleton = () => <TablePage label="Loading orders" tabs={6} />;

export const ProductsSkeleton = () => <TablePage label="Loading products" columns={6} />;

export const DriversSkeleton = () => (
  <div>
    <SrLoading label="Loading drivers" />
    <PageHeaderSkeleton action={false} />
    <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
      <SkeletonCard className="space-y-4 p-6">
        <SkeletonBlock className="h-5 w-40" />
        <SkeletonBlock className="h-14 w-full rounded-full!" />
        <SkeletonText lines={3} />
      </SkeletonCard>
      <SkeletonCard className="p-6">
        <SkeletonBlock className="h-5 w-32" />
        <SkeletonBlock className="mt-6 h-48 w-full rounded-2xl!" />
      </SkeletonCard>
    </div>
  </div>
);

export const LiveTrackingSkeleton = () => (
  <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
    <SrLoading label="Loading live tracking" />
    <SkeletonCard className="flex h-[calc(100dvh-140px)] min-h-[520px] flex-col gap-3 p-4">
      <SkeletonBlock className="h-11 w-full rounded-full!" />
      <SkeletonBlock className="h-9 w-full rounded-full!" />
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl p-2">
          <SkeletonBlock className="h-9 w-9 rounded-full!" />
          <SkeletonText lines={2} className="flex-1" />
        </div>
      ))}
    </SkeletonCard>
    <MapSkeleton className="h-[calc(100dvh-140px)] min-h-[520px] rounded-[22px]" />
  </div>
);

export const OperationsSkeleton = () => (
  <div>
    <SrLoading label="Loading operations" />
    <PageHeaderSkeleton action={false} />
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <SkeletonCard className="p-5">
        <SkeletonBlock className="h-5 w-40" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="mt-4 flex items-center gap-3 border-t border-line pt-4">
            <SkeletonBlock className="h-10 w-10 rounded-full!" />
            <SkeletonText lines={2} className="flex-1" />
          </div>
        ))}
      </SkeletonCard>
      <SkeletonCard className="p-5">
        <SkeletonBlock className="h-5 w-32" />
        <SkeletonBlock className="mt-6 h-40 w-full rounded-2xl!" />
      </SkeletonCard>
    </div>
  </div>
);

export const SettingsSkeleton = () => (
  <div>
    <SrLoading label="Loading settings" />
    <PageHeaderSkeleton action={false} />
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonCard key={i} className="space-y-4 p-6">
          <SkeletonBlock className="h-5 w-36" />
          <SkeletonText lines={3} />
          <SkeletonBlock className="h-10 w-32 rounded-full!" />
        </SkeletonCard>
      ))}
    </div>
  </div>
);
