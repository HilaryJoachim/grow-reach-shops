import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, MessageCircle, Sparkles, Dumbbell, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — AFROGLOW" },
      {
        name: "description",
        content:
          "The story behind AFROGLOW — inspiring beauty and fitness across Tanzania with authentic products, fair pricing and a partner who responds on WhatsApp.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-ink text-ink-foreground py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold">Our Story</p>
          <h1 className="font-display text-5xl md:text-6xl mt-2">
            Glow from within. Grow without limits.
          </h1>
          <p className="mt-5 text-lg text-white/75 max-w-2xl">
            AFROGLOW was born from a simple belief — every person deserves to feel beautiful in
            their skin and strong in their body. We bring premium beauty products, sports nutrition
            and gym essentials to customers, salons, gyms and resellers across Tanzania.
          </p>
        </div>
      </section>

      {/* Inspiration story */}
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">
          The Inspiration
        </p>
        <h2 className="font-display text-3xl md:text-4xl mt-1">
          It started with a mirror and a missed gym session.
        </h2>
        <div className="mt-6 space-y-5 text-muted-foreground leading-relaxed text-[17px]">
          <p>
            A few years ago, our founder stood in front of a small bathroom mirror, tired after a
            long day, looking at dry skin and a body that no longer matched the energy inside. Like
            many young Africans, the dream of self-care was real — but the products were either too
            expensive, too far, or too fake.
          </p>
          <p>
            That night sparked a question:{" "}
            <span className="text-foreground font-medium">
              why should glowing skin and a healthy body be a luxury?
            </span>{" "}
            Why must a salon owner in Mwanza or a gym in Arusha pay double just to stock authentic
            shampoo, real whey protein or a decent pair of gym gloves?
          </p>
          <p>
            AFROGLOW is the answer. We hand-pick beauty and fitness products that actually work,
            source them at fair prices, and deliver them straight to your hands — one WhatsApp
            message away. Whether you're chasing your first 5k, opening your first salon, or simply
            rediscovering your glow, we want to walk that journey with you.
          </p>
          <p className="text-foreground font-semibold italic border-l-4 border-primary pl-4">
            "Beauty is not a product. Fitness is not a season. They are choices you make every
            morning — and we exist to make those choices easier."
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold text-center">
            What we stand for
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-center">
            Authentic. Affordable. Always reachable.
          </h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                i: Sparkles,
                t: "Beauty that's real",
                d: "Every cream, oil and serum is sourced from trusted brands — no counterfeits, no shortcuts.",
              },
              {
                i: Dumbbell,
                t: "Fitness that fuels",
                d: "Tested supplements and accessories that help you train harder and recover smarter.",
              },
              {
                i: Heart,
                t: "People first",
                d: "From a single bottle to a wholesale pallet, you get the same fast WhatsApp service.",
              },
            ].map((x) => (
              <div key={x.t} className="bg-background border border-border rounded-lg p-6">
                <x.i className="h-7 w-7 text-primary" />
                <div className="font-display text-xl mt-4">{x.t}</div>
                <p className="text-sm text-muted-foreground mt-1">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wholesale (folded in) */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold">
            For Businesses
          </p>
          <h2 className="font-display text-3xl md:text-4xl mt-1">Wholesale partnership</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            We work with gyms, salons, supplement stores, resellers and personal trainers across
            Tanzania. Hit the minimum order quantity and wholesale pricing applies automatically.
          </p>

          <div className="mt-10 grid md:grid-cols-2 gap-10">
            <div>
              <h3 className="font-display text-2xl">Perfect for</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  "Gym Owners",
                  "Supplement Stores",
                  "Beauty Shops & Salons",
                  "Resellers",
                  "Personal Trainers",
                  "Hotels & Wellness Centres",
                ].map((x) => (
                  <li key={x} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" /> {x}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-2xl">What you get</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  "Wholesale pricing once MOQ is met",
                  "Bulk order discounts",
                  "Same-day WhatsApp ordering",
                  "Dedicated support",
                  "Reliable stock availability",
                ].map((x) => (
                  <li key={x} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            ["500+", "Products"],
            ["1,000+", "Happy customers"],
            ["24h", "Response time"],
          ].map(([n, l]) => (
            <div key={l} className="bg-secondary rounded-lg p-6 text-center">
              <div className="font-display text-4xl text-primary">{n}</div>
              <div className="text-sm text-muted-foreground mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="bg-ink text-ink-foreground rounded-lg p-10 text-center">
          <h2 className="font-display text-3xl">Ready to glow and grow with us?</h2>
          <p className="mt-2 text-white/70">Shop the catalog or talk to us directly on WhatsApp.</p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <Button asChild size="lg">
              <Link to="/shop">Shop Now</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent text-white border-white/30 hover:bg-white hover:text-ink"
            >
              <a
                href={whatsappLink("Hello AFROGLOW, I'd like to make an inquiry.")}
                target="_blank"
                rel="noopener"
              >
                <MessageCircle className="h-4 w-4 mr-1" /> Talk to us
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
