import React from 'react';
import { useStore } from '../store/useStore';
import { Order } from '../types';
import { PageHeader } from './PageHeader';
import { getStatusColor, cn, formatDate } from '../lib/utils';
import { PackageSearch, CheckCircle2, Image as ImageIcon, CheckSquare } from 'lucide-react';

export function SeparationMode() {
  const { orders, updateOrder } = useStore();
  
  // Show orders that are not yet separated, packed, posted, or finished
  const pendingOrders = orders.filter(o => 
    ['Novo pedido', 'Em produção', 'Produto pronto'].includes(o.status)
  ).sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());

  const handleSeparate = (order: Order) => {
    updateOrder(order.id, { status: 'Separado' });
  };
  
  const handleCheck = (order: Order, key: keyof Order['checklist']) => {
    updateOrder(order.id, {
      checklist: {
        ...order.checklist,
        [key]: !order.checklist?.[key]
      }
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pb-24 animate-in fade-in">
      <PageHeader 
        title="Modo Separação" 
        description="Foque apenas nos pedidos que precisam ser separados do estoque ou produzidos."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {pendingOrders.length === 0 ? (
          <div className="col-span-full py-16 text-center text-stone-500 bg-white theme-card rounded-3xl border border-stone-100 shadow-sm">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <PackageSearch className="w-10 h-10 text-stone-300" />
            </div>
            <p className="text-xl font-serif text-stone-800 mb-1">Nenhum pedido para separar.</p>
            <p className="text-stone-500 font-medium">Tudo em dia por aqui!</p>
          </div>
        ) : (
          pendingOrders.map(order => {
            const mainImage = order.images?.find(i => i.is_main) || order.images?.[0];
            const chk = order.checklist || {};
            
            return (
            <div key={order.id} className="bg-white theme-card rounded-3xl border border-stone-100 shadow-sm flex flex-col group overflow-hidden hover:shadow-md transition-shadow">
              
              {/* Top part with image */}
              <div className="bg-stone-50 border-b border-stone-100 p-4 flex gap-4 min-h-[140px]">
                {mainImage ? (
                  <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden border border-stone-200/80 bg-white shadow-sm rotate-[-2deg] group-hover:rotate-0 transition-transform">
                    <img src={mainImage.url} alt="Produto" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 shrink-0 rounded-2xl border-2 border-dashed border-stone-200 bg-white flex flex-col items-center justify-center text-stone-400 rotate-[-2deg] group-hover:rotate-0 transition-transform">
                    <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Sem Img</span>
                  </div>
                )}
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                   <div className="flex flex-wrap gap-1.5 mb-2">
                     <span className="px-2 py-0.5 bg-stone-200 text-stone-800 rounded font-bold uppercase text-[10px] tracking-wider">{order.platform}</span>
                   </div>
                   <h3 className="font-serif text-lg text-stone-900 leading-tight mb-1">{order.quantity}x {order.product_name}</h3>
                   <div className="text-xs font-mono text-stone-400 truncate">{order.order_code || '#SemCodigo'}</div>
                </div>
              </div>

              {/* Info Part */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4">
                   <div>
                     <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-0.5">Cliente</p>
                     <p className="text-sm font-medium text-stone-800 truncate">{order.customer_name}</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-0.5">Prazo</p>
                     <p className={cn("text-sm font-bold truncate", order.due_date ? "text-rose-600" : "text-stone-700")}>{order.due_date ? formatDate(order.due_date) : 'N/A'}</p>
                   </div>
                </div>

                {(order.variation) && (
                  <div className="bg-amber-50/50 p-3 rounded-xl mb-4 text-sm text-amber-900 border border-amber-100/50">
                    <span className="font-bold text-amber-900/60 uppercase text-[10px] tracking-widest block mb-1">Variação / Cor</span>
                    <span className="font-medium">{order.variation}</span>
                  </div>
                )}
                
                {/* Quick Checklist */}
                <div className="bg-stone-50 rounded-2xl p-3 border border-stone-100/80 mb-4 space-y-2">
                   <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1.5 px-1">Checklist Rápido</p>
                   {[
                     { key: 'produto_correto', label: 'Produto correto' },
                     { key: 'cor_correta', label: 'Cor correta' },
                     { key: 'quantidade_correta', label: 'Quantidade' }
                   ].map(item => (
                     <label key={item.key} className="flex items-center gap-3 cursor-pointer group p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-stone-200">
                       <div className={cn(
                         "w-5 h-5 rounded flex items-center justify-center border transition-all shrink-0",
                         chk[item.key as keyof typeof chk] ? "bg-emerald-500 border-emerald-500 shadow-inner" : "border-stone-300 bg-white group-hover:border-emerald-400"
                       )}>
                         {chk[item.key as keyof typeof chk] && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                       </div>
                       <input 
                         type="checkbox" 
                         className="hidden"
                         checked={!!chk[item.key as keyof typeof chk]}
                         onChange={() => handleCheck(order, item.key as keyof Order['checklist'])}
                       />
                       <span className={cn("text-sm font-medium", chk[item.key as keyof typeof chk] ? "text-stone-400 line-through" : "text-stone-700")}>{item.label}</span>
                     </label>
                   ))}
                </div>

                <div className="mt-auto pt-2">
                  <button 
                    onClick={() => handleSeparate(order)}
                    className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2 group-hover:shadow-md"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Marcar como Separado
                  </button>
                </div>
              </div>
            </div>
          )})
        )}
      </div>
    </div>
  );
}
