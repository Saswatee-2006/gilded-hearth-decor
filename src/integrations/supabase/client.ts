import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] || import.meta.env["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseAnonKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || import.meta.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] || import.meta.env["VITE_SUPABASE_ANON_KEY"];

let _supabase: any;

const createDummyClient = () => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: new Error("Supabase is not configured") }),
      getUser: async () => ({ data: { user: null }, error: new Error("Supabase is not configured") }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: async () => ({ data: { user: null }, error: new Error("Missing Supabase configuration. Please check your .env file.") }),
      signInWithPassword: async () => ({ data: { user: null }, error: new Error("Missing Supabase configuration.") }),
      signOut: async () => ({ error: null })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: new Error("Supabase is not configured") })
        })
      })
    })
  } as any;
};

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    if (!_supabase) {
      const url = supabaseUrl;
      const key = supabaseAnonKey;
      
      if (!url) {
        console.error("Supabase URL is missing");
      } else {
        try {
          console.log("Supabase Hostname:", new URL(url).hostname);
        } catch(e) {}
      }
      
      if (!key) {
        console.error("Supabase public key is missing");
      }
      
      if (!url || !key) {
        _supabase = createDummyClient();
      } else {
        _supabase = createClient(url, key);
      }
    }
    return Reflect.get(_supabase, prop);
  }
});
