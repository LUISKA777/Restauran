"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Utensils,
  Pencil,
  Trash2,
  Save,
  X,
  Search,
  Filter,
  Package,
  Image as ImageIcon,
  DollarSign,
  Tag
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
  quick_delivery: boolean;
}

export default function AdminMenuPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    is_available: true,
    quick_delivery: false
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) {
      console.error("No restaurant ID found in localStorage");
      setLoading(false);
      return;
    }

    // Fetch both products and restaurant settings (for categories)
    const [productsRes, settingsRes] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('name', { ascending: true }),
      supabase
        .from('restaurants')
        .select('settings')
        .eq('id', restaurantId)
        .single()
    ]);

    if (productsRes.error) {
      console.error('Error fetching products:', productsRes.error);
    } else {
      setProducts(productsRes.data || []);
    }

    if (settingsRes.data?.settings?.categories) {
      setCategoriesList(settingsRes.data.settings.categories);
    }

    setLoading(false);
  }

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        category: product.category || 'General',
        image_url: product.image_url || '',
        is_available: product.is_available,
        quick_delivery: product.quick_delivery || false
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: categoriesList[0] || 'General',
        image_url: '',
        is_available: true,
        quick_delivery: false
      });
    }
    setIsModalOpen(true);
  };

  async function toggleAvailability(product: Product) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_available: !product.is_available })
        .eq('id', product.id);
      if (error) throw error;
      await fetchProducts();
    } catch (err) {
      console.error('Error toggling availability:', err);
    }
  }

  async function handleSaveProduct() {
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) return;

    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      image_url: formData.image_url,
      is_available: formData.is_available,
      quick_delivery: formData.quick_delivery,
      restaurant_id: restaurantId
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([payload]);
        if (error) throw error;
      }

      await fetchProducts();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Error al guardar el producto');
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Error al eliminar el producto');
    }
  }

  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => cats.add(p.category || 'General'));
    return ['All', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Cargando menú de productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Utensils className="text-orange-500" /> Menú de Productos
          </h1>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 active:scale-95"
        >
          <Plus size={20} /> Agregar Producto
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Search size={16} /> Buscar producto
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder="Nombre o descripción..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Filter size={16} /> Categoría
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="xl:col-span-3 space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="bg-white p-20 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
              <Package size={48} className="mx-auto text-slate-300" />
              <h3 className="text-xl font-bold text-slate-800">No se encontraron productos</h3>
              <p className="text-slate-500">Intenta ajustar los filtros o agregar un nuevo producto al menú.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className={`bg-white p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group ${
                    product.is_available ? 'border-slate-100 hover:border-orange-500' : 'border-red-100 bg-red-50/30 opacity-75'
                  }`}
                >
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs p-2 text-center">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <div className="flex-grow space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900">{product.name}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        product.is_available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {product.is_available ? 'Disponible' : 'Agotado'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md">{product.category || 'General'}</span>
                      <span>•</span>
                      <span className="font-bold text-slate-700">₡{product.price.toFixed(0)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {editingProduct ? <Pencil size={20} /> : <Plus size={20} />}
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Package size={16} /> Nombre del Plato
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  placeholder="Ej: Hamburguesa Deluxe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Tag size={16} /> Categoría
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  placeholder="Ej: Platos Fuertes, Bebidas..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <DollarSign size={16} /> Precio (₡)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <ImageIcon size={16} /> URL de Imagen (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all h-24 resize-none"
                  placeholder="Describe los ingredientes y el sabor..."
                />
              </div>

              <div className="flex flex-col gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="w-5 h-5 accent-orange-500"
                  />
                  <label htmlFor="is_available" className="text-sm font-bold text-slate-700 cursor-pointer">
                    Disponible para la venta
                  </label>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100">
                  <input
                    type="checkbox"
                    id="quick_delivery"
                    checked={formData.quick_delivery}
                    onChange={(e) => setFormData({ ...formData, quick_delivery: e.target.checked })}
                    className="w-5 h-5 accent-orange-500"
                  />
                  <label htmlFor="quick_delivery" className="text-sm font-bold text-slate-700 cursor-pointer">
                    Entrega rápida (no va a cocina)
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProduct}
                className="flex-1 px-4 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
              >
                <Save size={20} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
