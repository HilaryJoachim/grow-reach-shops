
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "admin manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT,
  category_slug TEXT NOT NULL REFERENCES public.categories(slug) ON DELETE RESTRICT,
  description TEXT NOT NULL DEFAULT '',
  benefits TEXT NOT NULL DEFAULT '',
  usage TEXT NOT NULL DEFAULT '',
  retail_price NUMERIC(12,2) NOT NULL,
  wholesale_price NUMERIC(12,2) NOT NULL,
  moq INT NOT NULL DEFAULT 1,
  image_url TEXT NOT NULL DEFAULT '',
  gallery TEXT[] NOT NULL DEFAULT '{}',
  in_stock BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT USING (true);
CREATE POLICY "admin manage products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Orders (WhatsApp inquiries)
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  business_name TEXT,
  items JSONB NOT NULL,
  total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone insert order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "admin read orders" ON public.orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete orders" ON public.orders FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed categories
INSERT INTO public.categories (name, slug, parent, sort_order) VALUES
  ('Hair Care', 'hair-care', 'Beauty', 1),
  ('Skin Care', 'skin-care', 'Beauty', 2),
  ('Beauty Essentials', 'beauty-essentials', 'Beauty', 3),
  ('Whey Protein', 'whey-protein', 'Supplements', 4),
  ('Creatine', 'creatine', 'Supplements', 5),
  ('Pre Workout', 'pre-workout', 'Supplements', 6),
  ('Mass Gainer', 'mass-gainer', 'Supplements', 7),
  ('BCAA', 'bcaa', 'Supplements', 8),
  ('Gym Gloves', 'gym-gloves', 'Gym Accessories', 9),
  ('Resistance Bands', 'resistance-bands', 'Gym Accessories', 10),
  ('Shaker Bottles', 'shaker-bottles', 'Gym Accessories', 11),
  ('Yoga Mats', 'yoga-mats', 'Gym Accessories', 12);

-- Seed sample products
INSERT INTO public.products (name, slug, category_slug, description, benefits, usage, retail_price, wholesale_price, moq, image_url, featured) VALUES
  ('AFROGROW Hair Growth Oil', 'afrogrow-hair-growth-oil', 'hair-care', 'Premium hair growth oil enriched with natural botanicals to nourish scalp and strengthen hair from root to tip.', 'Promotes hair growth\nNourishes scalp\nReduces hair fall\n100% natural ingredients', 'Massage 5-10 drops into scalp daily. Leave overnight for best results. Wash with mild shampoo.', 25000, 17500, 10, '', true),
  ('Gold Standard Whey Protein 2kg', 'whey-protein-2kg', 'whey-protein', '24g of premium whey protein per serving for muscle growth and recovery.', 'Builds lean muscle\nFast absorption\nLow sugar\n24g protein/scoop', 'Mix 1 scoop with 250ml water or milk. Take post-workout or between meals.', 220000, 175000, 5, '', true),
  ('Creatine Monohydrate 300g', 'creatine-monohydrate-300g', 'creatine', 'Pure micronized creatine monohydrate for explosive strength and power.', 'Boosts ATP energy\nIncreases strength\nFaster recovery\nUnflavored', 'Take 5g daily, mixed with water or juice. Best post-workout.', 65000, 48000, 10, '', true),
  ('Hyde Pre-Workout 30 Servings', 'hyde-pre-workout', 'pre-workout', 'Intense pre-workout formula for maximum energy and focus.', 'Explosive energy\nLaser focus\nIncreased endurance\nGreat taste', 'Mix 1 scoop with 200ml water 20-30 mins before training.', 95000, 72000, 6, '', false),
  ('Mass Gainer 5kg', 'mass-gainer-5kg', 'mass-gainer', 'High-calorie mass gainer with premium protein and carbs.', 'Rapid muscle gains\n1250 calories/serving\n50g protein\nRich chocolate flavor', 'Mix 2 scoops with 500ml milk. Take between meals or post-workout.', 280000, 220000, 4, '', true),
  ('Premium Hair Serum', 'premium-hair-serum', 'hair-care', 'Lightweight hair serum for shine, frizz control and heat protection.', 'Tames frizz\nAdds shine\nHeat protection\nNon-greasy', 'Apply 2-3 drops on damp or dry hair, focus on ends.', 18000, 12500, 10, '', false),
  ('Glow Face Cream', 'glow-face-cream', 'skin-care', 'Daily moisturizer with vitamin C for radiant, even-toned skin.', 'Brightens skin\nDeep hydration\nVitamin C\nSPF protection', 'Apply morning and night on cleansed face.', 35000, 25000, 8, '', true),
  ('Heavy Duty Lifting Gloves', 'lifting-gloves', 'gym-gloves', 'Premium leather gym gloves with wrist support.', 'Better grip\nWrist support\nDurable leather\nBreathable', 'Wear during weightlifting sessions.', 28000, 19000, 10, '', false),
  ('Resistance Bands Set (5pc)', 'resistance-bands-set', 'resistance-bands', 'Set of 5 resistance bands with varying tension levels.', 'Full body workout\n5 resistance levels\nPortable\nDurable latex', 'Use for warm-up, strength training, or rehab.', 32000, 22000, 8, '', false),
  ('Premium Shaker Bottle 700ml', 'shaker-bottle-700ml', 'shaker-bottles', 'BPA-free shaker with stainless steel ball for smooth mixing.', 'Leak proof\nBPA free\n700ml capacity\nDurable', 'Add liquid first, then powder. Shake well.', 15000, 9500, 12, '', false);
