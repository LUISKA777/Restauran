import React from 'react';
import { supabase } from '@/lib/supabase';
import MenuClient from './MenuClient';

export default async function MenuPage({ params }: { params: { token: string } }) {
  const { token } = params;

  // 1. Resolve token to get table and restaurant info
  const { data: tableData, error: tableError } = await supabase
    .from('restaurant_tables')
    .select(`
      id,
      restaurant_id,
      restaurants (
        name,
        settings
      )
    `)
    .eq('qr_code_token', token)
    .single();

  if (tableError || !tableData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Mesa no encontrada</h1>
          <p className="text-gray-500">Lo sentimos, el código QR no es válido o la mesa no está registrada.</p>
        </div>
      </div>
    );
  }

  const restaurant = Array.isArray(tableData.restaurants)
    ? tableData.restaurants[0]
    : tableData.restaurants;
  const restaurantId = tableData.restaurant_id;
  const tableId = tableData.id;

  // 2. Get available products
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
          <p className="text-gray-500">No pudimos obtener la lista de productos. Por favor, intenta de nuevo más tarde.</p>
        </div>
      </div>
    );
  }

  // 3. Group products by category
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
      tableId={tableId}
    />
  );
}
