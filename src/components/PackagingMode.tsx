import React from 'react';
import { useStore } from '../store/useStore';
import { Order } from '../types';
import { PageHeader } from './PageHeader';
import { getStatusColor, cn } from '../lib/utils';
import { PackageOpen, Box, CheckSquare, Image as ImageIcon, Truck, AlertCircle } from 'lucide-react';

export function PackagingMode() {
  const { orders, updateOrder } = useStore();
  
  // Show orders that are separated or checked
  const readyOrders = orders.filter(o => 
    ['Separado', 'Conferido'].includes(o.status)
  ).sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());

  const handlePack = (order: Order) => {
    updateOrder(order.id, { status: 'Embalado' });
  };
  
  const handlePost = (order: Order) => {
    updateOrder(order.id, { status: 'Postado' });
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
        title="Modo Embalagem" 
        description="Foque nos pedidos que já foram separados e estão prontos para empacotamento e etiqueta."
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {readyOrders.length === 0 ? (
          <div className="col-span-full py-16 text-center text-stone-500 bg-white theme-card rounded-3xl border border-stone-100 shadow-sm">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <PackageOpen className="w-10 h-10 text-stone-300" />
            </div>
            <p className="text-xl font-serif text-stone-800 mb-1">Nenhum pedido para embalar no momento.</p>
          </div>
        ) : (
          readyOrders.map(order => {
            const mainImage = order.images?.find(i => i.is_main) || order.images?.[0];
            const chk = order.checklist || {};
            
            return (
            <div key={order.id} className="bg-white theme-card rounded-3xl border border-stone-100 shadow-sm flex flex-col md:flex-row group overflow-hidden hover:shadow-md transition-shadow">
              
              {/* Left part with image */}
              <div className="w-full md:w-64 shrink-0 bg-stone-50 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-stone-100">
                {mainImage ? (
                  <div className="w-48 h-48 rounded-3xl overflow-hidden border border-stone-200/80 bg-white shadow-md mx-auto group-hover:scale-105 transition-transform duration-500">
                    <img src={mainImage.url} alt="Produto" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-3xl border-2 border-dashed border-stone-200 bg-white flex flex-col items-center justify-center text-stone-400 mx-auto">
                    <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-xs font-medium uppercase tracking-wider">Sem Imagem</span>
                  </div>
                )}
                <div className="mt-6 w-full space-y-2 text-center">
                  <span className="inline-block px-3 py-1 bg-stone-200 text-stone-800 rounded-md font-bold uppercase text-[10px] tracking-wider mb-2">{order.platform}</span>
                  <div className="text-sm font-mono text-stone-400 truncate">{order.order_code || '#SemCodigo'}</div>
                </div>
              </div>

              {/* Right Part */}
              <div className="p-6 md:p-8 flex-1 flex flex-col min-w-0">
                <div className="mb-6">
                   <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1.5">Cliente</p>
                   <h3 className="font-serif text-2xl text-stone-900 truncate">{order.customer_name}</h3>
                   <p className="text-stone-500 text-sm mt-1 mb-4 flex items-start gap-1">
                     <span className="font-medium shrink-0">Endereço:</span> 
                     <span className="line-clamp-2">{order.delivery_address || 'Não preenchido'}</span>
                   </p>
                   
                   <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100/50 mb-6 flex flex-wrap items-center gap-4">
                      <div className="flex-1 min-w-[200px]">
                         <span className="text-[10px] text-amber-900/50 font-bold uppercase tracking-widest block mb-0.5">Produto</span>
                         <span className="font-serif text-lg text-amber-950 leading-tight">{order.quantity}x {order.product_name}</span>
                      </div>
                      {order.variation && (
                        <div className="pl-4 border-l border-amber-200/50">
                           <span className="text-[10px] text-amber-900/50 font-bold uppercase tracking-widest block mb-0.5">Cor/Var</span>
                           <span className="font-medium text-amber-900">{order.variation}</span>
                        </div>
                      )}
                   </div>
                   
                   {order.notes && (
                      <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 mb-6 flex gap-3 text-rose-800">
                         <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
                         <div className="text-sm font-medium">{order.notes}</div>
                      </div>
                   )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-auto">
                   {/* Embalagem Checklist */}
                   <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/60 shadow-inner">
                      <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-3 pl-1">Checklist de Embalagem</p>
                      <div className="space-y-1">
                        {[
                          { key: 'produto_correto', label: 'Produto conferido' },
                          { key: 'cor_correta', label: 'Cor conferida' },
                          { key: 'quantidade_correta', label: 'Quantidade conferida' },
                          { key: 'imagem_conferida', label: 'Imagem conferida' },
                          { key: 'etiqueta_conferida', label: 'Etiqueta conferida' },
                          { key: 'embalagem_feita', label: 'Embalagem pronta' },
                          { key: 'brinde_incluido', label: 'Bilhete/brinde colocado' },
                          { key: 'pronto_para_postagem', label: 'Pronto p/ postagem' }
                        ].map(item => (
                          <label key={item.key} className="flex items-center gap-3 cursor-pointer group p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-stone-200">
                            <div className={cn(
                              "w-5 h-5 rounded flex items-center justify-center border transition-all shrink-0",
                              chk[item.key as keyof typeof chk] ? "bg-emerald-500 border-emerald-500 shadow-inner text-white" : "border-stone-300 bg-white group-hover:border-emerald-400 group-hover:bg-emerald-50 text-transparent"
                            )}>
                              <CheckSquare className="w-3.5 h-3.5" />
                            </div>
                            <input 
                              type="checkbox" 
                              className="hidden"
                              checked={!!chk[item.key as keyof typeof chk]}
                              onChange={() => handleCheck(order, item.key as keyof Order['checklist'])}
                            />
                            <span className={cn("text-xs font-medium", chk[item.key as keyof typeof chk] ? "text-stone-400 line-through" : "text-stone-700")}>{item.label}</span>
                          </label>
                        ))}
                      </div>
                   </div>

                   {/* Ações */}
                   <div className="flex flex-col justify-end gap-3">
                     <button 
                       onClick={() => handlePack(order)}
                       className="w-full py-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2 border border-stone-200"
                     >
                       <Box className="w-5 h-5" />
                       Pedido Embalado
                     </button>
                     <button 
                       onClick={() => handlePost(order)}
                       className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-medium transition-colors shadow-md flex items-center justify-center gap-2 group-hover:shadow-lg"
                     >
                       <Truck className="w-5 h-5" />
                       Pedido Postado
                     </button>
                   </div>
                </div>

              </div>
            </div>
          )})
        )}
      </div>
    </div>
  );
}
