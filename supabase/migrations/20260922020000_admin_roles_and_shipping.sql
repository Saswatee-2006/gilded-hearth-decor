-- Update public.profiles to add permissions column and support new roles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;

-- Note: We are keeping the role column as TEXT since it's already used.
-- We will enforce role strings ('owner', 'admin', 'manager', 'staff', 'user') in the application logic.
-- However, we can add a check constraint.
-- Because existing rows might only have 'admin' or 'user', this is safe.

ALTER TABLE public.profiles
ADD CONSTRAINT valid_roles CHECK (role IN ('owner', 'admin', 'manager', 'staff', 'user'));

-- Default permissions for existing admins could be populated here, but we will handle it in the application layer dynamically for simplicity.

-- Create shipping_zones table
CREATE TABLE IF NOT EXISTS public.shipping_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    regions TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to shipping_zones"
ON public.shipping_zones FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admins to manage shipping_zones"
ON public.shipping_zones FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
);

-- Create shipping_rates table
CREATE TABLE IF NOT EXISTS public.shipping_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    min_order_amount NUMERIC,
    max_order_amount NUMERIC,
    estimated_days TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to shipping_rates"
ON public.shipping_rates FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admins to manage shipping_rates"
ON public.shipping_rates FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
);

-- Add default shipping zone if it doesn't exist
INSERT INTO public.shipping_zones (name, regions, is_active)
SELECT 'Domestic (India)', '{"India"}', true
WHERE NOT EXISTS (SELECT 1 FROM public.shipping_zones LIMIT 1);
