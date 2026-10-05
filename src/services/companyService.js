import { extractCoords } from "../utils/geo";

// No company/profile endpoint exists beyond GET /auth/me (owned by
// AuthContext), so company details are read from the user object it exposes.
const COMPANY_ID_KEY = "smartroute-company-id"; // written by AuthContext

// Company approval states that belong on the existing review screen. Any
// other value (or none) is left to that screen's own live check.
export const NON_APPROVED_STATUSES = new Set(["PENDING", "REJECTED", "SUSPENDED"]);

const companyOf = (user) => user?.companyProfile || user?.company || user?.user?.companyProfile || null;

export const readCompanyId = (user) =>
  localStorage.getItem(COMPANY_ID_KEY) || user?.companyId || companyOf(user)?.id || null;

export const readCompanyProfile = (user) => {
  const company = companyOf(user);
  return {
    name: company?.companyName || company?.name || user?.companyName || null,
    country: company?.country || user?.country || null,
    city: company?.city || company?.region || null,
    // Only a field the backend explicitly names as an invite/fleet code is
    // used — none is documented yet, so this is usually null.
    inviteCode:
      company?.inviteCode || company?.fleetCode || company?.fleetInviteCode || company?.joinCode || user?.inviteCode || null,
    coords: extractCoords(company, company?.location, company?.address, user?.location),
  };
};

export const displayName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.name || user?.fullName || user?.email || "Account";

export const initialsOf = (name) =>
  name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("") || "RX";

const ROLE_LABELS = { DISPATCHER: "Dispatcher", ADMIN: "Admin", OWNER: "Owner", DRIVER: "Driver" };
export const roleLabel = (role) => ROLE_LABELS[role] || (role ? role[0] + role.slice(1).toLowerCase() : null);
