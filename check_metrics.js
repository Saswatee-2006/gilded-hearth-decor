import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: inventory, error: invError } = await supabase.from('inventory').select('*');
  const { data: products, error: prodError } = await supabase.from('products').select('*');

  if (invError || prodError) {
    console.error(invError || prodError);
    return;
  }

  let totalStock = 0;
  let inventoryValue = 0;

  inventory.forEach(item => {
    totalStock += item.stock || 0;
    
    const product = products.find(p => p.id === item.product_id);
    if (product) {
      inventoryValue += (item.stock || 0) * (product.price || 0);
    }
  });

  console.log('TOTAL STOCK:', totalStock);
  console.log('INVENTORY VALUE:', inventoryValue);
}

check();
