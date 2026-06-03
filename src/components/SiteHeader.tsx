import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { whatsappLink } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/shop", label: "Beauty", search: { category: "hair-care" } },
  { to: "/shop", label: "Supplements", search: { category: "whey-protein" } },
  { to: "/shop", label: "Gym", search: { category: "gym-gloves" } },
  { to: "/wholesale", label: "Wholesale" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="bg-ink text-ink-foreground text-xs">
        <div className="container mx-auto flex justify-between items-center px-4 py-1.5">
          <span>Beauty • Supplements • Gym — Retail & Wholesale</span>
          <a href={whatsappLink("Hello AFROGROW, I have a question.")} target="_blank" rel="noopener" className="hidden sm:inline text-primary hover:underline">
            +255 795 908 230
          </a>
        </div>
      </div>
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 bg-primary text-primary-foreground grid place-items-center font-display text-lg rounded-sm">A</div>
          <div className="leading-none">
            <div className="font-display text-2xl tracking-wide">AFROGROW</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Beauty • Fitness</div>
          </div>
        </Link>
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {NAV.map((n, i) => (
            <Link
              key={i}
              to={n.to}
              search={"search" in n ? (n.search as never) : undefined}
              className="hover:text-primary transition-colors"
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{ className: "text-primary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={whatsappLink("Hello AFROGROW, I'd like to place an order.")}
            target="_blank" rel="noopener"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium bg-ink text-ink-foreground hover:bg-primary transition-colors rounded-md px-3 py-2"
          >
            <MessageCircle className="h-4 w-4" /> Order
          </a>
          <Link to="/cart" className="relative p-2 rounded-md hover:bg-muted">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-5 min-w-[20px] px-1 grid place-items-center bg-primary text-primary-foreground text-[11px] font-bold rounded-full">
                {count}
              </span>
            )}
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="container mx-auto flex flex-col px-4 py-3">
            {NAV.map((n, i) => (
              <Link
                key={i}
                to={n.to}
                search={"search" in n ? (n.search as never) : undefined}
                onClick={() => setOpen(false)}
                className="py-2.5 border-b border-border last:border-0"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
