import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — AFROGLOW" }, { name: "description", content: "AFROGLOW supplies premium beauty products, sports nutrition and fitness accessories across Tanzania." }] }),
  component: () => (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <p className="text-xs uppercase tracking-widest text-primary font-semibold">About</p>
      <h1 className="font-display text-5xl mt-1">AFROGLOW</h1>
      <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
        AFROGLOW is a trusted supplier of beauty products, sports nutrition supplements, and fitness accessories.
        We serve individual customers, gyms, salons, resellers and wholesale buyers across Tanzania with a simple promise:
        authentic products, fair pricing, and fast WhatsApp ordering.
      </p>
      <div className="mt-10 grid sm:grid-cols-3 gap-6">
        {[["500+", "Products"], ["1,000+", "Happy customers"], ["24h", "Response time"]].map(([n, l]) => (
          <div key={l} className="bg-secondary rounded-lg p-6 text-center">
            <div className="font-display text-4xl text-primary">{n}</div>
            <div className="text-sm text-muted-foreground mt-1">{l}</div>
          </div>
        ))}
      </div>
    </div>
  ),
});
