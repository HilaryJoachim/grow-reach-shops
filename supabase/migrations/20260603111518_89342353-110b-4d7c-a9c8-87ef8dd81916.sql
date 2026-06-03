
-- Tighten orders insert policy with validation
DROP POLICY IF EXISTS "anyone insert order" ON public.orders;

CREATE POLICY "anyone insert order"
ON public.orders
FOR INSERT
TO public
WITH CHECK (
  total > 0
  AND char_length(customer_name) BETWEEN 1 AND 200
  AND char_length(phone) BETWEEN 5 AND 30
  AND (city IS NULL OR char_length(city) <= 100)
  AND (business_name IS NULL OR char_length(business_name) <= 200)
  AND jsonb_typeof(items) = 'array'
  AND jsonb_array_length(items) > 0
  AND jsonb_array_length(items) <= 200
);

-- Explicit restrictive policies on user_roles to block self privilege escalation
CREATE POLICY "only admins insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "only admins update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "only admins delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));
