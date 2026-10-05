import React from "react";
import { useOutletContext } from "react-router-dom";
import { useOrders } from "../hooks/useOrders";
import { useProducts } from "../hooks/useProducts";
import { useAttentionItems } from "../hooks/useOperations";
import useMapView from "../hooks/useMapView";
import useNow from "../hooks/useNow";
import DashboardSkeleton, { DASHBOARD_GRID } from "../components/skeletons/DashboardSkeleton";
import DeliveryProgressCard from "../components/dashboard/DeliveryProgressCard";
import DriversStatusCard from "../components/dashboard/DriversStatusCard";
import InventoryStockCard from "../components/dashboard/InventoryStockCard";
import LiveTrackingPreview from "../components/dashboard/LiveTrackingPreview";
import OrdersPreview from "../components/dashboard/OrdersPreview";
import WhatsAppBanner from "../components/whatsapp/WhatsAppBanner";

const Dashboard = () => {
  const { companyId, profile, whatsapp } = useOutletContext();
  const orders = useOrders(companyId);
  const products = useProducts(companyId);
  const attention = useAttentionItems(companyId);
  const mapView = useMapView(profile);
  const now = useNow();

  if (orders.isLoading || products.isLoading) return <DashboardSkeleton />;

  return (
    <>
      <h1 className="sr-only">Dispatcher dashboard</h1>
      <WhatsAppBanner state={whatsapp.data?.state} />
      <div className={DASHBOARD_GRID}>
        <div className="flex flex-col gap-4">
          <DeliveryProgressCard orders={orders.orders} error={orders.data ? null : orders.error} complete={orders.complete} onRetry={orders.refetch} />
          <DriversStatusCard />
          <InventoryStockCard
            products={products.products}
            summary={products.summary}
            error={products.data ? null : products.error}
            complete={products.complete}
            onRetry={products.refetch}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <LiveTrackingPreview
            orders={orders.orders}
            ordersUpdatedAt={orders.updatedAt}
            mapView={mapView}
            attentionCount={attention.items.length}
            now={now}
          />
          <OrdersPreview
            companyId={companyId}
            orders={orders.orders}
            counts={orders.counts}
            error={orders.data ? null : orders.error}
            onRetry={orders.refetch}
            now={now}
          />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
