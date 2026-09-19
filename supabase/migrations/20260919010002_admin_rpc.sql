-- Create a function to insert a product and its inventory atomically
CREATE OR REPLACE FUNCTION public.create_product_with_inventory(
    p_slug TEXT,
    p_name TEXT,
    p_category TEXT,
    p_price NUMERIC,
    p_mrp NUMERIC,
    p_image TEXT,
    p_description TEXT,
    p_stock INT,
    p_variant TEXT DEFAULT 'Default'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_product_id UUID;
    v_role TEXT;
BEGIN
    -- Only allow admins to execute this function
    SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
    
    IF v_role IS NULL OR v_role != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can create products';
    END IF;

    -- Insert product
    INSERT INTO public.products (
        slug, name, category, price, mrp, image, description
    ) VALUES (
        p_slug, p_name, p_category, p_price, p_mrp, p_image, p_description
    ) RETURNING id INTO v_product_id;

    -- Insert initial inventory
    INSERT INTO public.inventory (
        product_id, variant, stock
    ) VALUES (
        v_product_id, p_variant, p_stock
    );

    RETURN v_product_id;
END;
$$;
