import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X, MessageCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { whatsappLink } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import logo from "@/assets/afrologo2.jpg";

const SHOP_GROUPS = [
  { label: "Afro Glow", category: "afro-glow" },
  { label: "Afro Gain", category: "afro-gain" },
  { label: "Afro Wear", category: "afro-wear" },
] as const;

export function SiteHeader() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="bg-ink text-ink-foreground text-xs">
        <div className="container mx-auto flex justify-between items-center px-4 py-1.5">
          <span>Afro Glow • Afro Gain • Afro Wear</span>
          <a href={whatsappLink("Hello AFROGLOW, I have a question.")} target="_blank" rel="noopener" className="hidden sm:inline text-primary hover:underline">
            +255 697 858 009
          </a>
        </div>
      </div>
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          {/* 2. Update the img tag like this: */}
          <img
            src={logo}
            alt="AFROGLOW Logo"
            className="h-10 w-auto"
          />
        </Link>
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="hover:text-primary transition-colors" activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }}>Home</Link>
          <div className="relative" onMouseEnter={() => setShopOpen(true)} onMouseLeave={() => setShopOpen(false)}>
            <Link to="/shop" className="flex items-center gap-1 hover:text-primary transition-colors" activeProps={{ className: "text-primary" }}>
              Shop <ChevronDown className="h-3.5 w-3.5" />
            </Link>
            {shopOpen && (
              <div className="absolute left-0 top-full pt-2 w-44">
                <div className="bg-background border border-border rounded-md shadow-lg overflow-hidden">
                  <Link to="/shop" className="block px-4 py-2.5 text-sm hover:bg-muted hover:text-primary">All Products</Link>
                  {SHOP_GROUPS.map((g) => (
                    <Link key={g.label} to="/shop" search={{ category: g.category } as never} className="block px-4 py-2.5 text-sm hover:bg-muted hover:text-primary">
                      {g.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link to="/about" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary" }}>About</Link>
          <Link to="/contact" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary" }}>Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={whatsappLink("Hello AFROGLOW, I'd like to make an inquiry.")}
            target="_blank" rel="noopener"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium bg-ink text-ink-foreground hover:bg-primary transition-colors rounded-md px-3 py-2"
          >
            <MessageCircle className="h-4 w-4" /> Talk to us
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
            <Link to="/" onClick={() => setOpen(false)} className="py-2.5 border-b border-border">Home</Link>
            <Link to="/shop" onClick={() => setOpen(false)} className="py-2.5 border-b border-border">Shop — All</Link>
            {SHOP_GROUPS.map((g) => (
              <Link key={g.label} to="/shop" search={{ category: g.category } as never} onClick={() => setOpen(false)} className="py-2.5 pl-4 border-b border-border text-muted-foreground">
                {g.label}
              </Link>
            ))}
            <Link to="/about" onClick={() => setOpen(false)} className="py-2.5 border-b border-border">About</Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="py-2.5">Contact</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
