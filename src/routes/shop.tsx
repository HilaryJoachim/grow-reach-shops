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

// ── Brand taxonomy ────────────────────────────────────────────────────────────
const BRAND_GROUPS = [
  {
    label: "Afro Glow",
    slug: "afro-glow",
    children: [
      { label: "Skin Care", slug: "skin-care" },
      { label: "Body Care", slug: "body-care" },
      { label: "Hair Care", slug: "hair-care" },
      { label: "Glow Care", slug: "glow-care" },
      { label: "Men's Essential", slug: "mens-essential" },
    ],
  },
  {
    label: "Afro Gain",
    slug: "afro-gain",
    children: [
      { label: "Whey Protein", slug: "whey-protein" },
      { label: "Mass Gainer", slug: "mass-gainer" },
      { label: "Creatine", slug: "creatine" },
      { label: "Pre Workout", slug: "pre-workout" },
      { label: "BCAA / EAA", slug: "bcaa-eaa" },
      { label: "Vitamins & Minerals Supplements", slug: "vitamins-minerals" },
    ],
  },
  {
    label: "Afro Wear",
    slug: "afro-wear",
    children: [
      { label: "Men Wear", slug: "men-wear" },
      { label: "Women Wear", slug: "women-wear" },
      { label: "Gym Accessories", slug: "gym-accessories" },
    ],
  },
] as const;

// Flat list of every slug that belongs to a given main group (used for filtering)
function childSlugsOf(groupSlug: string): string[] {
  const group = BRAND_GROUPS.find((g) => g.slug === groupSlug);
  return group ? group.children.map((c) => c.slug) : [];
}

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop — AFROGLOW" },
      {
        name: "description",
        content:
          "Browse all AFROGLOW beauty, supplement and gym products. Filter by category, search by name.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { category, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [searchInput, setSearchInput] = useState(q ?? "");

  // Determine which slugs to filter by:
  //  • no category → fetch all
  //  • top-level group slug → filter by all its children
  //  • sub-category slug → filter directly by that slug
  const isGroupSlug = BRAND_GROUPS.some((g) => g.slug === category);
  const activeSlugs: string[] | undefined = !category
    ? undefined
    : isGroupSlug
      ? childSlugsOf(category)
      : [category];

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", category ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("id,slug,name,image_url,retail_price,wholesale_price,moq,category_slug");
      if (activeSlugs) {
        query = query.in("category_slug", activeSlugs);
      }
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

  return (
    <div>
      <div className="bg-ink text-ink-foreground">
        <div className="container mx-auto px-4 py-12">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold">Shop</p>
          <h1 className="font-display text-4xl md:text-5xl mt-1">All Products</h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-10 grid lg:grid-cols-[260px_1fr] gap-8">
        {/* ── Sidebar ── */}
        <aside className="space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ search: (s: Search) => ({ ...s, q: searchInput || undefined }) });
            }}
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
            {/* All Products */}
            <Link
              to="/shop"
              search={{}}
              className={`block py-1.5 text-sm hover:text-primary ${!category ? "text-primary font-semibold" : ""}`}
            >
              All Products
            </Link>

            {/* Brand groups + children */}
            {BRAND_GROUPS.map((group) => (
              <div key={group.slug} className="mt-4">
                {/* Main group link */}
                <Link
                  to="/shop"
                  search={{ category: group.slug }}
                  className={`block py-1 text-sm font-semibold uppercase tracking-wide hover:text-primary ${
                    category === group.slug ? "text-primary" : "text-foreground"
                  }`}
                >
                  {group.label}
                </Link>
                {/* Sub-categories */}
                {group.children.map((child) => (
                  <Link
                    key={child.slug}
                    to="/shop"
                    search={{ category: child.slug }}
                    className={`block py-1 pl-3 text-sm hover:text-primary ${
                      category === child.slug
                        ? "text-primary font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* ── Product grid ── */}
        <div>
          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No products found.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
