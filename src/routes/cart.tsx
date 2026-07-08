import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatTsh } from "@/lib/format";
import { unitPriceFor } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { whatsappLink } from "@/lib/whatsapp";
import { supabase } from "@/integrations/supabase/client";
import { Minus, Plus, Trash2, MessageCircle, ShoppingBag } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart - AFROGLOW" }] }),
  component: CartPage,
});

const formSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  phone: z.string().trim().min(7, "Valid phone required").max(20),
  city: z.string().trim().max(80).optional(),
  business: z.string().trim().max(80).optional(),
});

function CartPage() {
  const { items, setQty, remove, subtotal, totalSavings, clear } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", city: "", business: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (items.length === 0) return;
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Please fill the form");
      return;
    }
    setSubmitting(true);

    const lines = items
      .map((i, idx) => {
        const u = unitPriceFor(i, i.qty);
        return `${idx + 1}. ${i.name} — Qty ${i.qty} × ${formatTsh(u)} = ${formatTsh(u * i.qty)}`;
      })
      .join("\n");

    const msg = `Hello AFROGLOW,

I would like to place an order.

Customer Name: ${form.name}
Phone: ${form.phone}${form.city ? `\nCity: ${form.city}` : ""}${form.business ? `\nBusiness: ${form.business}` : ""}

Products:
${lines}

Total Amount: ${formatTsh(subtotal)}${totalSavings > 0 ? `\nWholesale Savings: ${formatTsh(totalSavings)}` : ""}

Please contact me to confirm.`;

    try {
      await supabase.from("orders").insert({
        customer_name: form.name,
        phone: form.phone,
        city: form.city || null,
        business_name: form.business || null,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          qty: i.qty,
          unit_price: unitPriceFor(i, i.qty),
        })),
        total: subtotal,
      });
    } catch (e) {
      // non-fatal — still open WhatsApp
      console.error(e);
    }

    window.open(whatsappLink(msg), "_blank");
    clear();
    toast.success("Order sent to WhatsApp!");
    setSubmitting(false);
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
        <h1 className="font-display text-3xl mt-4">Your cart is empty</h1>
        <p className="text-muted-foreground mt-2">Add products to get started.</p>
        <Button asChild className="mt-6">
          <Link to="/shop">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="font-display text-4xl md:text-5xl">Your Cart</h1>

      <div className="mt-8 grid lg:grid-cols-[1fr_400px] gap-8">
        <div className="space-y-3">
          {items.map((i) => {
            const u = unitPriceFor(i, i.qty);
            const isWh = i.qty >= i.moq;
            return (
              <div key={i.id} className="flex gap-4 bg-card border border-border rounded-lg p-4">
                <div className="h-24 w-24 shrink-0 bg-muted rounded overflow-hidden">
                  {i.image_url ? (
                    <img src={i.image_url} alt={i.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full grid place-items-center font-display text-2xl text-primary/40">
                      A
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to="/products/$slug"
                    params={{ slug: i.slug }}
                    className="font-semibold hover:text-primary line-clamp-2"
                  >
                    {i.name}
                  </Link>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {isWh ? (
                      <span className="text-primary">Wholesale {formatTsh(u)}</span>
                    ) : (
                      `${formatTsh(u)} (MOQ ${i.moq}+ for wholesale)`
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                    <div className="inline-flex items-center border border-border rounded-md">
                      <button
                        className="p-1.5 hover:bg-muted"
                        onClick={() => setQty(i.id, i.qty - 1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="number"
                        value={i.qty}
                        onChange={(e) => setQty(i.id, Math.max(1, Number(e.target.value) || 1))}
                        className="w-12 text-center bg-transparent border-0 focus:outline-none text-sm"
                      />
                      <button
                        className="p-1.5 hover:bg-muted"
                        onClick={() => setQty(i.id, i.qty + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="font-display text-lg text-primary">{formatTsh(u * i.qty)}</div>
                    <button
                      className="p-2 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(i.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="bg-card border border-border rounded-lg p-6 h-fit lg:sticky lg:top-24">
          <h2 className="font-display text-2xl">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatTsh(subtotal)}</span>
            </div>
            {totalSavings > 0 && (
              <div className="flex justify-between text-primary">
                <span>Wholesale savings</span>
                <span className="font-semibold">−{formatTsh(totalSavings)}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-display text-2xl text-primary">{formatTsh(subtotal)}</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+255..."
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="business">Business Name (optional)</Label>
              <Input
                id="business"
                value={form.business}
                onChange={(e) => setForm({ ...form, business: e.target.value })}
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            size="lg"
            className="w-full mt-5 bg-ink text-ink-foreground hover:bg-primary"
          >
            <MessageCircle className="h-4 w-4 mr-1" /> Send Order to WhatsApp
          </Button>
          <p className="text-[11px] text-muted-foreground mt-2 text-center">
            No online payment — confirm with seller on WhatsApp.
          </p>
        </aside>
      </div>
    </div>
  );
}
