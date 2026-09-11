CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
REVOKE EXECUTE ON FUNCTION private.has_role(UUID, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(UUID, public.app_role) TO authenticated;

DROP POLICY "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR private.has_role(auth.uid(),'admin'));

DROP POLICY "Users manage own profile" ON public.profiles;
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id OR private.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = id OR private.has_role(auth.uid(),'admin'));

DROP POLICY "Users manage own addresses" ON public.addresses;
CREATE POLICY "Users manage own addresses" ON public.addresses FOR ALL TO authenticated USING (auth.uid() = user_id OR private.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = user_id);

DROP POLICY "Users read own orders" ON public.orders;
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR private.has_role(auth.uid(),'admin'));
DROP POLICY "Admins update orders" ON public.orders;
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY "Users read own order items" ON public.order_items;
CREATE POLICY "Users read own order items" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR private.has_role(auth.uid(),'admin'))));

DROP POLICY "Anyone reads approved reviews" ON public.reviews;
CREATE POLICY "Anyone reads approved reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (is_approved = true OR auth.uid() = user_id OR private.has_role(auth.uid(),'admin'));
DROP POLICY "Users update own reviews" ON public.reviews;
CREATE POLICY "Users update own reviews" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id OR private.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = user_id OR private.has_role(auth.uid(),'admin'));
DROP POLICY "Users delete own reviews" ON public.reviews;
CREATE POLICY "Users delete own reviews" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id OR private.has_role(auth.uid(),'admin'));

DROP FUNCTION public.has_role(UUID, public.app_role);