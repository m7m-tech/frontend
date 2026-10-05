import L from "leaflet";

// Inline SVG (lucide "truck" / "map-pin" paths) so markers render without a
// second React root per marker.
const svg = (paths, color, size) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const TRUCK =
  '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>';
const PIN =
  '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>';

// Driver = dark disc with a lime ring and a truck (the design's vehicle
// marker). Stale/offline tracking switches to the alert ring.
export const driverIcon = ({ selected = false, stale = false } = {}) => {
  const size = selected ? 52 : 40;
  const ring = stale ? "#F04A12" : "#8FE600";
  return L.divIcon({
    className: "routex-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:#222;border:${selected ? 5 : 4}px solid ${ring};display:grid;place-items:center;box-shadow:0 4px 12px rgba(0,0,0,.25)">${svg(TRUCK, "#fff", selected ? 20 : 16)}</div>`,
  });
};

const DESTINATION_TONES = {
  active: { bg: "#8FE600", fg: "#222" },
  alert: { bg: "#F04A12", fg: "#fff" },
  done: { bg: "#222", fg: "#8FE600" },
  muted: { bg: "#B8B8B2", fg: "#fff" },
};

export const destinationTone = (status) => {
  if (status === "NEEDS_REVIEW") return "alert";
  if (status === "DELIVERED") return "done";
  if (status === "CANCELLED") return "muted";
  return "active";
};

// Destination = small lime pin disc with a white ring — clearly distinct
// from the larger dark driver discs.
export const destinationIcon = ({ status, selected = false } = {}) => {
  const tone = DESTINATION_TONES[destinationTone(status)];
  const size = selected ? 40 : 30;
  return L.divIcon({
    className: "routex-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${tone.bg};border:3px solid #fff;display:grid;place-items:center;box-shadow:0 3px 10px rgba(0,0,0,.2)">${svg(PIN, tone.fg, selected ? 18 : 14)}</div>`,
  });
};
