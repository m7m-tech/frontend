import React, { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { MapPin, MapPinned, Truck } from "lucide-react";
import RouteXMap from "../components/map/RouteXMap";
import { destinationTone } from "../components/map/markers";
import { Card } from "../components/ui/Card";
import { OrderStatusBadge } from "../components/ui/StatusBadge";
import { EmptyState, ErrorState } from "../components/ui/States";
import SearchInput from "../components/ui/SearchInput";
import { LiveTrackingSkeleton } from "../components/skeletons/PageSkeletons";
import { DESTINATION_FILTERS } from "../components/dashboard/LiveTrackingPreview";
import { matchesSearch, useOrders } from "../hooks/useOrders";
import useMapView from "../hooks/useMapView";
import useNow from "../hooks/useNow";
import { timeAgo } from "../utils/format";

const TONE_DOT = { active: "bg-brand", alert: "bg-alert", done: "bg-black", muted: "bg-muted" };
const PANEL_HEIGHT = "h-[calc(100dvh-140px)] min-h-[520px]";

const LiveTracking = () => {
  const { companyId, profile } = useOutletContext();
  const { orders, isLoading, error, data, refetch, updatedAt } = useOrders(companyId);
  const mapView = useMapView(profile);
  const now = useNow();
  const [query, setQuery] = useState("");
  const [filterKey, setFilterKey] = useState("ACTIVE");
  const [tab, setTab] = useState("deliveries");
  const [selected, setSelected] = useState(null);

  const filter = DESTINATION_FILTERS.find((f) => f.key === filterKey);
  const q = query.trim().toLowerCase();
  const withCoords = useMemo(() => orders.filter((o) => o.coords), [orders]);
  const deliveries = useMemo(() => withCoords.filter((o) => filter.match(o) && matchesSearch(o, q)), [withCoords, filter, q]);
  const missingCoords = orders.filter((o) => filter.match(o) && !o.coords).length;

  if (isLoading) return <LiveTrackingSkeleton />;

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
      <h1 className="sr-only">Live tracking</h1>
      <Card className={`flex flex-col overflow-hidden ${PANEL_HEIGHT}`}>
        <div className="space-y-3 border-b border-line p-4">
          <div role="tablist" aria-label="Map layers" className="grid grid-cols-2 gap-1 rounded-full border border-line p-1">
            {[
              ["deliveries", "Deliveries"],
              ["drivers", "Drivers"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`rounded-full py-2 text-sm ${tab === key ? "bg-brand font-medium" : "text-gray hover:text-black"}`}
              >
                {label}
              </button>
            ))}
          </div>
          {tab === "deliveries" && (
            <>
              <SearchInput value={query} onChange={setQuery} placeholder="Search order, customer, address" />
              <select
                aria-label="Filter destinations"
                value={filterKey}
                onChange={(e) => setFilterKey(e.target.value)}
                className="h-10 w-full rounded-full border border-line bg-white px-4 text-sm outline-none focus:border-brand"
              >
                {DESTINATION_FILTERS.map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.label}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === "drivers" ? (
            <EmptyState
              icon={Truck}
              title="No live driver locations"
              description="Driver positions, status and last GPS update appear here once driver tracking is available for your fleet."
              className="h-full"
            />
          ) : error && !data ? (
            <ErrorState title="Tracking data is temporarily unavailable." onRetry={refetch} className="h-full" />
          ) : deliveries.length === 0 ? (
            <EmptyState
              icon={MapPinned}
              title={withCoords.length === 0 ? "No delivery locations yet" : "No destinations match"}
              description={
                withCoords.length === 0
                  ? "Orders show on the map once they include map coordinates."
                  : "Try a different filter or search."
              }
              className="h-full"
            />
          ) : (
            <ul className="divide-y divide-line">
              {deliveries.map((o) => {
                const active = selected?.type === "delivery" && selected.id === o.id;
                return (
                  <li key={o.id}>
                    <button
                      type="button"
                      onClick={() => setSelected({ type: "delivery", id: o.id })}
                      aria-current={active ? "true" : undefined}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-canvas/60 ${active ? "bg-soft/60" : ""}`}
                    >
                      <span className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full ${TONE_DOT[destinationTone(o.status)]}`}>
                        <MapPin size={14} className={destinationTone(o.status) === "active" ? "text-black" : "text-white"} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-semibold">{o.reference}</span>
                          <OrderStatusBadge status={o.status} />
                        </span>
                        <span className="mt-0.5 block truncate text-sm">{o.customerName || "—"}</span>
                        <span className="block truncate text-xs text-gray">{o.address || "No address"}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {tab === "deliveries" && (
          <p className="border-t border-line px-4 py-2.5 text-xs text-gray">
            Synced {timeAgo(updatedAt, now) || "just now"}
            {missingCoords > 0 && ` · ${missingCoords} order${missingCoords === 1 ? "" : "s"} without map location`}
          </p>
        )}
      </Card>

      <RouteXMap
        view={mapView.view}
        deliveries={deliveries}
        selected={selected}
        onSelect={setSelected}
        className={`${PANEL_HEIGHT} rounded-[22px] border border-line`}
      >
        <div className="pointer-events-none absolute bottom-4 left-4 z-[500] flex flex-wrap gap-2 pr-16">
          <span className="pointer-events-auto flex items-center gap-3 rounded-full border border-line bg-white px-3.5 py-2 text-xs shadow-sm">
            <span className="flex items-center gap-1.5">
              <span className="grid h-4 w-4 place-items-center rounded-full border-2 border-brand bg-black" /> Driver
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white bg-brand shadow" /> Destination
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white bg-alert shadow" /> Needs review
            </span>
          </span>
          {mapView.label && withCoords.length === 0 && (
            <span className="pointer-events-auto rounded-full border border-line bg-white px-3 py-2 text-xs text-gray shadow-sm">
              {mapView.label}
            </span>
          )}
        </div>
      </RouteXMap>
    </div>
  );
};

export default LiveTracking;
