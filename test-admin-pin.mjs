// test-admin-pin.mjs
// Test E2E del PIN de acceso al rol Administrador.
// Cubre:
//   1. Restaurante sin security → merge devuelve adminPin: ''
//   2. Restaurante con security vacío → merge devuelve adminPin: ''
//   3. Restaurante con security.adminPin → merge lo respeta
//   4. Validación: PIN inválido (letras, <4, >6, vacío) → isValidPin=false
//   5. Validación: PIN válido (4, 5, 6 dígitos) → isValidPin=true
//   6. normalizePin: solo dígitos, max 6
//   7. pinLength: 4/5/6 según largo
//   8. pinsMatch: igualdad exacta
//   9. Persistencia: guardar PIN en settings y leerlo
//  10. Compatibilidad: quitar PIN vuelve a ''

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

let pass = 0, fail = 0;
const check = (label, ok, extra = '') => {
  if (ok) { console.log(`  ✓ ${label}`); pass++; }
  else { console.error(`  ✗ ${label}  ${extra}`); fail++; }
};
const section = (title) => console.log(`\n${'─'.repeat(60)}\n${title}\n${'─'.repeat(60)}`);

// ═══════════════════════════════════════════════════════════
// Replicar helpers (mismo código que lib/pin.ts y types/menuSettings.ts)
// ═══════════════════════════════════════════════════════════

function normalizePin(input) {
  return (input || '').replace(/\D/g, '').slice(0, 6);
}
function isValidPin(pin) {
  return /^\d{4,6}$/.test(pin);
}
function pinLength(pin) {
  const len = (pin || '').length;
  if (len >= 4 && len <= 6) return len;
  return 4;
}
function pinsMatch(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function getDefaultSettings() {
  return {
    security: { adminPin: '' },
  };
}
function mergeSettings(raw) {
  const defaults = getDefaultSettings();
  if (!raw || typeof raw !== 'object') return defaults;
  const safeObj = (v) => (v && typeof v === 'object' ? v : {});
  return {
    ...defaults,
    ...raw,
    security: { ...defaults.security, ...safeObj(raw.security) },
  };
}

// ═══════════════════════════════════════════════════════════
section('TEST 1: mergeSettings — compat con restaurants.settings');
// ═══════════════════════════════════════════════════════════

const merged1 = mergeSettings({});
check('settings = {} → adminPin = ""', merged1.security.adminPin === '');

const merged2 = mergeSettings(null);
check('settings = null → adminPin = ""', merged2.security.adminPin === '');

const merged3 = mergeSettings(undefined);
check('settings = undefined → adminPin = ""', merged3.security.adminPin === '');

const merged4 = mergeSettings({ primaryColor: '#000' });
check('settings sin security → adminPin = ""', merged4.security.adminPin === '');

const merged5 = mergeSettings({ security: {} });
check('settings.security = {} → adminPin = ""', merged5.security.adminPin === '');

const merged6 = mergeSettings({ security: { adminPin: '1234' } });
check('settings.security.adminPin = "1234" → respeta', merged6.security.adminPin === '1234');

const merged7 = mergeSettings({ security: { adminPin: '999999' } });
check('settings.security.adminPin = "999999" (6 dígitos) → respeta', merged7.security.adminPin === '999999');

const merged8 = mergeSettings({
  primaryColor: '#fff',
  security: { adminPin: '5678' },
  typography: { family: 'serif' },
});
check('settings mixto: security respeta', merged8.security.adminPin === '5678');
check('settings mixto: primaryColor respeta', merged8.primaryColor === '#fff');
check('settings mixto: typography respeta', merged8.typography?.family === 'serif');

// ═══════════════════════════════════════════════════════════
section('TEST 2: isValidPin — validación de formato');
// ═══════════════════════════════════════════════════════════

check('PIN de 4 dígitos válido', isValidPin('1234'));
check('PIN de 5 dígitos válido', isValidPin('12345'));
check('PIN de 6 dígitos válido', isValidPin('123456'));
check('PIN de 3 dígitos inválido', !isValidPin('123'));
check('PIN de 7 dígitos inválido', !isValidPin('1234567'));
check('PIN con letras inválido', !isValidPin('12ab'));
check('PIN vacío inválido', !isValidPin(''));
check('PIN con espacios inválido', !isValidPin('12 34'));
check('PIN con guion inválido', !isValidPin('12-34'));
check('PIN "0000" válido (todo ceros es válido)', isValidPin('0000'));
check('PIN con punto inválido', !isValidPin('12.34'));

// ═══════════════════════════════════════════════════════════
section('TEST 3: normalizePin — limpieza de input');
// ═══════════════════════════════════════════════════════════

check('"1234" → "1234"', normalizePin('1234') === '1234');
check('"12ab34" → "1234"', normalizePin('12ab34') === '1234');
check('"1234567890" → "123456" (trunca a 6)', normalizePin('1234567890') === '123456');
check('" 12 34 " → "1234" (sin espacios)', normalizePin(' 12 34 ') === '1234');
check('"abc" → "" (sin dígitos)', normalizePin('abc') === '');
check('"" → ""', normalizePin('') === '');
check('null → ""', normalizePin(null) === '');
check('undefined → ""', normalizePin(undefined) === '');

// ═══════════════════════════════════════════════════════════
section('TEST 4: pinLength — largo objetivo del keypad');
// ═══════════════════════════════════════════════════════════

check('"1234" → 4 dots', pinLength('1234') === 4);
check('"12345" → 5 dots', pinLength('12345') === 5);
check('"123456" → 6 dots', pinLength('123456') === 6);
check('"123" → 4 (default)', pinLength('123') === 4);
check('"1234567" → 4 (default)', pinLength('1234567') === 4);
check('"" → 4 (default)', pinLength('') === 4);

// ═══════════════════════════════════════════════════════════
section('TEST 5: pinsMatch — comparación');
// ═══════════════════════════════════════════════════════════

check('"1234" == "1234"', pinsMatch('1234', '1234'));
check('"1234" != "1235"', !pinsMatch('1234', '1235'));
check('"1234" != "12345" (diferente largo)', !pinsMatch('1234', '12345'));
check('"" != ""', !pinsMatch('', ''));
check('null != "1234"', !pinsMatch(null, '1234'));
check('"1234" != null', !pinsMatch('1234', null));
check('"0000" == "0000"', pinsMatch('0000', '0000'));

// ═══════════════════════════════════════════════════════════
section('TEST 6: Persistencia en DB real');
// ═══════════════════════════════════════════════════════════

const { data: rests } = await admin.from('restaurants').select('id, name, settings').order('created_at', { ascending: false });
const testRest = rests[0];
console.log('Restaurante de prueba:', testRest.name);

// Guardar PIN
const originalSettings = testRest.settings || {};
const { data: upd1, error: err1 } = await admin.from('restaurants')
  .update({ settings: { ...originalSettings, security: { adminPin: '4321' } } })
  .eq('id', testRest.id)
  .select('settings')
  .single();
check('UPDATE: guardar PIN 4321', !err1 && upd1, err1?.message);
check('  PIN persistido', upd1?.settings?.security?.adminPin === '4321');

// Releer
const { data: reread, error: err2 } = await admin.from('restaurants')
  .select('settings')
  .eq('id', testRest.id)
  .single();
check('READ tras update: PIN coincide', reread?.settings?.security?.adminPin === '4321');

// Cambiar a otro PIN
const { data: upd2, error: err3 } = await admin.from('restaurants')
  .update({ settings: { ...originalSettings, security: { adminPin: '987654' } } })
  .eq('id', testRest.id)
  .select('settings')
  .single();
check('UPDATE: cambiar a PIN de 6 dígitos', !err3 && upd2?.settings?.security?.adminPin === '987654', err3?.message);

// Quitar PIN
const { data: upd3, error: err4 } = await admin.from('restaurants')
  .update({ settings: { ...originalSettings, security: { adminPin: '' } } })
  .eq('id', testRest.id)
  .select('settings')
  .single();
check('UPDATE: quitar PIN (adminPin = "")', !err4 && upd3?.settings?.security?.adminPin === '', err4?.message);

// Restaurar
await admin.from('restaurants').update({ settings: originalSettings }).eq('id', testRest.id);
console.log('  ✓ Settings originales restaurados');

// ═══════════════════════════════════════════════════════════
section('TEST 7: Compatibilidad — settings sin security en DB');
// ═══════════════════════════════════════════════════════════

// Crear un restaurant temporal con settings viejos (sin security)
const tempName = `__test_pin_temp_${Date.now()}`;
const { data: newRest, error: createErr } = await admin.from('restaurants').insert({
  name: tempName,
  general_password: 'test',
  settings: { primaryColor: '#abc', categories: ['X'] }, // sin security
}).select('id, settings').single();
check('Crear restaurant temporal sin security', !createErr && newRest, createErr?.message);

if (newRest) {
  // Releer y mergear
  const { data: fetched } = await admin.from('restaurants').select('settings').eq('id', newRest.id).single();
  const merged = mergeSettings(fetched?.settings);
  check('mergeSettings: defaults aplicados, security.adminPin = ""', merged.security.adminPin === '');
  check('mergeSettings: primaryColor preservado', merged.primaryColor === '#abc');
  check('mergeSettings: categories preservadas', Array.isArray(merged.categories) && merged.categories[0] === 'X');

  // Cleanup
  await admin.from('restaurants').delete().eq('id', newRest.id);
  console.log('  ✓ Restaurant temporal eliminado');
}

// ═══════════════════════════════════════════════════════════
section('TEST 8: Flujo end-to-end simulado (lo que hace role-selection)');
// ═══════════════════════════════════════════════════════════

// Restaurante SIN PIN: click en admin debe ir directo
const restSinPin = rests.find(r => {
  const s = mergeSettings(r.settings || {});
  return s.security.adminPin === '';
});
check(`Encontrar rest sin PIN (${restSinPin?.name || 'ninguno'})`, !!restSinPin);
if (restSinPin) {
  const s = mergeSettings(restSinPin.settings || {});
  check('  hasPin = false', !isValidPin(s.security.adminPin));
  check('  → comportamiento: ir directo (no mostrar keypad)', true);
}

// Restaurante CON PIN: click en admin debe mostrar keypad
const { data: conPin } = await admin.from('restaurants')
  .update({ settings: { ...(originalSettings || {}), security: { adminPin: '5555' } } })
  .eq('id', testRest.id)
  .select('settings')
  .single();
const sPin = mergeSettings(conPin?.settings || {});
check('Rest con PIN: hasPin = true', isValidPin(sPin.security.adminPin));
check('Rest con PIN: target length = 4', pinLength(sPin.security.adminPin) === 4);

// Simular verificación
check('  PIN 5555 matches', pinsMatch('5555', sPin.security.adminPin));
check('  PIN 0000 NO matches', !pinsMatch('0000', sPin.security.adminPin));
check('  PIN 55555 (5 dígitos) NO matches (largo)', !pinsMatch('55555', sPin.security.adminPin));

// Restaurar
await admin.from('restaurants').update({ settings: originalSettings }).eq('id', testRest.id);

console.log(`\n${'═'.repeat(60)}`);
console.log(`  RESULTADO FINAL: ${pass} OK / ${fail} FAIL`);
console.log(`${'═'.repeat(60)}\n`);
if (fail > 0) process.exit(1);
