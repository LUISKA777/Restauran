"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  Search,
  Receipt,
  X,
  Printer,
  Download
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { useRestaurantSettings } from '@/lib/useRestaurantSettings';

// Helpers: la tabla `orders` no tiene `is_takeaway` ni `people_count`.
// El mesero codifica esos datos como prefijo en `customer_name`:
//   "🥡 2x · Juan" → takeaway=true, 2 personas, nombre "Juan"
function isTakeawayOrder(order: any): boolean {
  return (order?.customer_name || '').startsWith('🥡');
}
function peopleCountFromName(order: any): number {
  const m = (order?.customer_name || '').match(/^(\d+)x · /);
  return m ? parseInt(m[1], 10) : 1;
}
function cleanCustomerName(order: any): string {
  return (order?.customer_name || '')
    .replace(/^🥡\s*/, '')
    .replace(/^\d+x · /, '')
    .trim() || 'Anónimo';
}

interface Order {
  id: string;
  total_price: number;
  status: string;
  customer_name: string;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
  restaurant_tables: { table_number: number } | null;
  order_items: {
    product_id: string;
    quantity: number;
    notes?: string;
    products: { name: string; price: number };
  }[];
}

interface RestaurantInfo {
  id: string;
  name: string;
  settings: { logoUrl?: string; contact?: { address?: string; schedule?: string; whatsappNumber?: string } } | null;
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

  // Datos del local para la factura (vía hook compartido)
  const { settings } = useRestaurantSettings();
  const [restaurantName, setRestaurantName] = useState('');

  useEffect(() => {
    // El nombre del local se lee una vez (no cambia en la sesión).
    // Los settings sí pueden cambiar, los maneja el hook.
    (async () => {
      const id = localStorage.getItem('restaurant_id');
      if (!id) return;
      const { data } = await supabaseAdmin.from('restaurants').select('name').eq('id', id).single();
      if (data?.name) setRestaurantName(data.name);
    })();
  }, []);

  const restaurant: RestaurantInfo | null = {
    id: '',
    name: restaurantName,
    settings: {
      logoUrl: settings?.logoUrl || '',
      contact: settings?.contact,
    },
  };

  // Recién pagada (para mostrar la factura)
  const [paidOrder, setPaidOrder] = useState<{
    order: Order;
    paymentMethod: string;
    cashReceived: number;
    change: number;
  } | null>(null);

  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    setLoading(true);
    const restaurantId = localStorage.getItem('restaurant_id');
    if (!restaurantId) return;

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`*, restaurant_tables(table_number), order_items(product_id, quantity, notes, products(name, price))`)
      .eq('restaurant_id', restaurantId)
      .eq('status', 'delivered')
      .is('payment_method', null)
      .order('created_at', { ascending: true });

    if (error) console.error('Error fetching invoices:', error);
    else setOrders(data || []);
    setLoading(false);
  }

  async function processPayment() {
    if (!selectedOrder) return;

    const total = parseFloat(selectedOrder.total_price.toString()) || 0;
    const cash = parseFloat(cashReceived) || 0;
    const change = paymentMethod === 'Cash' ? Math.max(0, cash - total) : 0;

    const { error } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'paid',
        payment_method: paymentMethod,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedOrder.id);

    if (error) {
      console.error('[processPayment] error:', error);
      alert(`Error al procesar el pago: ${error.message}`);
      return;
    }

    // Mostrar la factura recién pagada
    setPaidOrder({
      order: { ...selectedOrder, status: 'paid', payment_method: paymentMethod },
      paymentMethod,
      cashReceived: paymentMethod === 'Cash' ? cash : total,
      change,
    });
    setIsPaymentModalOpen(false);
    setSelectedOrder(null);
    setCashReceived('');
    setSinpeId('');
    fetchInvoices();
  }

  function printInvoice() {
    window.print();
  }

  function downloadInvoice() {
    // Genera un HTML imprimible y lo descarga como PDF vía print-to-PDF del navegador
    if (!invoiceRef.current) return;
    const printContents = invoiceRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert('Permití pop-ups para descargar la factura');
      return;
    }
    const styles = `
      <style>
        * { box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; padding: 24px; max-width: 320px; margin: 0 auto; color: #000; }
        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 12px; margin-bottom: 12px; }
        .header h1 { font-size: 18px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px; }
        .header img { max-width: 80px; max-height: 80px; margin: 0 auto 8px; display: block; }
        .header p { margin: 2px 0; font-size: 11px; }
        .meta { font-size: 11px; margin-bottom: 12px; }
        .meta div { display: flex; justify-content: space-between; }
        .items { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .items th { font-size: 10px; text-align: left; padding: 4px 0; border-bottom: 1px solid #000; text-transform: uppercase; }
        .items td { font-size: 12px; padding: 3px 0; vertical-align: top; }
        .items td.qty { width: 30px; }
        .items td.price { text-align: right; white-space: nowrap; }
        .items .notes { font-size: 10px; font-style: italic; color: #555; display: block; }
        .totals { border-top: 2px dashed #000; padding-top: 8px; font-size: 12px; }
        .totals .row { display: flex; justify-content: space-between; padding: 2px 0; }
        .totals .grand { font-size: 16px; font-weight: bold; border-top: 1px solid #000; padding-top: 6px; margin-top: 6px; }
        .footer { text-align: center; margin-top: 16px; font-size: 11px; border-top: 2px dashed #000; padding-top: 12px; }
        .barcode { font-family: 'Libre Barcode 39', monospace; font-size: 32px; text-align: center; margin: 8px 0; }
      </style>
    `;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Factura</title>
          ${styles}
        </head>
        <body>${printContents}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 300);
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
    <>
      {/* === Estilos print === */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen p-6 lg:p-10 max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in no-print">
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

        <div className="flex flex-col lg:flex-row gap-6 no-print">
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
                        <h3 className="text-lg font-bold text-ink-900 truncate">{cleanCustomerName(order)}</h3>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fade-in no-print"
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

        {/* ═══ FACTURA POST-PAGO ═══ */}
        {paidOrder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setPaidOrder(null)}
          >
            <div
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-ink-100 flex items-center justify-between bg-emerald-50/50">
                <h2 className="text-lg font-black text-emerald-700 flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                    <CheckCircle size={16} />
                  </span>
                  ¡Pago Procesado!
                </h2>
                <button onClick={() => setPaidOrder(null)} className="p-1.5 hover:bg-ink-200 rounded-lg transition-colors text-ink-500">
                  <X size={18} />
                </button>
              </div>

              {/* Vista de la factura (también se imprime) */}
              <div ref={invoiceRef} className="print-area p-6 overflow-y-auto flex-1 bg-white" style={{ fontFamily: "'Courier New', monospace" }}>
                <InvoiceContent
                  order={paidOrder.order}
                  paymentMethod={paidOrder.paymentMethod}
                  cashReceived={paidOrder.cashReceived}
                  change={paidOrder.change}
                  restaurant={restaurant}
                />
              </div>

              <div className="p-5 border-t border-ink-100 flex gap-3 bg-ink-50/30 no-print">
                <button
                  onClick={() => setPaidOrder(null)}
                  className="btn-secondary flex-1"
                >
                  Cerrar
                </button>
                <button onClick={printInvoice} className="btn-primary flex-1">
                  <Printer size={16} /> Imprimir
                </button>
                <button onClick={downloadInvoice} className="btn-primary flex-1">
                  <Download size={16} /> PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════
// Componente que renderiza el contenido de la factura
// (también se usa dentro del iframe de download)
// ══════════════════════════════════════════════════════════

function InvoiceContent({
  order,
  paymentMethod,
  cashReceived,
  change,
  restaurant,
}: {
  order: Order;
  paymentMethod: string;
  cashReceived: number;
  change: number;
  restaurant: RestaurantInfo | null;
}) {
  const total = parseFloat(order.total_price.toString()) || 0;
  const isTakeaway = isTakeawayOrder(order);
  const people = peopleCountFromName(order);
  const customer = cleanCustomerName(order);
  const date = new Date(order.updated_at || order.created_at);
  const logoUrl = restaurant?.settings?.logoUrl;
  const address = restaurant?.settings?.contact?.address;
  const schedule = restaurant?.settings?.contact?.schedule;
  const phone = restaurant?.settings?.contact?.whatsappNumber;

  const methodLabel: Record<string, string> = {
    Cash: 'Efectivo',
    SINPE: 'SINPE',
    Card: 'Tarjeta',
  };

  return (
    <div className="text-ink-900 text-sm">
      {/* Header con logo */}
      <div className="text-center border-b-2 border-dashed border-ink-300 pb-3 mb-3">
        {logoUrl ? (
          <img src={logoUrl} alt={restaurant?.name} className="w-20 h-20 mx-auto mb-2 rounded-xl object-cover" />
        ) : (
          <div className="w-20 h-20 mx-auto mb-2 rounded-xl bg-ink-100 flex items-center justify-center text-2xl font-black text-ink-700">
            {restaurant?.name?.charAt(0).toUpperCase() || 'R'}
          </div>
        )}
        <h1 className="text-base font-black uppercase tracking-wider">{restaurant?.name || 'Restaurante'}</h1>
        {address && <p className="text-[10px] text-ink-500 mt-0.5">{address}</p>}
        {phone && <p className="text-[10px] text-ink-500">Tel: {phone}</p>}
        {schedule && <p className="text-[10px] text-ink-500">{schedule}</p>}
      </div>

      {/* Meta: tipo, mesa, cliente, fecha, factura # */}
      <div className="space-y-0.5 mb-3 text-[11px]">
        <div className="flex justify-between">
          <span className="text-ink-500">Factura #:</span>
          <span className="font-bold">{order.id.slice(0, 8).toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-500">Fecha:</span>
          <span className="font-bold">{date.toLocaleString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-500">Tipo:</span>
          <span className="font-bold">{isTakeaway ? '🥡 Para Llevar' : 'Mesa'}</span>
        </div>
        {!isTakeaway && (
          <div className="flex justify-between">
            <span className="text-ink-500">Mesa:</span>
            <span className="font-bold">{order.restaurant_tables?.table_number || 'N/A'}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-ink-500">Cliente:</span>
          <span className="font-bold">{customer}</span>
        </div>
        {people > 1 && (
          <div className="flex justify-between">
            <span className="text-ink-500">Personas:</span>
            <span className="font-bold">{people}</span>
          </div>
        )}
      </div>

      {/* Items */}
      <table className="w-full border-collapse mb-3">
        <thead>
          <tr className="border-b border-ink-300">
            <th className="text-left text-[10px] font-bold uppercase py-1 w-6">#</th>
            <th className="text-left text-[10px] font-bold uppercase py-1">Producto</th>
            <th className="text-right text-[10px] font-bold uppercase py-1">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.order_items?.map((item, idx) => (
            <tr key={idx} className="border-b border-ink-100">
              <td className="py-1.5 text-[11px] font-bold align-top">{item.quantity}</td>
              <td className="py-1.5 text-[11px] align-top">
                <div className="font-bold">{item.products?.name}</div>
                <div className="text-[10px] text-ink-500">₡{(item.products?.price || 0).toFixed(0)} c/u</div>
                {item.notes && <div className="text-[10px] italic text-ink-500 mt-0.5">Nota: {item.notes}</div>}
              </td>
              <td className="py-1.5 text-[11px] font-bold text-right align-top whitespace-nowrap">
                ₡{((item.products?.price || 0) * item.quantity).toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totales */}
      <div className="border-t-2 border-dashed border-ink-300 pt-2 space-y-1 text-[12px]">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₡{total.toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-base font-black border-t border-ink-300 pt-1.5 mt-1.5">
          <span>TOTAL:</span>
          <span>₡{total.toFixed(0)}</span>
        </div>

        <div className="border-t border-dashed border-ink-300 mt-2 pt-2 space-y-0.5">
          <div className="flex justify-between">
            <span className="text-ink-600">Método de pago:</span>
            <span className="font-bold">{methodLabel[paymentMethod] || paymentMethod}</span>
          </div>
          {paymentMethod === 'Cash' && (
            <>
              <div className="flex justify-between">
                <span className="text-ink-600">Recibido:</span>
                <span className="font-bold">₡{cashReceived.toFixed(0)}</span>
              </div>
              {change > 0 && (
                <div className="flex justify-between text-emerald-700 font-black text-base">
                  <span>VUELTO:</span>
                  <span>₡{change.toFixed(0)}</span>
                </div>
              )}
            </>
          )}
          {paymentMethod === 'SINPE' && (
            <div className="flex justify-between">
              <span className="text-ink-600">Comprobante:</span>
              <span className="font-mono text-[10px]">{(order as any).sinpe_id || 'N/A'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-4 pt-3 border-t-2 border-dashed border-ink-300 text-[10px] text-ink-500">
        <p className="font-bold text-ink-700">¡Gracias por su visita!</p>
        <p className="mt-0.5">Conserve este comprobante</p>
        <p className="mt-2 font-mono text-[9px] text-ink-400">{order.id}</p>
      </div>
    </div>
  );
}
