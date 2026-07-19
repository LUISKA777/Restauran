import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''

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
