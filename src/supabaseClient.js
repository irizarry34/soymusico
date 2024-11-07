import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

console.log("Supabase URL:", supabaseUrl); // Confirmar valores
console.log("Supabase Key:", supabaseKey); // Confirmar valores

export const supabase = createClient(supabaseUrl, supabaseKey);