import React from "react";
import { NavLink, Link } from "react-router-dom";
import RouteXLogo from "./RouteXLogo";
import FleetInviteCode from "./FleetInviteCode";
import UserMenu from "./UserMenu";
import WhatsAppStatusPill from "../whatsapp/WhatsAppStatusPill";

export const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/orders", label: "Orders" },
  { to: "/products", label: "Products" },
  { to: "/drivers", label: "Drivers" },
  { to: "/live-tracking", label: "Live tracking" },
  { to: "/operations", label: "Operations" },
  { to: "/settings", label: "Settings" },
];

const AppHeader = ({ inviteCode, whatsappStatus, user, onLogout }) => (
  <header className="sticky top-0 z-[900] border-b border-line/60 bg-canvas/90 backdrop-blur">
    <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-5 lg:flex-nowrap">
      <Link to="/dashboard" className="shrink-0 rounded focus-visible:outline-2 focus-visible:outline-brand" aria-label="RouteX dashboard">
        <RouteXLogo className="h-[18px] w-auto" />
      </Link>

      <div className="order-last -mx-4 w-[calc(100%+2rem)] overflow-x-auto px-4 [scrollbar-width:none] lg:order-none lg:mx-0 lg:w-auto lg:min-w-0 lg:flex-1 lg:px-0 [&::-webkit-scrollbar]:hidden">
        <nav aria-label="Main" className="flex w-max items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-2 my-1 text-[15px] transition-colors focus-visible:outline-0 focus-visible:outline-brand ${
                  isActive ? "bg-brand font-medium text-black shadow-sm" : "border border-transparent text-gray hover:text-black"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden xl:block">
          <FleetInviteCode code={inviteCode} />
        </div>
        <div className="hidden sm:block">
          <WhatsAppStatusPill status={whatsappStatus} />
        </div>
        <UserMenu {...user} onLogout={onLogout} />
      </div>
    </div>
  </header>
);

export default AppHeader;
