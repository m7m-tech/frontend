import React, { useCallback, useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { setUnauthorizedHandler } from "../../api/axios";
import useCompany from "../../hooks/useCompany";
import { useWhatsAppStatus } from "../../hooks/useWhatsApp";
import { WA_STATE } from "../../services/whatsappService";
import { NON_APPROVED_STATUSES, displayName, initialsOf, roleLabel } from "../../services/companyService";
import AppHeader from "./AppHeader";
import DashboardSkeleton from "../skeletons/DashboardSkeleton";
import {
  DriversSkeleton,
  LiveTrackingSkeleton,
  OperationsSkeleton,
  OrdersSkeleton,
  ProductsSkeleton,
  SettingsSkeleton,
} from "../skeletons/PageSkeletons";
import { ErrorState } from "../ui/States";
import { Button } from "../ui/Card";

const PAGE_SKELETONS = {
  "/dashboard": DashboardSkeleton,
  "/orders": OrdersSkeleton,
  "/products": ProductsSkeleton,
  "/drivers": DriversSkeleton,
  "/live-tracking": LiveTrackingSkeleton,
  "/operations": OperationsSkeleton,
  "/settings": SettingsSkeleton,
};

const AppLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { companyId, profile, isResolving } = useCompany();
  const whatsapp = useWhatsAppStatus(companyId);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  // A 401 from any new endpoint ends the session through AuthContext's logout.
  useEffect(() => {
    setUnauthorizedHandler(handleLogout);
    return () => setUnauthorizedHandler(null);
  }, [handleLogout]);

  if (!isAuthenticated || !localStorage.getItem("token")) return <Navigate to="/login" replace />;
  if (NON_APPROVED_STATUSES.has(user?.status)) return <Navigate to="/account-under-review" replace />;

  // First-time setup: only when the backend explicitly reports no WhatsApp
  // session at all. A dropped connection stays in the app with a Reconnect
  // prompt. Settings stays reachable so the user is never trapped.
  if (whatsapp.data?.state === WA_STATE.NOT_CONFIGURED && pathname !== "/settings") {
    return <Navigate to="/whatsapp-setup" replace />;
  }

  // Hold the page's own skeleton until we know where the user belongs, so
  // there's no flash of a page we might immediately redirect away from.
  const resolving = isResolving || (companyId && whatsapp.isLoading);
  const PageSkeleton = PAGE_SKELETONS[pathname] || DashboardSkeleton;
  const name = displayName(user);

  return (
    <div className="min-h-dvh bg-canvas font-base text-black">
      <AppHeader
        inviteCode={profile.inviteCode}
        whatsappStatus={whatsapp}
        user={{
          name,
          initials: initialsOf(name),
          subtitle: [roleLabel(user?.role), profile.name].filter(Boolean).join(" · "),
        }}
        onLogout={handleLogout}
      />
      <main className="mx-auto max-w-[1600px] px-4 pb-8 pt-4 sm:px-5">
        {resolving ? (
          <PageSkeleton />
        ) : !companyId ? (
          <ErrorState
            title="We couldn't identify your company."
            message="Please log out and sign in again to reload your company details."
            className="min-h-[50vh]"
          />
        ) : (
          <Outlet context={{ companyId, profile, whatsapp }} />
        )}
        {!resolving && !companyId && (
          <div className="flex justify-center">
            <Button variant="dark" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AppLayout;
