import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Search {
  category?: string;
  q?: string;
}

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop — AFROGROW" },
      { name: "description", content: "Browse all AFROGROW beauty, supplement and gym products. Filter by category, search by name." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { category, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [searchInput, setSearchInput] = useState(q ?? "");

  const { data: cats } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", category ?? "all"],
    queryFn: async () => {
      let query = supabase.from("products").select("id,slug,name,image_url,retail_price,wholesale_price,moq,category_slug");
      if (category) query = query.eq("category_slug", category);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProductCardData[];
    },
  });

  const filtered = useMemo(() => {
    if (!products) return [];
    if (!q) return products;
    const needle = q.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(needle));
  }, [products, q]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof cats>();
    (cats ?? []).forEach((c) => {
      const g = c.parent ?? "Other";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(c);
    });
    return Array.from(map.entries());
  }, [cats]);

  return (
    <div>
      <div className="bg-ink text-ink-foreground">
        <div className="container mx-auto px-4 py-12">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold">Shop</p>
          <h1 className="font-display text-4xl md:text-5xl mt-1">All Products</h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-10 grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="space-y-6">
          <form
            onSubmit={(e) => { e.preventDefault(); navigate({ search: (s: Search) => ({ ...s, q: searchInput || undefined }) }); }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </form>
          <div>
            <h3 className="font-display text-lg mb-2">Categories</h3>
            <Link
              to="/shop"
              search={{}}
              className={`block py-1.5 text-sm hover:text-primary ${!category ? "text-primary font-semibold" : ""}`}
            >
              All Products
            </Link>
            {groups.map(([group, list]) => (
              <div key={group} className="mt-3">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{group}</div>
                {list!.map((c) => (
                  <Link
                    key={c.slug}
                    to="/shop"
                    search={{ category: c.slug }}
                    className={`block py-1.5 text-sm hover:text-primary ${category === c.slug ? "text-primary font-semibold" : ""}`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </aside>

        <div>
          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No products found.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
