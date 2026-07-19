import { createClient } from '@supabase/supabase-js'

// Sanitizar env vars: Vercel a veces inyecta newlines o espacios al final
// cuando las env vars se editan desde la UI. Eso rompe el header HTTP
// `Authorization: Bearer <token>` porque los headers no admiten esos chars.
const clean = (v: string | undefined) => (v || '').replace(/[\r\n\t ]/g, '').trim()

const supabaseUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL)
const supabaseAnonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
