import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Mail, MapPin } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact - AFROGLOW" },
      {
        name: "description",
        content: "Reach AFROGLOW on WhatsApp for orders, wholesale and support.",
      },
    ],
  }),
  component: () => (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <p className="text-xs uppercase tracking-widest text-primary font-semibold">Contact</p>
      <h1 className="font-display text-5xl mt-1">Get in touch</h1>
      <p className="mt-4 text-muted-foreground">
        The fastest way to reach us is WhatsApp. We respond in minutes.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        <a
          href={whatsappLink("Hello AFROGLOW")}
          target="_blank"
          rel="noopener"
          className="bg-ink text-ink-foreground rounded-lg p-6 hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <MessageCircle className="h-7 w-7" />
          <div className="font-display text-xl mt-4">WhatsApp</div>
          <div className="text-sm opacity-80 mt-1">+91 690 929 8493</div>
        </a>
        <div className="bg-card border border-border rounded-lg p-6">
          <Mail className="h-7 w-7 text-primary" />
          <div className="font-display text-xl mt-4">Email</div>
          <div className="text-sm text-muted-foreground mt-1">Afroglowtz@gmail.com</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 sm:col-span-2">
          <MapPin className="h-7 w-7 text-primary" />
          <div className="font-display text-xl mt-4">Location</div>
          <div className="text-sm text-muted-foreground mt-1">Dar es Salaam, Tanzania</div>
        </div>
      </div>

      <div className="mt-10">
        <Button asChild size="lg">
          <a
            href={whatsappLink("Hello AFROGLOW, I'd like to place an order.")}
            target="_blank"
            rel="noopener"
          >
            <MessageCircle className="h-4 w-4 mr-1" /> Start Chat
          </a>
        </Button>
      </div>
    </div>
  ),
});
