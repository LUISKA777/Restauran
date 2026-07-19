// seed-demo.mjs
// Crea un perfil de demo con TODO listo para probar:
//   - Restaurante "Burger Lab" con contraseña
//   - 6 mesas
//   - 8 productos en 3 categorías (con quick_delivery y disponibilidad mixta)
//   - Settings de marca: preset "Cálido Sunset" con hero + tagline + contacto
//
// Crea un SOLO restaurante y es idempotente: si ya existe "Burger Lab"
// lo actualiza en vez de duplicar.

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Faltan env vars NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const RESTAURANT = {
  name: 'Burger Lab',
  password: 'demo1234',
};

const TABLES = [1, 2, 3, 4, 5, 6].map(n => ({ table_number: n }));

const PRODUCTS = [
  { name: 'Burger Clásica',     category: 'Hamburguesas', price: 4500, description: 'Carne 150g, queso cheddar, lechuga, tomate, cebolla y nuestra salsa secreta.', is_available: true, quick_delivery: false, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop' },
  { name: 'Burger Bacon BBQ',   category: 'Hamburguesas', price: 5800, description: 'Doble carne, bacon crocante, aros de cebolla, cheddar y BBQ ahumada.', is_available: true, quick_delivery: true,  image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop' },
  { name: 'Burger Trufa Negra', category: 'Hamburguesas', price: 7500, description: 'Carne wagyu, queso brie, rúcula, alioli de trufa y reducción de balsámico.', is_available: true, quick_delivery: false, image_url: 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=600&h=400&fit=crop' },
  { name: 'Papas Truffle',      category: 'Acompañamientos', price: 2800, description: 'Papas crocantes con aceite de trufa, parmesano y perejil fresco.', is_available: true, quick_delivery: true,  image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop' },
  { name: 'Onion Rings',        category: 'Acompañamientos', price: 2200, description: 'Aros de cebolla empanizados con panko, servidos con dip de chipotle.', is_available: true, quick_delivery: false, image_url: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&h=400&fit=crop' },
  { name: 'Limonada de Maracuyá', category: 'Bebidas',     price: 1800, description: 'Maracuyá fresca, limón, menta y un toque de miel. Refrescante y tropical.', is_available: true, quick_delivery: true,  image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=400&fit=crop' },
  { name: 'Milkshake Oreo',     category: 'Bebidas',        price: 2500, description: 'Helado de vainilla batido con Oreo y coronado con crema chantilly.', is_available: true, quick_delivery: false, image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&h=400&fit=crop' },
  { name: 'Brownie Helado',     category: 'Postres',        price: 3200, description: 'Brownie de chocolate tibio con helado de vainilla y salsa de chocolate.', is_available: false, quick_delivery: false, image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=400&fit=crop' },
];

const SETTINGS = {
  themePreset: 'warm-sunset',
  primaryColor: '#ea580c',
  secondaryColor: '#fff7ed',
  accentColor: '#fed7aa',
  backgroundColor: '#7c2d12',
  logoUrl: '',
  backgroundImageUrl: '',
  categories: ['Hamburguesas', 'Acompañamientos', 'Bebidas', 'Postres'],
  typography: { family: 'handwritten', titleWeight: 700, baseSize: 'lg' },
  hero: {
    variant: 'logo-name-tagline',
    tagline: 'Sabor que se siente 🔥',
    showBadge: true,
    badgeText: 'Menú Digital',
  },
  copy: {
    welcomeHeading: '¡Bienvenido a',
    welcomeMessage: 'Elegí tu mesa y pedí directo desde tu celular. Sin esperas.',
    cartButtonLabel: 'Ver mi pedido',
    emptyCartMessage: 'Tu carrito está vacío',
    orderNotesPlaceholder: 'Ej: Término medio, sin cebolla...',
    submitButtonLabel: 'Enviar pedido a cocina',
    successTitle: '¡Pedido en marcha!',
    successMessage: 'Tu pedido está siendo preparado. Te avisamos cuando esté listo.',
    productFallbackDescription: 'Una receta única que tenés que probar.',
  },
  contact: {
    showContactBlock: true,
    whatsappNumber: '+50688887777',
    address: 'Avenida Central, San José, Costa Rica',
    schedule: 'Lun-Dom · 11:00am - 10:00pm',
  },
  layout: {
    columns: 2,
    cardStyle: 'spacious',
    cardAspectRatio: '4-3',
    categoryNavPosition: 'sticky-top',
    showCategoryBadge: true,
  },
};

let pass = 0, fail = 0;
const check = (label, ok, extra = '') => {
  if (ok) { console.log(`  ✓ ${label}`); pass++; }
  else { console.error(`  ✗ ${label}  ${extra}`); fail++; }
};

console.log('=== 0. Buscar restaurante existente ===');
const { data: existing } = await admin
  .from('restaurants')
  .select('id')
  .eq('name', RESTAURANT.name)
  .maybeSingle();

let restaurantId = existing?.id;
if (restaurantId) {
  console.log(`  Ya existe "${RESTAURANT.name}" (${restaurantId}), actualizando...`);
  const { error: upErr } = await admin
    .from('restaurants')
    .update({
      general_password: RESTAURANT.password,
      settings: SETTINGS,
      is_active: true,
    })
    .eq('id', restaurantId);
  check('Restaurante actualizado', !upErr, upErr?.message);
} else {
  console.log(`  Creando "${RESTAURANT.name}"...`);
  const { data: created, error: insErr } = await admin
    .from('restaurants')
    .insert([{
      name: RESTAURANT.name,
      general_password: RESTAURANT.password,
      is_active: true,
      settings: SETTINGS,
    }])
    .select('id')
    .single();
  if (insErr) {
    console.error('  ✗ Error creando restaurante:', insErr.message);
    process.exit(1);
  }
  restaurantId = created.id;
  check('Restaurante creado', true);
}

console.log('\n=== 1. Mesas (idempotente) ===');
const { data: existingTables } = await admin
  .from('restaurant_tables')
  .select('table_number')
  .eq('restaurant_id', restaurantId);
const existingNumbers = new Set((existingTables || []).map(t => t.table_number));
const toInsert = TABLES.filter(t => !existingNumbers.has(t.table_number));
if (toInsert.length > 0) {
  const { error: tErr } = await admin
    .from('restaurant_tables')
    .insert(toInsert.map(t => ({ ...t, restaurant_id: restaurantId })));
  check(`Mesas nuevas (${toInsert.map(t => t.table_number).join(', ')})`, !tErr, tErr?.message);
} else {
  console.log('  (todas las mesas ya existen)');
}
const { data: tablesFinal } = await admin
  .from('restaurant_tables')
  .select('*')
  .eq('restaurant_id', restaurantId)
  .order('table_number');
check(`Total de mesas: ${tablesFinal?.length}`, tablesFinal?.length === 6, `hay ${tablesFinal?.length}`);

console.log('\n=== 2. Productos (idempotente por nombre) ===');
const { data: existingProducts } = await admin
  .from('products')
  .select('id, name')
  .eq('restaurant_id', restaurantId);
const existingNames = new Set((existingProducts || []).map(p => p.name));
const newProducts = PRODUCTS.filter(p => !existingNames.has(p.name));

if (newProducts.length > 0) {
  const { data: ins, error: pErr } = await admin
    .from('products')
    .insert(newProducts.map(p => ({ ...p, restaurant_id: restaurantId })))
    .select('id, name');
  check(`Productos nuevos: ${newProducts.length}`, !pErr, pErr?.message);
  if (ins) ins.forEach(p => console.log(`    + ${p.name}`));
} else {
  console.log('  (todos los productos ya existen)');
}
const { data: productsFinal } = await admin
  .from('products')
  .select('*')
  .eq('restaurant_id', restaurantId);
check(`Total de productos: ${productsFinal?.length}`, productsFinal?.length === PRODUCTS.length);

const quick = productsFinal?.filter(p => p.quick_delivery && p.is_available) || [];
const agotados = productsFinal?.filter(p => !p.is_available) || [];
check(`Productos quick_delivery disponibles: ${quick.length}`, quick.length >= 3);
check(`Productos agotados para pruebas: ${agotados.length}`, agotados.length >= 1);

console.log('\n=== 3. Validar settings aplicados ===');
const { data: restFinal } = await admin
  .from('restaurants')
  .select('settings')
  .eq('id', restaurantId)
  .single();
check('Settings.themePreset = warm-sunset', restFinal?.settings?.themePreset === 'warm-sunset');
check('Settings.hero.variant = logo-name-tagline', restFinal?.settings?.hero?.variant === 'logo-name-tagline');
check('Settings.contact.whatsappNumber presente', restFinal?.settings?.contact?.whatsappNumber === '+50688887777');

console.log('\n=== 4. Limpiar órdenes viejas (opcional) ===');
const { data: oldOrders } = await admin
  .from('orders')
  .select('id')
  .eq('restaurant_id', restaurantId);
if (oldOrders && oldOrders.length > 0) {
  const ids = oldOrders.map(o => o.id);
  await admin.from('order_items').delete().in('order_id', ids);
  await admin.from('orders').delete().in('id', ids);
  console.log(`  ✓ ${oldOrders.length} orden(es) vieja(s) eliminada(s)`);
} else {
  console.log('  (sin órdenes previas)');
}

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║            PERFIL DE DEMO LISTO                        ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log('');
console.log(`  🏪 Restaurante:   ${RESTAURANT.name}`);
console.log(`  🔑 Contraseña:    ${RESTAURANT.password}`);
console.log(`  🆔 ID:            ${restaurantId}`);
console.log(`  🪑 Mesas:         6 (1-6)`);
console.log(`  🍔 Productos:     ${productsFinal?.length} (en 4 categorías)`);
console.log(`  ⚡ Quick delivery: ${quick.length} (Hamburger Bacon BBQ, Papas Truffle, Limonada Maracuyá)`);
console.log(`  🚫 Agotados:      1 (Brownie Helado - para probar badge "Agotado")`);
console.log(`  🎨 Tema:          warm-sunset (Cálido Sunset) con tagline y contacto`);
console.log('');
console.log('  URLs para probar:');
console.log(`    • Menú público:  /menu/${restaurantId}`);
console.log(`    • Admin:         /login  (usuario: "${RESTAURANT.name}", pass: "${RESTAURANT.password}")`);
console.log(`    • Personalizar:  /dashboard/admin/settings`);
console.log('');
console.log(`  Resultado: ${pass} OK / ${fail} FAIL`);
if (fail > 0) process.exit(1);
