-- Create Customization Requests Table
CREATE TABLE IF NOT EXISTS public.customization_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer TEXT,
    email TEXT,
    phone TEXT,
    type TEXT,
    title TEXT,
    quantity INT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.customization_requests ENABLE ROW LEVEL SECURITY;

-- Public can insert customization requests
CREATE POLICY "Public can insert customization requests" 
ON public.customization_requests FOR INSERT 
WITH CHECK (true);

-- Admins can view and manage customization requests
CREATE POLICY "Admins can manage customization requests" 
ON public.customization_requests 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Enable Realtime
BEGIN;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.customization_requests;
COMMIT;
