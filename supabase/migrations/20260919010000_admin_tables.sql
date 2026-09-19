-- Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    subcategory TEXT,
    price NUMERIC NOT NULL,
    mrp NUMERIC NOT NULL,
    rating NUMERIC DEFAULT 0,
    reviews INT DEFAULT 0,
    image TEXT,
    gallery TEXT[] DEFAULT '{}',
    style TEXT,
    room TEXT[] DEFAULT '{}',
    material TEXT,
    color TEXT,
    size TEXT,
    dimensions TEXT,
    weight TEXT,
    badges TEXT[] DEFAULT '{}',
    description TEXT,
    care TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Inventory Table
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    variant TEXT DEFAULT 'Default',
    stock INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(product_id, variant)
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'placed', -- placed, processing, shipped, delivered, cancelled
    payment_method TEXT,
    delivery_method TEXT,
    subtotal NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    shipping NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    inventory_deducted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant TEXT DEFAULT 'Default',
    name TEXT,
    image_key TEXT,
    price NUMERIC NOT NULL,
    qty INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Products: Public can read, Admin can all
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Inventory: Public can read, Admin can all
CREATE POLICY "Public can view inventory" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Admins can manage inventory" ON public.inventory 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Orders: Users can read/insert their own, Admins can all
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT 
USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Order Items
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT 
USING ( (SELECT user_id FROM public.orders WHERE id = order_items.order_id) = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
CREATE POLICY "Users can insert order items" ON public.order_items FOR INSERT 
WITH CHECK ( (SELECT user_id FROM public.orders WHERE id = order_items.order_id) = auth.uid() );

-- RPC for secure inventory deduction exactly once
CREATE OR REPLACE FUNCTION public.process_order_inventory(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deducted BOOLEAN;
    v_item RECORD;
BEGIN
    -- Check if already deducted
    SELECT inventory_deducted INTO v_deducted FROM public.orders WHERE id = p_order_id FOR UPDATE;
    
    IF v_deducted THEN
        RETURN FALSE; -- Already deducted, prevent duplicate
    END IF;

    -- Deduct inventory for each item
    FOR v_item IN SELECT product_id, variant, qty FROM public.order_items WHERE order_id = p_order_id
    LOOP
        UPDATE public.inventory 
        SET stock = stock - v_item.qty, updated_at = now()
        WHERE product_id = v_item.product_id AND variant = v_item.variant;
    END LOOP;

    -- Mark as deducted and processing
    UPDATE public.orders 
    SET inventory_deducted = true, status = 'processing', updated_at = now()
    WHERE id = p_order_id;

    RETURN TRUE;
END;
$$;
