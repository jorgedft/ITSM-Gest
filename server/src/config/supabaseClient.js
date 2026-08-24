import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('❌  Faltan SUPABASE_URL o SUPABASE_ANON_KEY en .env');
}

// Respeta RLS — para peticiones del usuario autenticado
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Bypasa RLS — solo usar en lógica de negocio segura del servidor
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});