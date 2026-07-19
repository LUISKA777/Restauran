"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  Search,
  Receipt,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface Order {
  id: string;
  total_price: number;
  status: string;
  customer_name: string;
  restaurant_tables: { table_number: number } | null;
  order_items: {
    product_id: string;
    quantity: number;
    products: { name: string; price: number };
  }[];
}

export default function InvoicesPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'SINPE' | 'Card'>('Cash');
  const [cashReceived, setCashReceived] = useState('');
  const [sinpeId, setSinpeId] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    setLoading(true);
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) return;

    const { data, error } = await supabase
      .from('orders')
      .select(`*, restaurant_tables(table_number), order_items(product_id, quantity, products(name, price))`)
      .eq('restaurant_id', restaurantId)
      .eq('is_paid', false)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: true });

    if (error) console.error('Error fetching invoices:', error);
    else setOrders(data || []);
    setLoading(false);
  }

  async function processPayment() {
    if (!selectedOrder) return;

    const { error } = await supabaseAdmin
      .from('orders')
      .update({
        is_paid: true,
        payment_method: paymentMethod,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedOrder.id);

    if (error) {
      console.error('[processPayment] error:', error);
      alert(`Error al procesar el pago: ${error.message}`);
      return;
    }

    alert('Pago procesado con éxito');
    setIsPaymentModalOpen(false);
    setSelectedOrder(null);
    setCashReceived('');
    setSinpeId('');
    fetchInvoices();
  }

  const filteredOrders = orders.filter(o =>
    (o.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.restaurant_tables?.table_number?.toString() || '').includes(searchQuery)
  );

  const calculateChange = () => {
    if (!selectedOrder) return 0;
    const received = Math.round((parseFloat(cashReceived) || 0) * 100) / 100;
    const total = Math.round((parseFloat(selectedOrder.total_price.toString()) || 0) * 100) / 100;
    return received - total;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-sm text-ink-500 font-medium">Cargando facturas...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 lg:p-10 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-ink-100 rounded-xl transition-colors text-ink-600">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-bold mb-2">
              <Receipt size={12} /> Cuentas
            </div>
            <h1 className="text-3xl font-black text-ink-900 tracking-tight">Facturas Pendientes</h1>
            <p className="text-ink-500 mt-1">{filteredOrders.length} cuentas por cobrar</p>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters */}
        <div className="w-full lg:w-80 space-y-4 animate-slide-up">
          <div className="card p-5 space-y-3 sticky top-6">
            <label className="text-sm font-bold text-ink-700 flex items-center gap-2">
              <Search size={14} /> Buscar Cuenta
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              placeholder="Mesa o cliente..."
            />
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-ink-100">
              <div className="p-2 bg-brand-50 rounded-xl text-center">
                <p className="text-2xl font-black text-brand-700">{filteredOrders.length}</p>
                <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">Cuentas</p>
              </div>
              <div className="p-2 bg-ink-50 rounded-xl text-center">
                <p className="text-lg font-black text-ink-900">
                  ₡{filteredOrders.reduce((a, o) => a + o.total_price, 0).toFixed(0)}
                </p>
                <p className="text-[10px] font-bold text-ink-500 uppercase tracking-wider">Por cobrar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="flex-grow">
          {filteredOrders.length === 0 ? (
            <div className="card p-20 text-center animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={28} className="text-emerald-500" />
              </div>
              <p className="text-lg font-bold text-ink-900">¡Todo cobrado!</p>
              <p className="text-ink-500 mt-1">No hay facturas pendientes en este momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order, idx) => (
                <div
                  key={order.id}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className="card-hover p-5 group animate-slide-up opacity-0"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="min-w-0 flex-1">
                      <span className="badge-brand mb-1">
                        {order.restaurant_tables ? `Mesa ${order.restaurant_tables.table_number}` : '🥡 Para Llevar'}
                      </span>
                      <h3 className="text-lg font-bold text-ink-900 truncate">{order.customer_name || 'Anónimo'}</h3>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-xl font-black text-ink-900">₡{order.total_price.toFixed(0)}</p>
                      <span className="badge bg-ink-100 text-ink-600 mt-1">{order.status}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-5 max-h-40 overflow-y-auto pr-1">
                    {order.order_items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs text-ink-600 py-1 border-b border-ink-50 last:border-0">
                        <span className="font-medium">{item.quantity}x {item.products?.name}</span>
                        <span className="font-bold text-ink-700">₡{(item.products?.price * item.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsPaymentModalOpen(true);
                    }}
                    className="w-full py-2.5 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-glow-brand transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CreditCard size={16} /> Procesar Pago
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsPaymentModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-ink-100 flex items-center justify-between bg-ink-50/50">
              <h2 className="text-lg font-black text-ink-900 flex items-center gap-2">
                <span className="p-1.5 bg-brand-100 text-brand-600 rounded-lg">
                  <Receipt size={16} />
                </span>
                Cobrar Cuenta
              </h2>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-1.5 hover:bg-ink-200 rounded-lg transition-colors text-ink-500">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="flex justify-between items-center p-4 bg-gradient-brand text-white rounded-2xl shadow-glow-brand">
                <span className="font-bold">Total a Cobrar:</span>
                <span className="text-2xl font-black">₡{selectedOrder.total_price.toFixed(0)}</span>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-ink-700">Método de Pago</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'Cash', icon: Banknote, label: 'Efectivo' },
                    { id: 'SINPE', icon: Smartphone, label: 'SINPE' },
                    { id: 'Card', icon: CreditCard, label: 'Tarjeta' },
                  ].map(method => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                          paymentMethod === method.id
                          ? 'border-brand-500 bg-brand-50 text-brand-600'
                          : 'border-ink-200 bg-white text-ink-400 hover:border-ink-300'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="text-xs font-bold">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {paymentMethod === 'Cash' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-ink-700">Monto Recibido (₡)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        className="input flex-grow text-lg font-bold"
                        placeholder="0.00"
                      />
                      <button
                        onClick={() => setCashReceived(selectedOrder.total_price.toString())}
                        className="btn-secondary text-xs"
                      >
                        Exacto
                      </button>
                    </div>
                  </div>
                  {cashReceived && (
                    <div className={`p-3 rounded-xl border font-bold flex justify-between items-center ${
                      calculateChange() >= 0
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}>
                      <span>Vuelto:</span>
                      <span>₡{Math.floor(calculateChange()).toFixed(0)}</span>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'SINPE' && (
                <div className="space-y-3 animate-fade-in">
                  <label className="text-sm font-bold text-ink-700">ID de Transacción / Comprobante</label>
                  <input
                    type="text"
                    value={sinpeId}
                    onChange={(e) => setSinpeId(e.target.value)}
                    className="input"
                    placeholder="Ingresar código de SINPE"
                  />
                </div>
              )}

              {paymentMethod === 'Card' && (
                <div className="p-4 bg-sky-50 text-sky-700 rounded-xl border border-sky-100 text-sm font-medium flex items-center gap-2">
                  <CheckCircle size={16} /> Verifique la transacción en el terminal de tarjeta.
                </div>
              )}
            </div>

            <div className="p-5 border-t border-ink-100 flex gap-3 bg-ink-50/30">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={processPayment}
                disabled={paymentMethod === 'Cash' && (!cashReceived || calculateChange() < 0)}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                <CheckCircle size={18} /> Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
