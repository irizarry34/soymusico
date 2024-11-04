import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

// Agrega los console.log aquí para verificar que las variables no estén undefined
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key:", supabaseKey);

// Crea el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);