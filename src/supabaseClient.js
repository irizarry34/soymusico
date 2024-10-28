import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY; // Asegúrate de que coincida con el nombre en .env

export const supabase = createClient(supabaseUrl, supabaseKey);
