import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  MessageCircle,
  Sparkles,
  Dumbbell,
  Flame,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

// ─── Hero slide images ────────────────────────────────────────────────────────
// Swap any of these imports to change the image for that slide.
import heroBeauty from "@/assets/bnnn3.png";       // Slide 1 — Afro Glow
import heroSupplements from "@/assets/bnnn1.png"; // Slide 2 — Afro Gain
import heroGym from "@/assets/bnnn2.png";               // Slide 3 — Afro Wear

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
  { slug: "body-care", name: "Body Lotion", group: "Afro Glow", icon: Sparkles },
  { slug: "skin-care", name: "Collagens", group: "Afro Glow", icon: Sparkles },
  { slug: "skin-care", name: "Skin Care", group: "Afro Glow", icon: Sparkles },
  { slug: "creatine", name: "Creatine", group: "Afro Gain", icon: Flame },
  { slug: "whey-protein", name: "Whey Protein", group: "Afro Gain", icon: Flame },
  { slug: "pre-workout", name: "Pre Workout", group: "Afro Gain", icon: Flame },
  { slug: "women-wear", name: "Women Wear", group: "Afro Wear", icon: Dumbbell },
  { slug: "gym-accessories", name: "Gym Support", group: "Afro Wear", icon: Dumbbell },
];

// ─── Hero slide data ──────────────────────────────────────────────────────────
// To change slide content: edit the objects below.
// To change a slide image: update the corresponding import at the top of this file.
const HERO_SLIDES = [
  {
    tag: "Afro Glow",
    tagIcon: Sparkles,
    headline: ["Illuminate Your", "Natural", "Beauty"],
    headlineAccent: [false, true, false], // which words get primary colour
    body: "Premium skincare, body care & hair care products — handpicked for your natural glow. Retail & wholesale pricing.",
    cta: "Shop Afro Glow",
    ctaSearch: { category: "afro-glow" },
    image: heroBeauty,           // ← Slide 1 image (swap heroBeauty to any imported asset)
    imageAlt: "Glowing skin with premium AFROGLOW beauty products",
    imageBadge: "Beauty & Skin",
  },
  {
    tag: "Afro Gain",
    tagIcon: Flame,
    headline: ["Fuel Your", "Performance,", "Maximise Gains"],
    headlineAccent: [false, true, false],
    body: "Whey protein, creatine, pre-workout & more — science-backed supplements for every training goal.",
    cta: "Shop Afro Gain",
    ctaSearch: { category: "afro-gain" },
    image: heroSupplements,      // ← Slide 2 image (swap heroSupplements to any imported asset)
    imageAlt: "Athlete fuelling performance with AFROGLOW supplements",
    imageBadge: "Sports Nutrition",
  },
  {
    tag: "Afro Wear",
    tagIcon: Dumbbell,
    headline: ["Gear Up,", "Train Hard,", "Look the Part"],
    headlineAccent: [false, false, true],
    body: "Men's & women's activewear and gym accessories — built for performance, designed to stand out.",
    cta: "Shop Afro Wear",
    ctaSearch: { category: "afro-wear" },
    image: heroGym,              // ← Slide 3 image (swap heroGym to any imported asset)
    imageAlt: "Athlete wearing AFROGLOW gym apparel",
    imageBadge: "Gym & Wear",
  },
] as const;

// ─── Hero Carousel component ──────────────────────────────────────────────────
function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 });
  const [selected, setSelected] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  // Sync dot indicator with carousel position
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  // Auto-play every 5 s, paused on hover
  useEffect(() => {
    if (!emblaApi || isHovered) return;
    const timer = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(timer);
  }, [emblaApi, isHovered]);

  return (
    <section
      className="relative bg-ink text-ink-foreground overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Hero carousel"
    >
      {/* Embla viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {HERO_SLIDES.map((slide, idx) => {
            const TagIcon = slide.tagIcon;
            return (
              <div
                key={idx}
                className="flex-[0_0_100%] min-w-0"
                aria-hidden={selected !== idx}
              >
                <div className="container mx-auto px-4 py-16 md:py-20 grid lg:grid-cols-2 gap-12 items-center">
                  {/* ── Text column ── */}
                  <div className="relative z-10 order-2 lg:order-1">
                    {/* Tag badge */}
                    <div className="inline-flex items-center gap-2 bg-primary/15 text-primary px-3 py-1 rounded-full text-xs uppercase tracking-widest font-semibold">
                      <TagIcon className="h-3 w-3" />
                      {slide.tag}
                    </div>

                    {/* Headline */}
                    <h1 className="mt-4 font-display text-5xl md:text-7xl leading-[0.95]">
                      {slide.headline.map((word, wi) => (
                        <span key={wi}>
                          {wi > 0 && <br />}
                          <span className={slide.headlineAccent[wi] ? "text-primary" : ""}>
                            {word}
                          </span>
                        </span>
                      ))}
                    </h1>

                    {/* Body */}
                    <p className="mt-5 text-lg text-white/80 max-w-xl leading-relaxed">
                      {slide.body}
                    </p>

                    {/* CTA */}
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                      <Button asChild size="lg" className="text-base">
                        <Link to="/shop" search={slide.ctaSearch as never}>
                          {slide.cta} <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-primary transition-colors"
                      >
                        View all <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    {/* Slide counter */}
                    <p className="mt-8 text-xs text-white/30 uppercase tracking-widest font-semibold">
                      {String(idx + 1).padStart(2, "0")} / {String(HERO_SLIDES.length).padStart(2, "0")}
                    </p>
                  </div>

                  {/* ── Image column ── */}
                  <div className="relative order-1 lg:order-2">
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] md:aspect-[3/2] lg:aspect-[4/3]">
                      <img
                        src={slide.image}
                        alt={slide.imageAlt}
                        className="h-full w-full object-cover"
                        loading={idx === 0 ? "eager" : "lazy"}
                        width={1024}
                        height={768}
                      />
                      {/* gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-ink/60 via-transparent to-transparent" />
                      {/* badge */}
                      <div className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur-sm text-black text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                        {slide.imageBadge}
                      </div>
                    </div>

                    {/* Decorative accent ring */}
                    <div className="absolute -bottom-6 -right-6 h-40 w-40 rounded-full border border-primary/20 pointer-events-none" />
                    <div className="absolute -bottom-10 -right-10 h-60 w-60 rounded-full border border-primary/10 pointer-events-none" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Prev / Next arrows ── */}
      <button
        onClick={scrollPrev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/10 hover:bg-primary/80 border border-white/20 flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <button
        onClick={scrollNext}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/10 hover:bg-primary/80 border border-white/20 flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <ArrowRight className="h-4 w-4" />
      </button>

      {/* ── Dot indicators ── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full ${i === selected
              ? "w-6 h-2 bg-primary"
              : "w-2 h-2 bg-white/30 hover:bg-white/60"
              }`}
          />
        ))}
      </div>
    </section>
  );
}

// ─── "Why X?" data ───────────────────────────────────────────────────────────
const WHY_SLIDES = [
  {
    tag: "Science-backed",
    title: "Why Creatine?",
    body: "Creatine helps produce ATP — the body's primary energy source during high-intensity exercise. Regular use supports strength, endurance, muscle growth, and recovery, helping athletes improve training performance.",
    cta: "Shop Creatine",
    ctaSearch: { category: "creatine" },
    stats: [
      ["+15%", "Strength"],
      ["+10%", "Power output"],
      ["3-5kg", "Muscle gain"],
      ["100%", "Pure & tested"],
    ],
  },
  {
    tag: "Science-backed",
    title: "Why Collagen?",
    body: "Collagen is the fundamental protein that provides structure to your skin, hair, nails, and joints. Regular use supports skin elasticity, hydration, and joint health, helping you maintain a youthful appearance and active lifestyle.",
    cta: "Shop Collagen",
    ctaSearch: { category: "skin-care" },
    stats: [
      ["+20%", "Skin elasticity"],
      ["+15%", "Joint mobility"],
      ["4-8 Weeks", "Visible results"],
      ["100%", "Pure & tested"],
    ],
  },
  {
    tag: "Performance-driven",
    title: "Why Gym Gear?",
    body: "High-performance gym gear is designed to enhance your mechanics, provide essential support, and increase comfort during intense training. The right equipment helps stabilize your joints, improves your grip, and protects your body — allowing you to push your limits safely and effectively.",
    cta: "Shop Gym Gear",
    ctaSearch: { category: "gym-accessories" },
    stats: [
      ["+25%", "Joint stability"],
      ["+20%", "Grip strength"],
      ["30%", "Less fatigue"],
      ["100%", "Durable & tested"],
    ],
  },
] as const;

// ─── WhyCarousel component ────────────────────────────────────────────────────
function WhyCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, duration: 25 });
  const [selected, setSelected] = useState(0);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  return (
    <section className="bg-ink text-ink-foreground">
      {/* ── Tab navigation ── */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 flex items-center gap-1 overflow-x-auto scrollbar-none">
          {WHY_SLIDES.map((slide, i) => (
            <button
              key={slide.title}
              onClick={() => scrollTo(i)}
              className={`flex-shrink-0 px-5 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                i === selected
                  ? "text-primary border-primary"
                  : "text-white/50 border-transparent hover:text-white/80"
              }`}
            >
              {slide.title.replace("Why ", "").replace("?", "")}
            </button>
          ))}
        </div>
      </div>

      {/* ── Embla viewport ── */}
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {WHY_SLIDES.map((slide, idx) => (
              <div key={idx} className="flex-[0_0_100%] min-w-0">
                <div className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">

                  {/* Text column */}
                  <div>
                    <p className="text-xs uppercase tracking-widest text-primary font-semibold">
                      {slide.tag}
                    </p>
                    <h2 className="font-display text-4xl md:text-5xl mt-2">{slide.title}</h2>
                    <p className="mt-4 text-white/75 leading-relaxed">{slide.body}</p>
                    <Button asChild size="lg" className="mt-6">
                      <Link to="/shop" search={slide.ctaSearch as never}>{slide.cta}</Link>
                    </Button>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {slide.stats.map(([n, l]) => (
                      <div key={l} className="bg-white/5 border border-white/10 rounded-lg p-6">
                        <div className="font-display text-4xl text-primary">{n}</div>
                        <div className="text-sm text-white/70 mt-1">{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prev / Next arrows */}
        <button
          onClick={scrollPrev}
          disabled={selected === 0}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/10 hover:bg-primary/80 border border-white/20 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          onClick={scrollNext}
          disabled={selected === WHY_SLIDES.length - 1}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/10 hover:bg-primary/80 border border-white/20 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 pb-8">
        {WHY_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full ${
              i === selected
                ? "w-6 h-2 bg-primary"
                : "w-2 h-2 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

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
      {/* HERO CAROUSEL */}
      <HeroCarousel />


      {/* CATEGORIES */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-semibold">Shop by category</p>
            <h2 className="font-display text-3xl md:text-4xl">Trending collection</h2>
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

      {/* WHY CAROUSEL — Creatine / Collagen / Gym Gear */}
      <WhyCarousel />

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
