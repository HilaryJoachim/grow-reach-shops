import { Link } from "@tanstack/react-router";
import { formatTsh } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  image_url: string;
  retail_price: number;
  wholesale_price: number;
  moq: number;
  category_slug: string;
}

export function ProductCard({ p }: { p: ProductCardData }) {
  const { add } = useCart();
  return (
    <div className="group flex flex-col bg-card border border-border rounded-lg overflow-hidden hover:shadow-card transition-shadow">
      <Link
        to="/products/$slug"
        params={{ slug: p.slug }}
        className="aspect-square bg-muted relative overflow-hidden"
      >
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center font-display text-4xl text-primary/40">
            A
          </div>
        )}
        <div className="absolute top-2 left-2 bg-ink text-ink-foreground text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm">
          MOQ {p.moq}+
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Link
          to="/products/$slug"
          params={{ slug: p.slug }}
          className="font-semibold hover:text-primary line-clamp-2 min-h-[3rem]"
        >
          {p.name}
        </Link>
        <div className="mt-2 flex items-baseline gap-2 flex-wrap">
          <span className="font-display text-xl text-primary">{formatTsh(p.retail_price)}</span>
          <span className="text-xs text-muted-foreground line-through">Retail</span>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          Wholesale:{" "}
          <span className="font-semibold text-foreground">{formatTsh(p.wholesale_price)}</span> @{" "}
          {p.moq}+
        </div>
        <div className="mt-3 flex flex-col 2xl:flex-row gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to="/products/$slug" params={{ slug: p.slug }}>
              Details
            </Link>
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => {
              add({
                id: p.id,
                slug: p.slug,
                name: p.name,
                image_url: p.image_url,
                retail_price: p.retail_price,
                wholesale_price: p.wholesale_price,
                moq: p.moq,
              });
              toast.success(`${p.name} added to cart`);
            }}
          >
            <ShoppingBag className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}
