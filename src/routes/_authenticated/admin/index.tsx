import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listOrdersAdmin, listProductsAdmin } from "@/lib/admin.functions";
import { formatTsh } from "@/lib/format";
import { Package, ShoppingBag, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const lp = useServerFn(listProductsAdmin);
  const lo = useServerFn(listOrdersAdmin);
  const products = useQuery({ queryKey: ["admin-products"], queryFn: () => lp() });
  const orders = useQuery({ queryKey: ["admin-orders"], queryFn: () => lo() });

  const revenue = (orders.data ?? []).reduce((s, o) => s + Number(o.total || 0), 0);

  const stats = [
    { label: "Products", value: products.data?.length ?? 0, icon: Package },
    { label: "Orders", value: orders.data?.length ?? 0, icon: ShoppingBag },
    { label: "Revenue", value: formatTsh(revenue), icon: TrendingUp },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="font-display text-3xl mb-6">Overview</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-border rounded-lg p-5 bg-card">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 font-display text-3xl">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <h3 className="font-semibold mb-3">Recent orders</h3>
        <div className="border border-border rounded-lg divide-y divide-border">
          {(orders.data ?? []).slice(0, 5).map((o) => (
            <div key={o.id} className="p-4 flex justify-between text-sm">
              <div>
                <div className="font-medium">{o.customer_name}</div>
                <div className="text-muted-foreground text-xs">{new Date(o.created_at).toLocaleString()}</div>
              </div>
              <div className="font-semibold text-primary">{formatTsh(Number(o.total))}</div>
            </div>
          ))}
          {(orders.data ?? []).length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No orders yet.</div>}
        </div>
      </div>
    </div>
  );
}
