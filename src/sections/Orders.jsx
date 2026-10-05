import React, { useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { Inbox, Plus } from "lucide-react";
import PageHeader from "../components/layout/PageHeader";
import { Card, Button } from "../components/ui/Card";
import { EmptyState, ErrorState, InlineNotice } from "../components/ui/States";
import SearchInput from "../components/ui/SearchInput";
import Pagination from "../components/ui/Pagination";
import OrdersTable from "../components/orders/OrdersTable";
import OrderFilterTabs from "../components/orders/OrderFilterTabs";
import OrderDetailsModal from "../components/orders/OrderDetailsModal";
import CreateOrderModal from "../components/orders/CreateOrderModal";
import { OrdersSkeleton } from "../components/skeletons/PageSkeletons";
import { ORDER_FILTERS, matchesSearch, useOrders } from "../hooks/useOrders";
import useNow from "../hooks/useNow";

const PAGE_SIZE = 10;

const Orders = () => {
  const { companyId } = useOutletContext();
  const { orders, counts, isLoading, error, data, refetch, complete } = useOrders(companyId);
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [openOrder, setOpenOrder] = useState(null);
  const [creating, setCreating] = useState(false);
  const now = useNow();

  // Status filter lives in the URL so dashboard KPIs can deep-link here.
  const filterKey = ORDER_FILTERS.some((f) => f.key === params.get("status")) ? params.get("status") : "ALL";
  const filter = ORDER_FILTERS.find((f) => f.key === filterKey);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => orders.filter((o) => filter.match(o) && matchesSearch(o, q)), [orders, filter, q]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const setFilter = (key) => {
    setPage(1);
    setParams(key === "ALL" ? {} : { status: key }, { replace: true });
  };

  if (isLoading) return <OrdersSkeleton />;

  return (
    <div>
      <PageHeader title="Orders" description="Every order for your company, from WhatsApp and manual entry.">
        <Button variant="dark" onClick={() => setCreating(true)} className="py-3!">
          <Plus size={16} aria-hidden="true" /> New order
        </Button>
      </PageHeader>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-5">
          <SearchInput
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search order, customer, phone or address"
            className="w-full max-w-sm"
          />
          <OrderFilterTabs value={filterKey} onChange={setFilter} counts={counts} />
        </div>
        {!complete && <InlineNotice className="px-6 pb-3">Showing the most recent orders only — the full list couldn't be loaded.</InlineNotice>}

        {error && !data ? (
          <ErrorState title="Unable to load orders." message={error.message} onRetry={refetch} className="min-h-[360px]" />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={orders.length === 0 ? "No orders yet" : "No orders match"}
            description={orders.length === 0 ? "Orders from WhatsApp or created here will appear in this list." : "Try another status or search term."}
            className="min-h-[360px] border-t border-line"
          />
        ) : (
          <>
            <OrdersTable orders={rows} onRowClick={setOpenOrder} now={now} />
            <Pagination page={currentPage} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </Card>

      <OrderDetailsModal companyId={companyId} summary={openOrder} onClose={() => setOpenOrder(null)} />
      <CreateOrderModal open={creating} onClose={() => setCreating(false)} companyId={companyId} />
    </div>
  );
};

export default Orders;
