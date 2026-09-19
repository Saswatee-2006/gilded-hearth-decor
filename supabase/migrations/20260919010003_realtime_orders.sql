-- Enable Realtime for the 'orders', 'products' and 'inventory' tables
begin;
  -- Add the tables to the supabase_realtime publication
  alter publication supabase_realtime add table public.orders;
  alter publication supabase_realtime add table public.products;
  alter publication supabase_realtime add table public.inventory;
commit;
