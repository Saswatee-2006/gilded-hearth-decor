-- Enable Realtime for the 'profiles' table so the Admin Users page can update automatically
begin;
  alter publication supabase_realtime add table public.profiles;
commit;
