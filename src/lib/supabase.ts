import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://heauhmjmkkqbakslzcag.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_FS0ag1wNdRxDfaKScKoTLw_-RiktQUZ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
