import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatTsh } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { unitPriceFor } from "@/lib/pricing";
import { whatsappLink } from "@/lib/whatsapp";
import { Check, MessageCircle, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$slug")({
  component: ProductDetail,
  errorComponent: ({ error }) => <div className="container mx-auto px-4 py-20 text-center">{error.message}</div>,
  notFoundComponent: () => <div className="container mx-auto px-4 py-20 text-center">Product not found.</div>,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  if (isLoading) return <div className="container mx-auto px-4 py-20 text-center">Loading…</div>;
  if (!product) return null;

  const unit = unitPriceFor(product, qty);
  const total = unit * qty;
  const isWholesale = qty >= product.moq;

  const orderMsg = `Hello AFROGLOW,

I would like to order:

${product.name} — Qty ${qty}
Unit price: ${formatTsh(unit)}
Total: ${formatTsh(total)}

Please contact me to confirm.`;

  return (
    <div className="container mx-auto px-4 py-10">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary">Home</Link> / <Link to="/shop" className="hover:text-primary">Shop</Link> / <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center font-display text-9xl text-primary/30">A</div>
          )}
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-primary font-semibold">{product.category_slug.replace(/-/g, " ")}</div>
          <h1 className="font-display text-3xl md:text-5xl mt-1">{product.name}</h1>
          <p className="mt-3 text-muted-foreground">{product.description}</p>

          <div className="mt-6 bg-secondary rounded-lg p-5">
            <div className="flex items-baseline gap-3 flex-wrap">
              <div>
                <div className="text-xs text-muted-foreground">Retail</div>
                <div className={`font-display text-2xl ${isWholesale ? "line-through text-muted-foreground" : "text-primary"}`}>{formatTsh(product.retail_price)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Wholesale (MOQ {product.moq}+)</div>
                <div className={`font-display text-2xl ${isWholesale ? "text-primary" : "text-foreground"}`}>{formatTsh(product.wholesale_price)}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              {isWholesale ? "Wholesale price applied automatically." : `Buy ${product.moq - qty} more to unlock wholesale pricing.`}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="text-sm">Availability:</div>
            {product.in_stock ? (
              <span className="text-sm font-semibold text-green-600 inline-flex items-center gap-1"><Check className="h-4 w-4" /> In Stock</span>
            ) : (
              <span className="text-sm font-semibold text-destructive">Out of Stock</span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="inline-flex items-center border border-border rounded-md">
              <button className="p-2 hover:bg-muted" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease"><Minus className="h-4 w-4" /></button>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="w-16 text-center bg-transparent border-0 focus:outline-none"
              />
              <button className="p-2 hover:bg-muted" onClick={() => setQty((q) => q + 1)} aria-label="Increase"><Plus className="h-4 w-4" /></button>
            </div>
            <div className="text-sm">Total: <span className="font-display text-xl text-primary">{formatTsh(total)}</span></div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => {
                add({
                  id: product.id, slug: product.slug, name: product.name, image_url: product.image_url,
                  retail_price: product.retail_price, wholesale_price: product.wholesale_price, moq: product.moq,
                }, qty);
                toast.success(`Added ${qty} × ${product.name}`);
              }}
            >
              <ShoppingBag className="h-4 w-4 mr-1" /> Add to Cart
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-ink text-ink-foreground hover:bg-primary hover:text-primary-foreground border-ink">
              <a href={whatsappLink(orderMsg)} target="_blank" rel="noopener">
                <MessageCircle className="h-4 w-4 mr-1" /> Order via WhatsApp
              </a>
            </Button>
          </div>

          {product.benefits && (
            <div className="mt-10">
              <h3 className="font-display text-xl">Benefits</h3>
              <ul className="mt-2 space-y-1.5">
                {product.benefits.split("\n").filter(Boolean).map((b: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.usage && (
            <div className="mt-8">
              <h3 className="font-display text-xl">How to Use</h3>
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{product.usage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
