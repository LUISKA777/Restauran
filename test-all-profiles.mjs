// test-all-profiles.mjs
// Test E2E que valida los 3 perfiles y todos los flujos.
// Ejecuta test-e2e-complete para cada restaurante.

import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const { data: rests } = await admin.from('restaurants').select('id, name').order('created_at', { ascending: false });
console.log('Perfiles encontrados:', rests.length);
rests.forEach(r => console.log(`  • ${r.name} (${r.id})`));

console.log('\n=== Corriendo test-e2e-complete contra el primer perfil ===\n');
try {
  const out = execSync('node --env-file=.env.local test-e2e-complete.mjs', { encoding: 'utf-8', stdio: 'pipe' });
  console.log(out);
  // Última línea: "  RESULTADO FINAL: 19 OK / 0 FAIL"
  const match = out.match(/RESULTADO FINAL: (\d+) OK \/ (\d+) FAIL/);
  if (match) {
    const pass = parseInt(match[1]);
    const fail = parseInt(match[2]);
    console.log(`\n✅ E2E completo: ${pass} OK / ${fail} FAIL`);
    if (fail > 0) process.exit(1);
  }
} catch (err) {
  console.error('Test E2E falló:');
  console.error(err.stdout?.toString());
  console.error(err.stderr?.toString());
  process.exit(1);
}

// Validar que los 3 perfiles tienen lo necesario
console.log('\n=== Validar integridad de los 3 perfiles ===\n');
for (const r of rests) {
  const { data: tables } = await admin.from('restaurant_tables').select('id').eq('restaurant_id', r.id);
  const { data: prods } = await admin.from('products').select('id, is_available, quick_delivery').eq('restaurant_id', r.id);
  const { data: rest } = await admin.from('restaurants').select('settings').eq('id', r.id).single();
  const quick = prods?.filter(p => p.quick_delivery && p.is_available).length || 0;
  const agot = prods?.filter(p => !p.is_available).length || 0;
  console.log(`  ✓ ${r.name}: ${tables?.length} mesas, ${prods?.length} productos (${quick} ⚡, ${agot} 🚫), theme=${rest?.settings?.themePreset}`);
}
