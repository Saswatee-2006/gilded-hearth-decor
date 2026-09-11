import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uyhaisrezhssbynfmloe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bty6zbu58IIKjTgyprUGXw_F51JFs9Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkProducts() {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) {
    console.error('Error querying products table:', error.message);
  } else {
    console.log('Products table exists! Data:', data);
  }
}

checkProducts();
