import { Link } from "@tanstack/react-router";
import { MessageCircle, Mail, MapPin } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground mt-24">
      <div className="container mx-auto px-4 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-primary text-primary-foreground grid place-items-center font-display text-lg rounded-sm">A</div>
            <div className="font-display text-2xl">AFROGROW</div>
          </div>
          <p className="mt-3 text-sm text-white/70 max-w-xs">
            Premium beauty, sports nutrition and gym accessories at retail & wholesale prices.
          </p>
        </div>
        <div>
          <div className="font-display text-lg mb-3">Shop</div>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/shop" className="hover:text-primary">All Products</Link></li>
            <li><Link to="/shop" search={{ category: "hair-care" } as never} className="hover:text-primary">Beauty</Link></li>
            <li><Link to="/shop" search={{ category: "whey-protein" } as never} className="hover:text-primary">Supplements</Link></li>
            <li><Link to="/shop" search={{ category: "gym-gloves" } as never} className="hover:text-primary">Gym Accessories</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-display text-lg mb-3">Company</div>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
            <li><Link to="/wholesale" className="hover:text-primary">Wholesale Program</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
            <li><Link to="/auth" className="hover:text-primary">Admin Login</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-display text-lg mb-3">Get in touch</div>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <a href={whatsappLink("Hello AFROGROW")} target="_blank" rel="noopener" className="hover:text-primary">+255 795 908 230</a>
            </li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> orders@afrogrow.com</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Dar es Salaam, Tanzania</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-5 text-xs text-white/50 flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} AFROGROW. All rights reserved.</span>
          <span>Beauty • Supplements • Gym</span>
        </div>
      </div>
    </footer>
  );
}
