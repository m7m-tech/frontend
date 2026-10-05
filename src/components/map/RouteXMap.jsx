import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Maximize2, Minimize2, Minus, Plus } from "lucide-react";
import { destinationIcon, driverIcon } from "./markers";
import { OrderStatusBadge } from "../ui/StatusBadge";
import { formatDateTime, timeAgo } from "../../utils/format";

// OpenStreetMap's standard tiles need no API key (muted via CSS to match the
// light design). OSM's tile policy limits heavy production traffic — point
// VITE_MAP_TILE_URL at a dedicated provider before scaling up.
const TILE_URL = import.meta.env.VITE_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  import.meta.env.VITE_MAP_TILE_ATTRIBUTION ||
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Fits the viewport to operational markers once they first appear — and
// never again after the user has panned/zoomed themselves.
const FitToMarkers = ({ points }) => {
  const map = useMap();
  const fittedRef = useRef(false);
  const userMovedRef = useRef(false);

  useMapEvents({
    dragstart: () => (userMovedRef.current = true),
    zoomstart: (e) => {
      if (e.originalEvent) userMovedRef.current = true;
    },
  });

  useEffect(() => {
    if (fittedRef.current || userMovedRef.current || points.length === 0) return;
    fittedRef.current = true;
    if (points.length === 1) map.setView([points[0].lat, points[0].lng], 14);
    else map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), { padding: [60, 60], maxZoom: 14 });
  }, [map, points]);

  return null;
};

const FlyToSelection = ({ target, markerRefs }) => {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.coords.lat, target.coords.lng], Math.max(map.getZoom(), 14), { duration: 0.6 });
    const t = setTimeout(() => markerRefs.current[target.key]?.openPopup(), 650);
    return () => clearTimeout(t);
  }, [map, target, markerRefs]);
  return null;
};

const ZoomControls = () => {
  const map = useMap();
  const btn =
    "grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-black shadow-sm hover:bg-canvas focus-visible:outline-2 focus-visible:outline-brand";
  return (
    <div className="absolute bottom-4 right-4 z-[500] flex flex-col gap-2">
      <button type="button" aria-label="Zoom in" className={btn} onClick={() => map.zoomIn()}>
        <Plus size={18} />
      </button>
      <button type="button" aria-label="Zoom out" className={btn} onClick={() => map.zoomOut()}>
        <Minus size={18} />
      </button>
    </div>
  );
};

// Keeps Leaflet's internal size in sync when the container changes size
// (fullscreen toggle, responsive layout).
const ResizeWatcher = ({ containerRef }) => {
  const map = useMap();
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [map, containerRef]);
  return null;
};

const DeliveryPopup = ({ order }) => (
  <div className="min-w-[190px] space-y-1.5">
    <div className="flex items-center justify-between gap-3">
      <span className="font-semibold text-black">{order.reference}</span>
      <OrderStatusBadge status={order.status} />
    </div>
    {order.customerName && <p className="m-0! text-black">{order.customerName}</p>}
    {order.address && <p className="m-0! text-gray">{order.address}</p>}
    {order.driverName && <p className="m-0! text-gray">Driver · {order.driverName}</p>}
    {order.eta && <p className="m-0! text-gray">ETA · {formatDateTime(order.eta)}</p>}
  </div>
);

const DriverPopup = ({ driver }) => (
  <div className="min-w-[170px] space-y-1">
    <p className="m-0! font-semibold text-black">{driver.name}</p>
    {driver.status && <p className="m-0! text-gray">{driver.status}</p>}
    {driver.currentOrder && <p className="m-0! text-gray">Order · {driver.currentOrder}</p>}
    {driver.updatedAt && <p className="m-0! text-gray">Updated {timeAgo(driver.updatedAt)}</p>}
  </div>
);

/**
 * deliveries: normalized orders that have real `coords`
 * drivers:    [{ id, name, status, coords, updatedAt, stale }] — rendered when
 *             a tracking source exists (none is exposed by the backend yet)
 */
const RouteXMap = ({
  view,
  deliveries = [],
  drivers = [],
  selected = null, // { type: "delivery" | "driver", id }
  onSelect,
  className = "",
  allowFullscreen = true,
  children,
}) => {
  const containerRef = useRef(null);
  const markerRefs = useRef({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else containerRef.current?.requestFullscreen?.();
  };

  const points = useMemo(
    () => [...deliveries.map((d) => d.coords), ...drivers.map((d) => d.coords)].filter(Boolean),
    [deliveries, drivers]
  );

  const target = useMemo(() => {
    if (!selected) return null;
    const list = selected.type === "driver" ? drivers : deliveries;
    const item = list.find((x) => x.id === selected.id);
    return item?.coords ? { coords: item.coords, key: `${selected.type}:${item.id}` } : null;
  }, [selected, deliveries, drivers]);

  return (
    <div ref={containerRef} className={`relative isolate overflow-hidden bg-[#eef0ea] ${className}`}>
      <MapContainer
        center={view.center}
        zoom={view.zoom}
        zoomControl={false}
        className="routex-map h-full w-full"
        worldCopyJump
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={19} />
        <FitToMarkers points={points} />
        <FlyToSelection target={target} markerRefs={markerRefs} />
        <ResizeWatcher containerRef={containerRef} />
        <ZoomControls />

        {deliveries.map((order) => {
          const key = `delivery:${order.id}`;
          const isSelected = selected?.type === "delivery" && selected.id === order.id;
          return (
            <Marker
              key={key}
              position={[order.coords.lat, order.coords.lng]}
              icon={destinationIcon({ status: order.status, selected: isSelected })}
              ref={(m) => (markerRefs.current[key] = m)}
              eventHandlers={{ click: () => onSelect?.({ type: "delivery", id: order.id }) }}
              title={`Delivery ${order.reference}`}
              keyboard
            >
              <Popup>
                <DeliveryPopup order={order} />
              </Popup>
            </Marker>
          );
        })}

        {drivers.map((driver) => {
          const key = `driver:${driver.id}`;
          const isSelected = selected?.type === "driver" && selected.id === driver.id;
          return (
            <Marker
              key={key}
              position={[driver.coords.lat, driver.coords.lng]}
              icon={driverIcon({ selected: isSelected, stale: driver.stale })}
              ref={(m) => (markerRefs.current[key] = m)}
              eventHandlers={{ click: () => onSelect?.({ type: "driver", id: driver.id }) }}
              title={`Driver ${driver.name}`}
              zIndexOffset={1000}
              keyboard
            >
              <Popup>
                <DriverPopup driver={driver} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {allowFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen map"}
          className="absolute right-4 top-4 z-[500] grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-black shadow-sm hover:bg-canvas focus-visible:outline-2 focus-visible:outline-brand"
        >
          {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
        </button>
      )}

      {/* Overlays (search, legend, empty states) supplied by the page. */}
      {children}
    </div>
  );
};

export default RouteXMap;
