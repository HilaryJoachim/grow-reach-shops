import { createFileRoute, Outlet, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { checkIsAdmin } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const check = useServerFn(checkIsAdmin);
  const { data, isLoading, error } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => check(),
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading admin…</div>;
  }
  if (error || !data?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <h1 className="font-display text-3xl">Not authorized</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your account doesn't have admin access. Contact the store owner.</p>
        <Button onClick={signOut} className="mt-6">Sign out</Button>
      </div>
    );
  }

  const tabs = [
    { to: "/admin", label: "Dashboard", exact: true },
    { to: "/admin/products", label: "Products" },
    { to: "/admin/categories", label: "Categories" },
    { to: "/admin/orders", label: "Orders" },
  ] as const;

  return (
    <div className="border-b border-border bg-muted/30">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">AFROGROW</div>
          <h1 className="font-display text-2xl">Admin Panel</h1>
        </div>
        <Button variant="outline" size="sm" onClick={signOut}><LogOut className="h-4 w-4" /> Sign out</Button>
      </div>
      <nav className="container mx-auto px-4 flex gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <Link key={t.to} to={t.to} activeOptions={{ exact: t.exact ?? false }}
            className="px-4 py-2 text-sm font-medium border-b-2 border-transparent hover:text-primary whitespace-nowrap"
            activeProps={{ className: "border-primary text-primary" }}>
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="bg-background">
        <Outlet />
      </div>
    </div>
  );
}
