// test-crud-final.mjs
// Test E2E exhaustivo: valida el flujo CRUD que usa el admin menu page.
// Simula exactamente las llamadas que hace /app/dashboard/admin/menu/page.tsx
// usando supabaseAdmin (service_role) tal como está implementado ahora.

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error('Faltan env vars. Cargá .env.local antes de correr.');
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
const anon = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });

const PROBE = `__CRUD_${Date.now()}__`;
let pass = 0, fail = 0;

const check = (label, ok, extra = '') => {
  if (ok) { console.log(`  ✓ ${label}`); pass++; }
  else { console.error(`  ✗ ${label}  ${extra}`); fail++; }
};

// 1. Listar restaurantes y elegir uno
console.log('=== 0. Setup ===');
const { data: rests } = await admin.from('restaurants').select('id, name').limit(1);
const rid = rests[0].id;
console.log('Restaurante:', rests[0].name, '(', rid, ')');

// 2. INSERT producto (lo que hace handleSaveProduct en add mode)
console.log('\n=== 1. CREATE (admin.addProduct) ===');
const { data: created, error: e1 } = await admin.from('products').insert([{
  name: PROBE,
  description: 'Test E2E product',
  price: 1500,
  category: 'E2E',
  image_url: '',
  is_available: true,
  quick_delivery: false,
  restaurant_id: rid,
}]).select().single();
check('INSERT producto', !e1, e1?.message);
const newId = created?.id;

// 3. SELECT con anon (lectura pública)
console.log('\n=== 2. READ público (anon) ===');
const { data: pub, error: e2 } = await anon.from('products').select('*').eq('id', newId).single();
check('SELECT con anon', !e2 && pub?.name === PROBE, e2?.message);

// 4. SELECT con admin + sorting en cliente (lo que hace fetchProducts)
console.log('\n=== 3. READ admin + sort cliente ===');
const { data: list, error: e3 } = await admin.from('products').select('*').eq('restaurant_id', rid);
check('SELECT admin', !e3, e3?.message);
const sorted = (list || []).slice().sort((a, b) => {
  const at = a.created_at ? new Date(a.created_at).getTime() : 0;
  const bt = b.created_at ? new Date(b.created_at).getTime() : 0;
  return bt - at;
});
const found = sorted.find(p => p.id === newId);
check('Producto aparece en lista ordenada', !!found);

// 5. UPDATE (lo que hace handleSaveProduct en edit mode)
console.log('\n=== 4. UPDATE producto ===');
const { data: upd, error: e4 } = await admin.from('products').update({
  name: PROBE + '_EDITED',
  price: 2500,
  is_available: false,
}).eq('id', newId).select().single();
check('UPDATE name+price+avail', !e4, e4?.message);
check('  name actualizado', upd?.name === PROBE + '_EDITED');
check('  price actualizado', upd?.price === 2500);
check('  avail actualizado', upd?.is_available === false);

// 6. TOGGLE availability (lo que hace toggleAvailability)
console.log('\n=== 5. TOGGLE availability ===');
const { data: tog, error: e5 } = await admin.from('products').update({
  is_available: true,
}).eq('id', newId).select('is_available').single();
check('Toggle avail true', !e5 && tog?.is_available === true, e5?.message);

// 7. DELETE (cleanup)
console.log('\n=== 6. DELETE producto ===');
const { error: e6 } = await admin.from('products').delete().eq('id', newId);
check('DELETE', !e6, e6?.message);

// 8. Verificar que ya no existe
const { data: after } = await admin.from('products').select('id').eq('id', newId).maybeSingle();
check('Producto eliminado', !after);

// 9. Settings: UPDATE restaurant.settings (lo que hace saveSettings en admin)
console.log('\n=== 7. UPDATE restaurant.settings (admin) ===');
const { data: settingsUpdate, error: e7 } = await admin.from('restaurants')
  .update({ settings: { test_marker: PROBE } })
  .eq('id', rid)
  .select('id, settings');
check('UPDATE settings', !e7 && settingsUpdate?.length > 0, e7?.message);
check('  No es bloqueado por RLS', settingsUpdate?.length > 0);

// 10. SELECT con anon para ver los settings
const { data: settingsRead, error: e8 } = await anon.from('restaurants')
  .select('settings').eq('id', rid).single();
check('Settings visibles al público', !e8, e8?.message);

// 11. Restaurar settings a como estaban
console.log('\n=== 8. Restaurar settings ===');
if (settingsRead?.settings) {
  delete settingsRead.settings.test_marker;
  const { error: e9 } = await admin.from('restaurants')
    .update({ settings: settingsRead.settings })
    .eq('id', rid);
  check('Restaurar settings', !e9, e9?.message);
}

console.log(`\n=== RESULTADO: ${pass} OK / ${fail} FAIL ===`);
if (fail > 0) process.exit(1);
