-- Create admin_settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT UNIQUE NOT NULL,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow admins to read settings
CREATE POLICY "Allow admins to read settings"
ON public.admin_settings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Allow admins to update settings
CREATE POLICY "Allow admins to update settings"
ON public.admin_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Allow admins to insert settings (for first-time setup)
CREATE POLICY "Allow admins to insert settings"
ON public.admin_settings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow admins to read activity_logs
CREATE POLICY "Allow admins to read activity logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Allow admins to insert activity_logs
CREATE POLICY "Allow admins to insert activity logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Insert default settings
INSERT INTO public.admin_settings (category, settings) VALUES
('store', '{"name": "Aarohan Decor Atelier", "currency": "INR", "timezone": "Asia/Kolkata", "status": "open"}'::jsonb),
('notifications', '{"new_order_alerts": true, "browser_notifications": false, "popup_notifications": true, "alert_sound": true, "continuous_alert_sound": true, "volume": 100, "stop_sound_when": "either", "low_stock_alerts": true, "out_of_stock_alerts": true}'::jsonb),
('orders', '{"default_status": "placed", "auto_refresh": true, "allow_cancellation": true}'::jsonb),
('inventory', '{"low_stock_threshold": 5, "out_of_stock_threshold": 0, "auto_deduction": true, "allow_negative": false, "allow_overselling": false}'::jsonb),
('customers', '{"registration": true, "email_verification": true}'::jsonb),
('authentication', '{"email_password": true, "google": true, "forgot_password": true}'::jsonb),
('payments', '{"online": true, "cod": true}'::jsonb),
('shipping', '{"free_shipping_threshold": 999}'::jsonb),
('tax', '{"prices_include_tax": true}'::jsonb),
('email', '{"order_confirmation": true}'::jsonb),
('storefront', '{"maintenance_mode": false}'::jsonb)
ON CONFLICT (category) DO NOTHING;
