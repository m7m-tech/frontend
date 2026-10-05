import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPinned, Search, TriangleAlert } from "lucide-react";
import RouteXMap from "../map/RouteXMap";
import { ACTIVE_STATUSES } from "../../services/orderService";
import { matchesSearch } from "../../hooks/useOrders";
import { timeAgo } from "../../utils/format";
import { MAP_HEIGHT } from "../skeletons/DashboardSkeleton";

export const DESTINATION_FILTERS = [
  { key: "ACTIVE", label: "Active deliveries", match: (o) => ACTIVE_STATUSES.includes(o.status) },
  { key: "ALL", label: "All destinations", match: () => true },
  { key: "NEEDS_REVIEW", label: "Needs review", match: (o) => o.status === "NEEDS_REVIEW" },
  { key: "DELIVERED", label: "Delivered", match: (o) => o.status === "DELIVERED" },
];

const pill = "rounded-full border border-line bg-white shadow-sm";

const LiveTrackingPreview = ({ orders, ordersUpdatedAt, mapView, attentionCount, now }) => {
  const [query, setQuery] = useState("");
  const [filterKey, setFilterKey] = useState("ACTIVE");
  const [selected, setSelected] = useState(null);

  const withCoords = useMemo(() => orders.filter((o) => o.coords), [orders]);
  const filter = DESTINATION_FILTERS.find((f) => f.key === filterKey);
  const q = query.trim().toLowerCase();
  const deliveries = useMemo(() => withCoords.filter((o) => filter.match(o) && matchesSearch(o, q)), [withCoords, filter, q]);

  return (
    <RouteXMap
      view={mapView.view}
      deliveries={deliveries}
      selected={selected}
      onSelect={setSelected}
      className={`${MAP_HEIGHT} rounded-[22px] border border-line`}
    >
      {/* Toolbar: search + filter (left), sync status (right of it) */}
      <div className="pointer-events-none absolute inset-x-4 top-4 z-[500] flex flex-wrap items-start gap-2 pr-12">
        <label className={`pointer-events-auto flex h-11 w-full max-w-[300px] items-center gap-2 px-4 ${pill}`}>
          <Search size={17} className="text-gray" aria-hidden="true" />
          <span className="sr-only">Search orders on map</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order, customer or address"
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray"
          />
        </label>
        <label className={`pointer-events-auto flex h-11 items-center gap-1 pl-4 pr-2 text-sm ${pill}`}>
          <span className="text-gray">Show</span>
          <select
            value={filterKey}
            onChange={(e) => setFilterKey(e.target.value)}
            className="cursor-pointer bg-transparent pr-1 font-medium outline-none"
          >
            {DESTINATION_FILTERS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <div className={`pointer-events-auto ml-auto hidden h-11 items-center gap-2 px-4 text-sm md:flex ${pill}`}>
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand" />
          <span className="font-medium">Synced</span>
          <span className="text-gray">{timeAgo(ordersUpdatedAt, now) || "just now"}</span>
        </div>
      </div>

      {/* Honest data notes: no tracking feed, and no coordinates on orders. */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[400] w-[min(360px,80%)] -translate-x-1/2 -translate-y-1/2">
        {withCoords.length === 0 && (
          <div className="rounded-2xl border border-line bg-white/95 p-4 text-center shadow-sm">
            <MapPinned size={20} className="mx-auto text-gray" aria-hidden="true" />
            <p className="mt-1.5 text-sm font-medium">No live locations available</p>
            <p className="mt-0.5 text-xs text-gray">
              Driver positions and delivery pins appear here once location data is available for your fleet and orders.
            </p>
          </div>
        )}
        {withCoords.length > 0 && deliveries.length === 0 && (
          <p className="mx-auto w-fit rounded-full bg-white/95 px-4 py-2 text-center text-xs shadow-sm">No destinations match this filter.</p>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[500] flex flex-wrap items-end gap-2 pr-14">
        {attentionCount > 0 && (
          <div className={`pointer-events-auto flex items-center gap-3 py-1.5 pl-3 pr-1.5 ${pill}`}>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-alert-soft text-alert">
              <TriangleAlert size={15} aria-hidden="true" />
            </span>
            <span className="text-sm font-medium">
              {attentionCount} item{attentionCount === 1 ? "" : "s"} need attention
            </span>
            <Link to="/operations" className="rounded-full bg-black px-3.5 py-2 text-xs font-medium text-white hover:bg-deep">
              Review
            </Link>
          </div>
        )}
        {mapView.label && withCoords.length === 0 && (
          <span className={`pointer-events-auto px-3 py-1.5 text-xs text-gray ${pill}`}>{mapView.label}</span>
        )}
        <Link
          to="/live-tracking"
          className="pointer-events-auto ml-auto rounded-full bg-brand px-5 py-3 text-sm font-medium text-black shadow-sm hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Open live tracking
        </Link>
      </div>
    </RouteXMap>
  );
};

export default LiveTrackingPreview;
