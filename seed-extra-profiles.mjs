// seed-extra-profiles.mjs
// Crea 2 perfiles adicionales de demo para tener variedad de pruebas.

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

let pass = 0, fail = 0;
const check = (label, ok, extra = '') => {
  if (ok) { console.log(`  ✓ ${label}`); pass++; }
  else { console.error(`  ✗ ${label}  ${extra}`); fail++; }
};

const PROFILES = [
  {
    name: 'Café Aroma',
    password: 'cafe1234',
    tables: 8,
    products: [
      { name: 'Espresso Doble',     category: 'Café',          price: 1800, is_available: true, quick_delivery: true,  description: 'Shot doble de espresso recién molido.',         image_url: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&h=400&fit=crop' },
      { name: 'Cappuccino',         category: 'Café',          price: 2200, is_available: true, quick_delivery: true,  description: 'Espresso con leche texturizada y arte latte.',    image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=400&fit=crop' },
      { name: 'Latte Vainilla',     category: 'Café',          price: 2400, is_available: true, quick_delivery: false, description: 'Espresso, leche vaporizada y vainilla natural.',  image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=400&fit=crop' },
      { name: 'Croissant',          category: 'Panadería',     price: 1600, is_available: true, quick_delivery: true,  description: 'Croissant hojaldrado con mantequilla francesa.',  image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=400&fit=crop' },
      { name: 'Muffin de Arándanos', category: 'Panadería',     price: 1800, is_available: true, quick_delivery: false, description: 'Esponjoso muffin con arándanos frescos.',         image_url: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=600&h=400&fit=crop' },
      { name: 'Tostada Aguacate',   category: 'Desayunos',     price: 3200, is_available: true, quick_delivery: false, description: 'Pan integral, aguacate, huevo pochado y semillas.', image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop' },
      { name: 'Bowl de Açaí',       category: 'Desayunos',     price: 4500, is_available: true, quick_delivery: false, description: 'Açaí con granola, banana, fresas y coco rallado.', image_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&h=400&fit=crop' },
      { name: 'Cheesecake Frutos',  category: 'Postres',       price: 3500, is_available: false, quick_delivery: false, description: 'Cheesecake clásico con coulis de frutos rojos.',  image_url: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&h=400&fit=crop' },
    ],
    settings: {
      themePreset: 'bistro-light',
      primaryColor: '#0f172a',
      secondaryColor: '#f8fafc',
      accentColor: '#1e293b',
      backgroundColor: '#fafaf9',
      logoUrl: '',
      backgroundImageUrl: '',
      categories: ['Café', 'Panadería', 'Desayunos', 'Postres'],
      typography: { family: 'serif', titleWeight: 700, baseSize: 'base' },
      hero: {
        variant: 'logo-name',
        tagline: 'Tu pausa perfecta',
        showBadge: true,
        badgeText: 'Menú del día',
      },
      copy: {
        welcomeHeading: 'Bienvenido a',
        welcomeMessage: 'Elegí tu mesa y pedí desde el celular. Te lo llevamos a tu lugar.',
        cartButtonLabel: 'Mi pedido',
        emptyCartMessage: 'Tu carrito está vacío',
        orderNotesPlaceholder: 'Ej: con leche de almendras...',
        submitButtonLabel: 'Confirmar pedido',
        successTitle: '¡Pedido recibido!',
        successMessage: 'Estamos preparando tu pedido. Te avisamos cuando esté listo.',
        productFallbackDescription: 'Una delicia de nuestra cocina.',
      },
      contact: {
        showContactBlock: true,
        whatsappNumber: '+50622334455',
        address: 'Barrio Escalante, San José',
        schedule: 'Lun-Vie 7am-8pm · Sáb-Dom 8am-9pm',
      },
      layout: {
        columns: 3,
        cardStyle: 'compact',
        cardAspectRatio: '4-3',
        categoryNavPosition: 'sticky-top',
        showCategoryBadge: true,
      },
    },
  },
  {
    name: 'Sushi Tokio',
    password: 'sushi1234',
    tables: 10,
    products: [
      { name: 'Roll Filadelfia',     category: 'Rolls',         price: 4800, is_available: true, quick_delivery: false, description: 'Salmón fresco, queso crema y cebollín.',         image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop' },
      { name: 'Roll Dragón',         category: 'Rolls',         price: 5500, is_available: true, quick_delivery: false, description: 'Camarón tempura, aguacate y salsa anguila.',     image_url: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600&h=400&fit=crop' },
      { name: 'Sashimi Salmón',      category: 'Sashimi',       price: 6200, is_available: true, quick_delivery: true,  description: '6 cortes de salmón fresco de Noruega.',          image_url: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=600&h=400&fit=crop' },
      { name: 'Nigiri Atún',         category: 'Nigiri',        price: 5400, is_available: true, quick_delivery: true,  description: '4 piezas de nigiri de atún aleta amarilla.',     image_url: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&h=400&fit=crop' },
      { name: 'Edamame',             category: 'Entradas',      price: 2200, is_available: true, quick_delivery: true,  description: 'Vainas de soja al vapor con sal marina.',         image_url: 'https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9?w=600&h=400&fit=crop' },
      { name: 'Gyoza',               category: 'Entradas',      price: 3200, is_available: true, quick_delivery: false, description: 'Empanaditas japonesas rellenas de cerdo.',        image_url: 'https://images.unsplash.com/photo-1625938144755-652e08e359b7?w=600&h=400&fit=crop' },
      { name: 'Té Matcha',           category: 'Bebidas',       price: 1800, is_available: true, quick_delivery: false, description: 'Té matcha ceremonial con leche de avena.',        image_url: 'https://images.unsplash.com/photo-1545518514-ce8448f542b3?w=600&h=400&fit=crop' },
      { name: 'Sake Caliente',       category: 'Bebidas',       price: 2800, is_available: true, quick_delivery: false, description: 'Sake tradicional servido caliente.',               image_url: 'https://images.unsplash.com/photo-1554304404-d680a16606d6?w=600&h=400&fit=crop' },
      { name: 'Mochi Helado',        category: 'Postres',       price: 3500, is_available: false, quick_delivery: false, description: 'Mochi artesanal de té verde, fresa y mango.',     image_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&h=400&fit=crop' },
    ],
    settings: {
      themePreset: 'elegant-dark',
      primaryColor: '#dc2626',
      secondaryColor: '#fef2f2',
      accentColor: '#7f1d1d',
      backgroundColor: '#0a0a0a',
      logoUrl: '',
      backgroundImageUrl: '',
      categories: ['Rolls', 'Sashimi', 'Nigiri', 'Entradas', 'Bebidas', 'Postres'],
      typography: { family: 'display', titleWeight: 800, baseSize: 'base' },
      hero: {
        variant: 'image-fullbleed',
        tagline: 'Tradición japonesa en cada bocado',
        showBadge: true,
        badgeText: 'Auténtica cocina japonesa',
      },
      copy: {
        welcomeHeading: '¡Bienvenido a',
        welcomeMessage: 'Omakase digital. Elegí tu mesa y pedí al instante.',
        cartButtonLabel: 'Ver pedido',
        emptyCartMessage: 'Tu carrito está vacío',
        orderNotesPlaceholder: 'Ej: sin wasabi, salsa aparte...',
        submitButtonLabel: 'Enviar pedido',
        successTitle: '¡Arigatō!',
        successMessage: 'Tu pedido está en preparación. Te avisamos cuando esté listo.',
        productFallbackDescription: 'Una creación única de nuestro chef.',
      },
      contact: {
        showContactBlock: true,
        whatsappNumber: '+50689991111',
        address: 'Torre Toyota, 2do piso, San José',
        schedule: 'Mar-Dom · 12:00pm - 10:00pm',
      },
      layout: {
        columns: 2,
        cardStyle: 'comfortable',
        cardAspectRatio: '16-9',
        categoryNavPosition: 'sticky-top',
        showCategoryBadge: true,
      },
    },
  },
];

for (const profile of PROFILES) {
  console.log(`\n=== ${profile.name} ===`);

  // 1. Restaurante (idempotente)
  const { data: existing } = await admin.from('restaurants').select('id').eq('name', profile.name).maybeSingle();
  let rid = existing?.id;
  if (rid) {
    console.log(`  Ya existe, actualizando...`);
    const { error: upErr } = await admin.from('restaurants').update({
      general_password: profile.password,
      settings: profile.settings,
      is_active: true,
    }).eq('id', rid);
    check('Actualizar restaurante', !upErr, upErr?.message);
  } else {
    const { data: created, error: insErr } = await admin.from('restaurants').insert({
      name: profile.name,
      general_password: profile.password,
      is_active: true,
      settings: profile.settings,
    }).select('id').single();
    if (insErr) { console.error('  ✗ Error creando:', insErr.message); fail++; continue; }
    rid = created.id;
    check('Crear restaurante', true);
  }

  // 2. Mesas (idempotente)
  const { data: existingT } = await admin.from('restaurant_tables').select('table_number').eq('restaurant_id', rid);
  const existingNums = new Set((existingT || []).map(t => t.table_number));
  const toInsertT = Array.from({ length: profile.tables }, (_, i) => i + 1)
    .filter(n => !existingNums.has(n))
    .map(n => ({ restaurant_id: rid, table_number: n }));
  if (toInsertT.length > 0) {
    const { error: tErr } = await admin.from('restaurant_tables').insert(toInsertT);
    check(`Insertar ${toInsertT.length} mesa(s)`, !tErr, tErr?.message);
  } else {
    console.log('  (mesas ya existen)');
  }

  // 3. Productos (idempotente por nombre)
  const { data: existingP } = await admin.from('products').select('name').eq('restaurant_id', rid);
  const existingNames = new Set((existingP || []).map(p => p.name));
  const toInsertP = profile.products.filter(p => !existingNames.has(p.name))
    .map(p => ({ ...p, restaurant_id: rid }));
  if (toInsertP.length > 0) {
    const { error: pErr } = await admin.from('products').insert(toInsertP);
    check(`Insertar ${toInsertP.length} producto(s)`, !pErr, pErr?.message);
  } else {
    console.log('  (productos ya existen)');
  }

  console.log(`  🏪 ${profile.name} | 🔑 ${profile.password} | 🆔 ${rid}`);
}

console.log(`\n${'═'.repeat(60)}`);
console.log(`  RESULTADO: ${pass} OK / ${fail} FAIL`);
console.log(`${'═'.repeat(60)}\n`);
if (fail > 0) process.exit(1);
