import { createClient } from '@supabase/supabase-js'

// Sanitizar env vars: Vercel a veces inyecta newlines o espacios al final
// cuando las env vars se editan desde la UI. Eso rompe el header HTTP
// `Authorization: Bearer <token>` porque los headers no admiten esos chars.
const clean = (v: string | undefined) => (v || '').replace(/[\r\n\t ]/g, '').trim()

const supabaseUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL)
const supabaseServiceRoleKey = clean(process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)

// Cliente con service_role key para operaciones administrativas.
// Usado por:
//   - /superadmin/*   (gestión de restaurantes)
//   - /dashboard/admin/settings (el admin de restaurante guardando su marca)
// El RLS actual de `restaurants` solo permite SELECT público; cualquier
// INSERT/UPDATE/DELETE debe pasar por service_role. Aceptamos este trade-off
// porque la app es interna; en producción real debería ir a Edge Functions.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
