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
  Tag,
  Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
  quick_delivery: boolean;
  // sort_order: number;  ← NO existe en la tabla products, lo omitimos
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  image_url: string;
  is_available: boolean;
  quick_delivery: boolean;
}

const EMPTY_FORM: ProductFormData = {
  name: '',
  description: '',
  price: '',
  category: 'General',
  image_url: '',
  is_available: true,
  quick_delivery: false,
};

export default function AdminMenuPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) {
      console.error('[fetchProducts] No restaurant ID in localStorage');
      setLoading(false);
      return;
    }

    // SELECT puede usar anon (RLS permite leer productos disponibles).
    // Si quisiéramos ver no-disponibles también, habría que usar admin.
    const [productsRes, settingsRes] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .eq('restaurant_id', restaurantId),
      supabase
        .from('restaurants')
        .select('settings')
        .eq('id', restaurantId)
        .single()
    ]);

    if (productsRes.error) {
      console.error('[fetchProducts] products error:', productsRes.error);
      alert(`Error al cargar productos: ${productsRes.error.message}`);
    } else {
      // Ordenar por created_at desc en cliente (la columna sort_order no existe
      // todavía en la tabla products). Cuando se agregue, podemos volver a
      // ordenar en el servidor.
      const sorted = (productsRes.data || []).slice().sort((a: any, b: any) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      });
      setProducts(sorted);
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
        quick_delivery: product.quick_delivery || false,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        ...EMPTY_FORM,
        category: categoriesList[0] || 'General',
      });
    }
    setIsModalOpen(true);
  };

  async function toggleAvailability(product: Product) {
    const { error } = await supabaseAdmin
      .from('products')
      .update({ is_available: !product.is_available })
      .eq('id', product.id);

    if (error) {
      console.error('[toggleAvailability] error:', error);
      alert(`Error: ${error.message}`);
      return;
    }
    await fetchProducts();
  }

  async function handleSaveProduct() {
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) {
      alert('No hay sesión activa. Vuelve a iniciar sesión.');
      return;
    }

    if (!formData.name.trim()) {
      alert('El nombre del producto es obligatorio.');
      return;
    }
    const priceNum = parseFloat(formData.price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      alert('El precio debe ser un número válido.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: priceNum,
      category: formData.category.trim() || 'General',
      image_url: formData.image_url.trim(),
      is_available: formData.is_available,
      quick_delivery: formData.quick_delivery,
      restaurant_id: restaurantId,
    };

    try {
      if (editingProduct) {
        const { error } = await supabaseAdmin
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabaseAdmin
          .from('products')
          .insert([payload]);
        if (error) throw error;
      }

      await fetchProducts();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('[handleSaveProduct] error:', err);
      alert(`Error al guardar: ${err?.message || 'Error desconocido'}\n\nCódigo: ${err?.code || 'N/A'}`);
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[handleDeleteProduct] error:', error);
      alert(`Error al eliminar: ${error.message}`);
      return;
    }
    await fetchProducts();
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
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-sm text-ink-500 font-medium">Cargando menú...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-ink-100 rounded-xl transition-colors text-ink-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-bold mb-2">
              <Utensils size={12} /> Catálogo
            </div>
            <h1 className="text-3xl font-black text-ink-900 tracking-tight">Menú de Productos</h1>
            <p className="text-ink-500 mt-1">{filteredProducts.length} productos visibles</p>
          </div>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus size={20} /> Agregar Producto
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="xl:col-span-1 space-y-4 animate-slide-up">
          <div className="card p-5 space-y-4 sticky top-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-ink-700 flex items-center gap-2">
                <Search size={14} /> Buscar
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
                placeholder="Nombre o descripción..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-ink-700 flex items-center gap-2">
                <Filter size={14} /> Categoría
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-ink-100 grid grid-cols-2 gap-2 text-center">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <p className="text-2xl font-black text-emerald-700">
                  {products.filter(p => p.is_available).length}
                </p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Disponibles</p>
              </div>
              <div className="p-2 bg-rose-50 rounded-xl">
                <p className="text-2xl font-black text-rose-700">
                  {products.filter(p => !p.is_available).length}
                </p>
                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Agotados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="xl:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="card p-20 text-center space-y-3 animate-fade-in">
              <div className="w-16 h-16 bg-ink-100 rounded-2xl flex items-center justify-center mx-auto">
                <Package size={28} className="text-ink-400" />
              </div>
              <h3 className="text-xl font-bold text-ink-900">No hay productos</h3>
              <p className="text-ink-500">Empieza agregando tu primer producto al menú.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((product, idx) => (
                <div
                  key={product.id}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className={`card-hover p-4 flex items-center gap-4 group animate-slide-up opacity-0 ${
                    !product.is_available ? 'opacity-60 grayscale' : ''
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-ink-100 overflow-hidden flex-shrink-0 border border-ink-200">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-400 text-[10px] p-1 text-center font-medium">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-ink-900 truncate">{product.name}</h3>
                      <span className={`badge shrink-0 ${
                        product.is_available ? 'badge-success' : 'badge-danger'
                      }`}>
                        {product.is_available ? 'Disponible' : 'Agotado'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="badge-brand">{product.category || 'General'}</span>
                      {product.quick_delivery && (
                        <span className="badge bg-amber-100 text-amber-700">
                          <Zap size={10} /> Rápido
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-black text-ink-900">₡{product.price.toFixed(0)}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="p-2 text-ink-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all active:scale-90"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-ink-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-90"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-ink-100 flex items-center justify-between bg-ink-50/50">
              <h2 className="text-lg font-black text-ink-900 flex items-center gap-2">
                <span className="p-1.5 bg-brand-100 text-brand-600 rounded-lg">
                  {editingProduct ? <Pencil size={16} /> : <Plus size={16} />}
                </span>
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-ink-200 rounded-lg transition-colors text-ink-500">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                <label className="text-sm font-bold text-ink-700 flex items-center gap-2">
                  <Package size={14} /> Nombre del Plato *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Ej: Hamburguesa Deluxe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-ink-700 flex items-center gap-2">
                    <Tag size={14} /> Categoría
                  </label>
                  <input
                    type="text"
                    list="categories-list"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                    placeholder="Ej: Platos Fuertes"
                  />
                  <datalist id="categories-list">
                    {categoriesList.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-ink-700 flex items-center gap-2">
                    <DollarSign size={14} /> Precio (₡) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-ink-700 flex items-center gap-2">
                  <ImageIcon size={14} /> URL de Imagen
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="input"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-ink-700">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input h-24 resize-none"
                  placeholder="Describe los ingredientes y el sabor..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-3 p-3 bg-ink-50 rounded-xl border border-ink-200 cursor-pointer hover:border-emerald-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500"
                  />
                  <span className="text-sm font-bold text-ink-700">Disponible</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-ink-50 rounded-xl border border-ink-200 cursor-pointer hover:border-amber-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.quick_delivery}
                    onChange={(e) => setFormData({ ...formData, quick_delivery: e.target.checked })}
                    className="w-5 h-5 accent-amber-500"
                  />
                  <span className="text-sm font-bold text-ink-700">Entrega rápida</span>
                </label>
              </div>
            </div>

            <div className="p-5 border-t border-ink-100 flex gap-3 bg-ink-50/30">
              <button onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button onClick={handleSaveProduct} className="btn-primary flex-1">
                <Save size={18} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
