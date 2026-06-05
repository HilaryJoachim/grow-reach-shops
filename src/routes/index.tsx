import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Truck, ShieldCheck, MessageCircle, Sparkles, Dumbbell, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import heroBeauty from "@/assets/hero-beauty.jpg";
import heroSupplements from "@/assets/hero-supplements.jpg";
import heroGym from "@/assets/hero-gym.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AFROGLOW — Premium Beauty, Supplements & Gym Gear" },
      { name: "description", content: "Shop hair growth oils, whey protein, creatine, pre-workout, gym accessories and more. Retail & wholesale pricing with WhatsApp ordering." },
    ],
  }),
  component: HomePage,
});

const CATEGORY_TILES = [
  { slug: "hair-care", name: "Hair Care", group: "Beauty", icon: Sparkles },
  { slug: "skin-care", name: "Skin Care", group: "Beauty", icon: Sparkles },
  { slug: "whey-protein", name: "Whey Protein", group: "Supplements", icon: Flame },
  { slug: "creatine", name: "Creatine", group: "Supplements", icon: Flame },
  { slug: "pre-workout", name: "Pre Workout", group: "Supplements", icon: Flame },
  { slug: "gym-gloves", name: "Gym Gloves", group: "Accessories", icon: Dumbbell },
  { slug: "resistance-bands", name: "Resistance Bands", group: "Accessories", icon: Dumbbell },
  { slug: "shaker-bottles", name: "Shaker Bottles", group: "Accessories", icon: Dumbbell },
];

function HomePage() {
  const { data: featured } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,slug,name,image_url,retail_price,wholesale_price,moq,category_slug")
        .eq("featured", true)
        .limit(8);
      if (error) throw error;
      return data as ProductCardData[];
    },
  });

  return (
    <div>
      {/* HERO */}
      <section className="relative bg-ink text-ink-foreground overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-primary/15 text-primary px-3 py-1 rounded-full text-xs uppercase tracking-widest font-semibold">
              <Flame className="h-3 w-3" /> Beauty • Supplements • Gym
            </div>
            <h1 className="mt-4 font-display text-5xl md:text-7xl leading-[0.95]">
              Transform Your <span className="text-primary">Beauty</span> & <span className="text-primary">Fitness</span> Journey
            </h1>
            <p className="mt-5 text-lg text-white/80 max-w-xl">
              Premium cosmetics, sports nutrition supplements, and gym accessories — handpicked, authentic, delivered by WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="text-base">
                <Link to="/shop">Shop Now <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>

          {/* 3-image collage */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 relative">
            <div className="row-span-2 relative rounded-lg overflow-hidden border border-white/10 shadow-2xl">
              <img src={heroBeauty} alt="Glowing skin with premium beauty product" width={1024} height={1280} className="h-full w-full object-cover aspect-[3/4]" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink to-transparent p-3">
                <span className="text-xs uppercase tracking-widest text-primary font-semibold">Beauty</span>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden border border-white/10 shadow-xl">
              <img src={heroSupplements} alt="Athlete drinking a protein supplement shake" loading="lazy" width={1024} height={1024} className="h-full w-full object-cover aspect-square" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink to-transparent p-3">
                <span className="text-xs uppercase tracking-widest text-primary font-semibold">Supplements</span>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden border border-white/10 shadow-xl">
              <img src={heroGym} alt="Fit man with gym accessories" loading="lazy" width={1024} height={1024} className="h-full w-full object-cover aspect-square" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink to-transparent p-3">
                <span className="text-xs uppercase tracking-widest text-primary font-semibold">Gym</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* CATEGORIES */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-semibold">Shop by category</p>
            <h2 className="font-display text-3xl md:text-4xl">Browse the collection</h2>
          </div>
          <Link to="/shop" className="hidden md:inline-flex items-center text-sm font-semibold text-primary hover:underline">
            View all <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORY_TILES.map((c) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: c.slug } as never}
              className="group relative bg-card border border-border p-5 rounded-lg hover:border-primary hover:shadow-card transition-all"
            >
              <c.icon className="h-7 w-7 text-primary" />
              <div className="mt-6">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.group}</div>
                <div className="font-display text-xl mt-0.5">{c.name}</div>
              </div>
              <ArrowRight className="absolute top-5 right-5 h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-semibold">Best sellers</p>
            <h2 className="font-display text-3xl md:text-4xl">Featured Products</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(featured ?? []).map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* WHY CREATINE */}
      <section className="bg-ink text-ink-foreground">
        <div className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-semibold">Science-backed</p>
            <h2 className="font-display text-4xl md:text-5xl mt-2">Why Creatine?</h2>
            <p className="mt-4 text-white/75 leading-relaxed">
              Creatine helps produce ATP — the body's primary energy source during high-intensity exercise.
              Regular use supports strength, endurance, muscle growth, and recovery, helping athletes improve
              training performance.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link to="/shop" search={{ category: "creatine" } as never}>Shop Creatine</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ["+15%", "Strength"],
              ["+10%", "Power output"],
              ["3-5kg", "Muscle gain"],
              ["100%", "Pure & tested"],
            ].map(([n, l]) => (
              <div key={l} className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="font-display text-4xl text-primary">{n}</div>
                <div className="text-sm text-white/70 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { i: ShieldCheck, t: "Premium Quality", d: "Authentic products, sourced from trusted brands." },
            { i: Truck, t: "Wholesale Discounts", d: "Better pricing once you hit MOQ. Auto-applied at cart." },
            { i: MessageCircle, t: "Direct WhatsApp", d: "Order in seconds — no checkout friction." },
            { i: Flame, t: "Trusted Supplier", d: "Serving salons, gyms and resellers across Tanzania." },
          ].map((x) => (
            <div key={x.t} className="bg-card border border-border rounded-lg p-6">
              <x.i className="h-7 w-7 text-primary" />
              <div className="font-display text-xl mt-4">{x.t}</div>
              <p className="text-sm text-muted-foreground mt-1">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold text-center">Loved by</p>
          <h2 className="font-display text-3xl md:text-4xl text-center">Salons, Gyms & Resellers</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              { n: "Amina K.", r: "Salon Owner", q: "The hair oil sells out every month. Wholesale pricing makes margin easy." },
              { n: "Joseph M.", r: "Gym Owner", q: "Reliable supplements at the best prices. WhatsApp orders ship same day." },
              { n: "Neema R.", r: "Reseller", q: "Quality is real and the team responds fast. My customers come back." },
            ].map((t) => (
              <div key={t.n} className="bg-card border border-border rounded-lg p-6">
                <div className="text-primary text-lg">★★★★★</div>
                <p className="mt-3 text-sm leading-relaxed">"{t.q}"</p>
                <div className="mt-4 font-semibold">{t.n}</div>
                <div className="text-xs text-muted-foreground">{t.r}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
