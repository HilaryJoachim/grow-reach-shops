import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteOrder, listOrdersAdmin } from "@/lib/admin.functions";
import { formatTsh } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: OrdersAdmin,
});

type OrderItem = { name: string; qty: number; unit_price: number };

function OrdersAdmin() {
  const lo = useServerFn(listOrdersAdmin);
  const del = useServerFn(deleteOrder);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-orders"], queryFn: () => lo() });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="font-display text-3xl mb-6">Orders</h2>
      <div className="space-y-3">
        {(data ?? []).map((o) => {
          const items = (Array.isArray(o.items) ? o.items : []) as OrderItem[];
          return (
            <div key={o.id} className="border border-border rounded-lg p-5 bg-card">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="font-semibold">
                    {o.customer_name}{" "}
                    {o.business_name && (
                      <span className="text-muted-foreground font-normal">• {o.business_name}</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {o.phone}
                    {o.city && ` • ${o.city}`} • {new Date(o.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl text-primary">
                    {formatTsh(Number(o.total))}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Delete this order?")) remove.mutate(o.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <ul className="mt-3 text-sm divide-y divide-border border-t border-border">
                {items.map((it, i) => (
                  <li key={i} className="py-1.5 flex justify-between">
                    <span>
                      {it.qty}× {it.name}
                    </span>
                    <span className="text-muted-foreground">
                      {formatTsh(it.unit_price * it.qty)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {(data ?? []).length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground border border-border rounded-lg">
            No orders yet.
          </div>
        )}
      </div>
    </div>
  );
}
