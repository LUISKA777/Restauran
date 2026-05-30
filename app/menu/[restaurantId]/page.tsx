import React from 'react';
import { supabase } from '@/lib/supabase';
import MenuClient from './MenuClient';

export default async function MenuPage({ params }: { params: { restaurantId: string } }) {
  const { restaurantId } = params;

  // 1. Get restaurant info
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('name, settings')
    .eq('id', restaurantId)
    .single();

  if (restaurantError || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4 bg-white p-8 rounded-3xl border border-red-200 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Restaurante no encontrado</h1>
          <p className="text-gray-500">Lo sentimos, no pudimos encontrar la información del restaurante.</p>

          <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100 text-left space-y-2">
            <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Datos de diagnóstico:</p>
            <p className="text-sm font-mono text-red-600 break-all">
              <strong>ID buscado:</strong> {restaurantId}
            </p>
            <p className="text-sm font-mono text-red-600 break-all">
              <strong>Error Supabase:</strong> {restaurantError?.message || 'No hay error, pero no se encontró el dato'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Get all tables for this restaurant
  const { data: tables, error: tablesError } = await supabase
    .from('restaurant_tables')
    .select('id, table_number')
    .eq('restaurant_id', restaurantId);

  if (tablesError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Error al cargar mesas</h1>
          <p className="text-gray-500">No pudimos cargar la lista de mesas disponibles.</p>
        </div>
      </div>
    );
  }

  // 3. Get available products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_available', true);

  if (productsError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Error al cargar menú</h1>
          <p className="text-gray-500">No pudimos obtener la lista de productos.</p>
        </div>
      </div>
    );
  }

  // 4. Group products by category
  const categoriesMap = products.reduce((acc: any, product: any) => {
    const cat = product.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  const categories = Object.keys(categoriesMap);

  return (
    <MenuClient
      restaurantName={restaurant.name}
      settings={restaurant.settings}
      products={products}
      categories={categories}
      categoriesMap={categoriesMap}
      restaurantId={restaurantId}
      tables={tables || []}
    />
  );
}
