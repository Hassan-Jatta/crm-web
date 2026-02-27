import { createClient } from '@supabase/supabase-js';

// On récupère les clés publiques depuis ton fichier .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// On crée et on exporte le "client" (l'outil de communication)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);