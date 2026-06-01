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
      .neq('status', 'paid')
      .neq('status', 'cancelled')
      .order('created_at', { ascending: true });

    if (error) console.error('Error fetching invoices:', error);
    else setOrders(data || []);
    setLoading(false);
  }

  async function processPayment() {
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_method: paymentMethod,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      alert('Pago procesado con éxito');
      setIsPaymentModalOpen(false);
      setSelectedOrder(null);
      setCashReceived('');
      setSinpeId('');
      fetchInvoices();
    } catch (err) {
      console.error('Error processing payment:', err);
      alert('Error al procesar el pago');
    }
  }

  const filteredOrders = orders.filter(o =>
    (o.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.restaurant_tables?.table_number?.toString() || '').includes(searchQuery)
  );

  const calculateChange = () => {
    if (!selectedOrder) return 0;
    const received = parseFloat(cashReceived) || 0;
    const total = parseFloat(selectedOrder.total_price.toString()) || 0;
    return received - total;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando facturas...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Receipt className="text-orange-500" /> Facturas Pendientes
          </h1>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Search size={16} /> Buscar Cuenta
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder="Mesa o cliente..."
              />
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="flex-grow space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white p-20 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
              <p className="text-slate-500 text-lg">No hay facturas pendientes en este momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-orange-500 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-bold uppercase text-slate-400">
                        {order.restaurant_tables ? `Mesa ${order.restaurant_tables.table_number}` : 'Para Llevar'}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900">{order.customer_name || 'Anónimo'}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-slate-900">₡{order.total_price.toFixed(0)}</p>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6 max-h-40 overflow-y-auto pr-2">
                    {order.order_items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-600 border-b border-slate-50 pb-1">
                        <span>{item.quantity}x {item.products?.name}</span>
                        <span className="font-medium">₡{(item.products?.price * item.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsPaymentModalOpen(true);
                    }}
                    className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-100"
                  >
                    <CreditCard size={18} /> Procesar Pago
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Receipt size={20} className="text-orange-500" /> Cobrar Cuenta
              </h2>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 font-medium">Total a Cobrar:</span>
                <span className="text-2xl font-black text-slate-900">₡{selectedOrder.total_price.toFixed(0)}</span>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">Método de Pago</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'Cash', icon: <Banknote size={20} />, label: 'Efectivo' },
                    { id: 'SINPE', icon: <Smartphone size={20} />, label: 'SINPE' },
                    { id: 'Card', icon: <CreditCard size={20} />, label: 'Tarjeta' },
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        paymentMethod === method.id
                        ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-inner'
                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {method.icon}
                      <span className="text-xs font-bold">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'Cash' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Monto Recibido (₡)</label>
                    <input
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-lg font-bold"
                      placeholder="0.00"
                    />
                  </div>
                  {cashReceived && (
                    <div className={`p-3 rounded-xl border ${calculateChange() >= 0 ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                      <div className="flex justify-between items-center font-bold">
                        <span>Vuelto:</span>
                        <span>₡{calculateChange().toFixed(0)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'SINPE' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">ID de Transacción / Comprobante</label>
                    <input
                      type="text"
                      value={sinpeId}
                      onChange={(e) => setSinpeId(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Ingresar código de SINPE"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'Card' && (
                <div className="p-4 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 text-sm font-medium flex items-center gap-2">
                  <CheckCircle size={16} /> Verifique la transacción en el terminal de tarjeta.
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={processPayment}
                disabled={paymentMethod === 'Cash' && (!cashReceived || calculateChange() < 0)}
                className="flex-1 px-4 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200 disabled:opacity-50"
              >
                <CheckCircle size={20} /> Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
