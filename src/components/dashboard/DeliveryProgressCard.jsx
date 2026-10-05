import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { CircleCheck, Clock, TriangleAlert, Truck } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { EmptyState, ErrorState, InlineNotice } from "../ui/States";
import { ACTIVE_STATUSES } from "../../services/orderService";
import { isToday, pct } from "../../utils/format";

const Chip = ({ to, icon: Icon, label, value, tone = "default" }) => (
  <Link
    to={to}
    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] shadow-sm transition hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-brand ${
      tone === "alert" ? "border-alert/20 bg-alert-soft text-alert" : "border-line bg-white text-black"
    }`}
  >
    <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
    {label}
    <span className="font-semibold">{value}</span>
  </Link>
);

// Quadratic arc from 0% to 100%; the marker sits at the real percentage.
const P0 = [6, 40];
const P1 = [186, 6];
const P2 = [366, 40];
const pointAt = (t) => [0, 1].map((i) => (1 - t) ** 2 * P0[i] + 2 * (1 - t) * t * P1[i] + t ** 2 * P2[i]);

const ProgressArc = ({ value }) => {
  const [x, y] = pointAt(value / 100);
  return (
    <div className="relative">
      <div className="mb-1 flex justify-between text-xs text-gray">
        <span>0%</span>
        <span>100%</span>
      </div>
      <svg viewBox="0 0 372 48" className="h-auto w-full overflow-visible" role="img" aria-label={`${value}% delivered`}>
        <defs>
          <linearGradient id="rx-progress" x1="0" x2="1">
            <stop offset="0%" stopColor="#FFB38A" />
            <stop offset="55%" stopColor="#E9E59A" />
            <stop offset="100%" stopColor="#8FE600" />
          </linearGradient>
        </defs>
        <path d={`M${P0} Q${P1} ${P2}`} fill="none" stroke="url(#rx-progress)" strokeWidth="4" strokeLinecap="round" />
        <circle cx={x} cy={y} r="7" fill="#fff" stroke="#222" strokeWidth="3.5" />
        <g transform={`translate(${x} ${y - 24})`}>
          <rect x="-21" y="-12" width="42" height="22" rx="11" fill="#222" />
          <text x="0" y="3.5" textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff">
            {value}%
          </text>
        </g>
      </svg>
    </div>
  );
};

const DeliveryProgressCard = ({ orders, error, complete, onRetry }) => {
  const stats = useMemo(() => {
    // Only call it "today" when the backend gives us timestamps to filter on.
    const hasTimestamps = orders.some((o) => o.createdAt);
    const scope = hasTimestamps ? orders.filter((o) => isToday(o.createdAt)) : orders;
    const considered = scope.filter((o) => o.status !== "CANCELLED");
    const count = (fn) => considered.filter(fn).length;
    const delivered = count((o) => o.status === "DELIVERED");
    return {
      hasTimestamps,
      total: considered.length,
      active: count((o) => ACTIVE_STATUSES.includes(o.status)),
      inTransit: count((o) => o.status === "IN_TRANSIT"),
      needsReview: count((o) => o.status === "NEEDS_REVIEW"),
      delivered,
      percent: pct(delivered, considered.length),
    };
  }, [orders]);

  const title = stats.hasTimestamps ? "Today's delivery progress" : "Delivery progress";

  return (
    <Card className="flex min-h-[318px] flex-col bg-linear-to-b from-soft/70 via-white to-white p-5">
      <CardHeader title={title} to="/orders" linkLabel="Open orders" />
      {error ? (
        <ErrorState title="Unable to load orders." message={error?.message} onRetry={onRetry} className="flex-1" />
      ) : stats.total === 0 ? (
        <EmptyState
          icon={Truck}
          title={stats.hasTimestamps ? "No orders today yet" : "No orders yet"}
          description="Delivery progress appears here as orders come in."
          className="flex-1"
        />
      ) : (
        <>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip to="/orders?status=ACTIVE" icon={Clock} label="Active" value={stats.active} />
            <Chip to="/orders?status=IN_TRANSIT" icon={Truck} label="In transit" value={stats.inTransit} />
            <Chip to="/orders?status=DELIVERED" icon={CircleCheck} label="Delivered" value={stats.delivered} />
            {stats.needsReview > 0 && (
              <Chip to="/orders?status=NEEDS_REVIEW" icon={TriangleAlert} label="Needs review" value={stats.needsReview} tone="alert" />
            )}
          </div>
          <div className="mt-auto pt-8">
            <ProgressArc value={stats.percent} />
            <p className="mt-3 text-center text-sm text-gray">
              <span className="font-semibold text-black">
                {stats.delivered} / {stats.total} orders
              </span>{" "}
              delivered{stats.hasTimestamps ? " today" : ""} ({stats.percent}%)
            </p>
            {!complete && <InlineNotice className="mt-2 justify-center">Based on the most recent orders only.</InlineNotice>}
          </div>
        </>
      )}
    </Card>
  );
};

export default DeliveryProgressCard;
