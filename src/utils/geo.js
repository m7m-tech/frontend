const valid = (lat, lng) =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0);

const fromObject = (o) => {
  if (!o || typeof o !== "object") return null;
  // GeoJSON Point: coordinates are [lng, lat].
  if (o.type === "Point" && Array.isArray(o.coordinates)) {
    const [lng, lat] = o.coordinates.map(Number);
    return valid(lat, lng) ? { lat, lng } : null;
  }
  const lat = Number(o.latitude ?? o.lat);
  const lng = Number(o.longitude ?? o.lng ?? o.lon);
  return valid(lat, lng) ? { lat, lng } : null;
};

// Returns the first real coordinate pair found among the given sources, or
// null. Never fabricates a position from text such as an address.
export const extractCoords = (...sources) => {
  for (const s of sources) {
    const c = fromObject(s);
    if (c) return c;
  }
  return null;
};

// Country-level framing for the countries the registration form offers.
// Used only when the company has no stored coordinates, and the map labels
// it as a country overview — not as the company's service area.
export const COUNTRY_VIEWS = {
  "Saudi Arabia": { center: [23.9, 45.1], zoom: 5 },
  "United Arab Emirates": { center: [24.3, 54.4], zoom: 7 },
  Qatar: { center: [25.3, 51.2], zoom: 9 },
  Kuwait: { center: [29.3, 47.8], zoom: 8 },
  Bahrain: { center: [26.07, 50.55], zoom: 10 },
  Oman: { center: [21.5, 56.5], zoom: 6 },
};

export const WORLD_VIEW = { center: [20, 10], zoom: 2 };
