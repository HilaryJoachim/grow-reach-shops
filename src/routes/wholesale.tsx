import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/wholesale")({
  head: () => ({ meta: [
    { title: "Wholesale Program — AFROGROW" },
    { name: "description", content: "Bulk wholesale pricing for gym owners, supplement stores, beauty shops and resellers." },
  ]}),
  component: WholesalePage,
});

function WholesalePage() {
  return (
    <div>
      <section className="bg-ink text-ink-foreground py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold">B2B Program</p>
          <h1 className="font-display text-5xl md:text-6xl mt-2">Wholesale Pricing</h1>
          <p className="mt-4 text-lg text-white/75 max-w-2xl">
            Stock your shelves with the products your customers want. Better margins, faster orders, and a partner who responds on WhatsApp.
          </p>
          <Button asChild size="lg" className="mt-8">
            <a href={whatsappLink("Hello AFROGROW, I want to learn about wholesale pricing.")} target="_blank" rel="noopener">
              <MessageCircle className="h-4 w-4 mr-1" /> Talk on WhatsApp
            </a>
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="font-display text-3xl">Perfect for</h2>
          <ul className="mt-4 space-y-2">
            {["Gym Owners", "Supplement Stores", "Beauty Shops & Salons", "Resellers", "Personal Trainers", "Hotels & Wellness Centres"].map((x) => (
              <li key={x} className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> {x}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-3xl">Benefits</h2>
          <ul className="mt-4 space-y-2">
            {["Wholesale pricing once MOQ is met", "Bulk order discounts", "Same-day WhatsApp ordering", "Dedicated support", "Reliable stock availability"].map((x) => (
              <li key={x} className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> {x}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="bg-secondary rounded-lg p-10 text-center">
          <h2 className="font-display text-3xl">Ready to order?</h2>
          <p className="mt-2 text-muted-foreground">Browse the catalog or chat with us directly.</p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <Button asChild size="lg"><Link to="/shop">Browse Products</Link></Button>
            <Button asChild size="lg" variant="outline">
              <a href={whatsappLink("Hello AFROGROW")} target="_blank" rel="noopener">WhatsApp Us</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
