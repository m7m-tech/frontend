import { COUNTRY_VIEWS, WORLD_VIEW } from "../utils/geo";

// Default viewport from the company's registration data:
//   1. stored coordinates (none exposed by the backend today)
//   2. the registered country — framed as a country overview and labelled so
//   3. a neutral world view, clearly labelled as "location not set"
// Markers (when present) then refine the view via FitToMarkers.
export default function useMapView(profile) {
  if (profile.coords) {
    return { view: { center: [profile.coords.lat, profile.coords.lng], zoom: 12 }, source: "company", label: null };
  }
  const country = profile.country && COUNTRY_VIEWS[profile.country];
  if (country) {
    return { view: country, source: "country", label: `${profile.country} overview` };
  }
  return { view: WORLD_VIEW, source: "fallback", label: "Company location not set" };
}
