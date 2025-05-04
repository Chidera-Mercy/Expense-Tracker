import { createClient } from '@supabase/supabase-js';

// More defensive approach
let supabaseUrl;
let supabaseKey;

try {
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables not found at initialization time');
  }
} catch (error) {
  console.error('Error accessing Supabase environment variables:', error);
}

// Use fallbacks to prevent the URL construction error
const supabase = createClient(
  supabaseUrl || 'https://fallback-url.supabase.co', 
  supabaseKey || 'fallback-key'
);

export default supabase;
