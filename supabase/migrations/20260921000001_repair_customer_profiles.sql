-- 1. Fix the trigger function to handle phone-based signups correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, role, created_at)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        COALESCE(NEW.email, NEW.raw_user_meta_data->>'email'),
        NEW.phone,
        'customer',
        NEW.created_at
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = COALESCE(EXCLUDED.email, public.profiles.email),
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone);
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Profile creation failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Repair missing profiles by syncing from auth.users
INSERT INTO public.profiles (id, full_name, email, phone, role, created_at)
SELECT 
    u.id, 
    u.raw_user_meta_data->>'full_name', 
    COALESCE(u.email, u.raw_user_meta_data->>'email'), 
    u.phone, 
    'customer', 
    u.created_at
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 3. Update existing profiles if they are missing email or full_name but auth.users has it
UPDATE public.profiles p
SET 
    email = COALESCE(p.email, u.email, u.raw_user_meta_data->>'email'),
    full_name = COALESCE(p.full_name, u.raw_user_meta_data->>'full_name'),
    phone = COALESCE(p.phone, u.phone)
FROM auth.users u
WHERE p.id = u.id;

-- 4. If a profile is STILL missing an email or full_name, fetch it from their most recent order
UPDATE public.profiles p
SET 
    email = COALESCE(p.email, (
        SELECT o.shipping_address->>'email' 
        FROM public.orders o 
        WHERE o.user_id = p.id AND o.shipping_address->>'email' IS NOT NULL 
        ORDER BY o.created_at DESC LIMIT 1
    )),
    full_name = COALESCE(p.full_name, (
        SELECT o.shipping_address->>'name' 
        FROM public.orders o 
        WHERE o.user_id = p.id AND o.shipping_address->>'name' IS NOT NULL 
        ORDER BY o.created_at DESC LIMIT 1
    ))
WHERE p.email IS NULL OR p.full_name IS NULL;
