# PROJECT.md — AFROGLOW (grow-reach-shop)
> **Source of Truth** — Check this file before asking about patterns or conventions.

---

## Overview

**AFROGLOW** is a retail/wholesale e-commerce storefront for beauty products, supplements, and gym accessories.
Customers can browse and add to a local cart, then submit orders via a WhatsApp link.
An admin-only back-office (behind Supabase auth + role check) manages products, categories, and orders.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (SSR, file-based routing) |
| Bundler / Dev Server | Vite 7 + Nitro (SSR server, Cloudflare target) |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Component Library | shadcn/ui (Radix UI primitives) |
| Data Fetching | TanStack Query v5 |
| Backend / Auth | Supabase (Postgres + Auth) |
| Forms | React Hook Form + Zod |
| Toasts | Sonner |
| Language | TypeScript (strict) |
| Package Manager | bun (lockfile present) / npm also works |

---

## Directory Structure

```
grow-reach-shop/
├── src/
│   ├── start.ts              # App entry — TanStack Start instance, global middleware
│   ├── server.ts             # SSR server entry (Nitro); points to via vite.config.ts
│   ├── router.tsx            # Creates TanStack Router + QueryClient (one instance per request)
│   ├── routeTree.gen.ts      # AUTO-GENERATED — do NOT edit manually
│   ├── styles.css            # Global CSS / Tailwind base
│   │
│   ├── routes/               # File-based routes (TanStack Router convention)
│   │   ├── __root.tsx        # Root layout: QueryClientProvider → CartProvider → SiteHeader/Footer
│   │   ├── index.tsx         # Homepage (hero, featured products, categories)
│   │   ├── shop.tsx          # Shop listing page
│   │   ├── products.$slug.tsx# Product detail (dynamic slug)
│   │   ├── cart.tsx          # Cart page + WhatsApp order submission
│   │   ├── about.tsx         # About page
│   │   ├── contact.tsx       # Contact page
│   │   ├── auth.tsx          # Login/Sign-up (Supabase Auth UI)
│   │   └── _authenticated/   # Auth-gated segment
│   │       ├── route.tsx     # Guard: checks Supabase session, redirects to /auth if missing
│   │       ├── admin.tsx     # Admin layout / role check (claimAdminIfFirst + checkIsAdmin)
│   │       └── admin/        # Admin sub-pages
│   │           ├── index.tsx     # Admin dashboard
│   │           ├── products.tsx  # Product CRUD
│   │           ├── categories.tsx# Category CRUD
│   │           └── orders.tsx    # Order list + delete
│   │
│   ├── components/
│   │   ├── SiteHeader.tsx    # Top nav: logo, nav links, cart icon with badge
│   │   ├── SiteFooter.tsx    # Footer
│   │   ├── ProductCard.tsx   # Reusable product tile (used in shop + homepage)
│   │   └── ui/               # shadcn/ui components (46 files — DO NOT hand-edit)
│   │
│   ├── hooks/
│   │   └── use-mobile.tsx    # useIsMobile() — window width breakpoint hook
│   │
│   ├── lib/
│   │   ├── cart.tsx          # CartProvider + useCart() — localStorage-persisted cart state
│   │   ├── pricing.ts        # unitPriceFor / lineTotal / savingsFor — retail vs wholesale logic
│   │   ├── whatsapp.ts       # WHATSAPP_NUMBER constant + whatsappLink() helper
│   │   ├── admin.functions.ts# Server functions (createServerFn) for all admin CRUD
│   │   ├── config.server.ts  # Server-side env config (SUPABASE_URL etc.)
│   │   ├── format.ts         # Utility formatters (currency etc.)
│   │   ├── utils.ts          # cn() (clsx + tailwind-merge)
│   │   ├── error-capture.ts  # Error capture helper
│   │   ├── error-page.ts     # Static error page HTML renderer
│   │   ├── lovable-error-reporting.ts # Lovable-specific error hook
│   │   └── api/
│   │       └── example.functions.ts   # Boilerplate server fn example
│   │
│   └── integrations/
│       └── supabase/
│           ├── types.ts          # Auto-generated DB types (Database, Tables<>, etc.)
│           ├── client.ts         # Browser Supabase client (singleton)
│           ├── client.server.ts  # Server-side admin Supabase client (service role key)
│           ├── auth-attacher.ts  # Middleware: attaches Supabase session to every SSR request
│           └── auth-middleware.ts# requireSupabaseAuth — used by server functions
│
├── supabase/
│   ├── config.toml
│   └── migrations/           # SQL migration files (run via Supabase CLI)
│
├── vite.config.ts            # Thin wrapper around @lovable.dev/vite-tanstack-config
├── components.json           # shadcn/ui config (path aliases, style)
├── tsconfig.json
├── package.json
└── .env                      # Local env vars (SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, etc.)
```

---

## Key Patterns & Conventions

### Routing
- File-based via TanStack Router. `routeTree.gen.ts` is **auto-generated** on every `vite dev` start.
- The `_authenticated` folder prefix creates a **layout segment** (not a URL segment). Routes inside it inherit the auth guard.
- Dynamic segments use `$param` in the filename (e.g., `products.$slug.tsx`).

### State Management
- **Global cart state**: `CartProvider` wraps the entire app in `__root.tsx`. Access with `useCart()`. Persisted to `localStorage` under key `afroglow_cart_v1`.
- **Server state**: TanStack Query (`useQuery`, `useMutation`). The `QueryClient` lives in `router.tsx` and is injected via router context.
- No Redux or Zustand — keep it that way.

### Pricing Logic (Retail vs. Wholesale)
- Defined in `src/lib/pricing.ts`.
- If `qty >= product.moq`, wholesale price applies. Otherwise retail price.
- **Always use `unitPriceFor()`, `lineTotal()`, `savingsFor()`** — never calculate prices inline.

### Server Functions (Backend RPC)
- Pattern: `createServerFn({ method: "POST"|"GET" }).middleware([requireSupabaseAuth]).inputValidator(zodSchema).handler(...)`.
- All admin mutations live in `src/lib/admin.functions.ts`.
- **Always gate server functions with `requireSupabaseAuth` middleware** for any protected operation.
- The server-side admin Supabase client (bypasses RLS) is imported from `client.server.ts` — use only inside server functions.

### Authentication
- Supabase Auth. Session stored in browser cookies/localStorage by `@supabase/supabase-js`.
- Client-side guard: `_authenticated/route.tsx` calls `supabase.auth.getUser()` in `beforeLoad`.
- Server-side guard: `requireSupabaseAuth` middleware extracts `Authorization: Bearer <token>` from the request header (attached by `auth-attacher.ts`).
- Roles: `user_roles` table with `app_role` enum (`"admin" | "user"`). `has_role()` Postgres function available.
- First signed-in user auto-claims admin via `claimAdminIfFirst` server function.

### Styling
- Tailwind CSS v4. **Do not add TailwindCSS v3 config files** (`tailwind.config.js`) — they are incompatible.
- Theme tokens live in `src/styles.css` (CSS custom properties).
- Component styles use `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge).
- Fonts: **Anton** (display/headings) and **Inter** (body) loaded from Google Fonts in `__root.tsx`.

### UI Components
- shadcn/ui components are in `src/components/ui/`. **Do not manually edit** these unless intentionally deviating from upstream.
- New shadcn components: add via `npx shadcn@latest add <component>`.
- Custom business components go in `src/components/` (not under `ui/`).

### WhatsApp Integration
- Orders are submitted by generating a pre-filled WhatsApp deep link via `whatsappLink()` in `src/lib/whatsapp.ts`.
- Phone number: `255795908230` (+255 795 908 230, Tanzania).
- No payment gateway — purchase intent goes through WhatsApp.

---

## Database Schema (Supabase)

| Table | Purpose |
|---|---|
| `products` | Product catalog (retail_price, wholesale_price, moq, slug, gallery, in_stock, featured) |
| `categories` | Hierarchical categories (slug, parent, sort_order) — products FK to `categories.slug` |
| `orders` | Customer orders submitted from cart (customer_name, phone, city, items JSON, total) |
| `user_roles` | Maps `user_id` → `app_role` (`admin` or `user`) |

RLS is enabled. The admin server client uses the **service role key** to bypass RLS for admin operations.

---

## Environment Variables

| Variable | Where Used |
|---|---|
| `SUPABASE_URL` | Both client and server |
| `SUPABASE_PUBLISHABLE_KEY` | Browser client + server middleware |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin client (`client.server.ts`) |

---

## Developer Workflow

```bash
# Start dev server
npm run dev   # or: bun dev

# Lint
npm run lint

# Format
npm run format

# Build production
npm run build
```

---

## What NOT to Do
- ❌ Do not edit `src/routeTree.gen.ts` — it is auto-generated.
- ❌ Do not add `tailwind.config.js` — project uses Tailwind v4 via Vite plugin.
- ❌ Do not add duplicate Vite plugins already included by `@lovable.dev/vite-tanstack-config` (see `vite.config.ts` comment).
- ❌ Do not import `supabaseAdmin` client inside client-side (browser) code.
- ❌ Do not calculate prices inline — always use `src/lib/pricing.ts`.
- ❌ Do not store sensitive keys in `client.ts` (browser) — only in server-side files.
