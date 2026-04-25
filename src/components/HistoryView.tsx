import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { cn, getStatusColor, getPriorityColor, formatDate } from '../lib/utils';
import { Search, Filter, History, Download, List, LayoutGrid, FileText, CheckCircle2, Clock, Package, Truck, X } from 'lucide-react';
import { Order } from '../types';
import { PageHeader } from './PageHeader';

export function HistoryView({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const { orders, settings } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAudit, setFilterAudit] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || o.platform === filterPlatform;
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    
    let matchesAudit = true;
    if (filterAudit === 'cancelled') matchesAudit = o.status === 'Cancelado';
    else if (filterAudit === 'late') matchesAudit = !!o.due_date && new Date(o.due_date) < new Date() && !['Postado', 'Finalizado', 'Cancelado'].includes(o.status);
    else if (filterAudit === 'no_image') matchesAudit = !o.images || o.images.length === 0;
    else if (filterAudit === 'no_value') matchesAudit = !o.price || o.price === 0;
    else if (filterAudit === 'no_code') matchesAudit = !o.order_code || o.order_code.trim() === '';
    else if (filterAudit === 'edited') matchesAudit = o.activity_logs?.some(l => l.action.toLowerCase().includes('editad')) || false;
    else if (filterAudit === 'occurrence') matchesAudit = o.occurrence_type && o.occurrence_type !== 'Pedido normal';
    else if (filterAudit === 'resend_exchange') matchesAudit = ['Reenvio', 'Troca', 'Produto errado'].includes(o.occurrence_type || '');

    return matchesSearch && matchesPlatform && matchesStatus && matchesAudit;
  }).sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());

  const finishedOrders = orders.filter(o => o.status === 'Produto pronto' || o.status === 'Separado').length;
  const shopeeOrders = orders.filter(o => o.platform === 'Shopee').length;
  const tiktokOrders = orders.filter(o => o.platform === 'TikTok').length;
  
  const totalValue = filteredOrders.reduce((acc, o) => acc + (o.price || 0), 0);

  const handleExportCsv = () => {
    if (filteredOrders.length === 0) return alert('Nenhum dado para exportar.');
    const headers = "Data,Plataforma,Código,Cliente,Produto,Quantidade,Valor,Status\n";
    const rows = filteredOrders.map(o => 
      `${formatDate(o.entry_date)},${o.platform},${o.order_code},"${o.customer_name}","${o.product_name}",${o.quantity},${o.price || 0},${o.status}`
    ).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historico_pedidos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
     <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-24 animate-in fade-in">
      <PageHeader 
        title="Histórico de Pedidos" 
        description="Consulte todos os pedidos registrados, acompanhe saídas por período e encontre informações antigas com facilidade."
      >
        <button 
          onClick={handleExportCsv}
          className="bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Exportar CSV
        </button>
      </PageHeader>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white theme-card p-4 rounded-2xl border border-stone-100 shadow-sm overflow-hidden min-w-0">
            <span className="text-stone-500 text-xs sm:text-sm mb-1 block truncate">Total Salvos</span>
            <span className="text-xl sm:text-2xl font-serif text-stone-800 truncate block">{orders.length}</span>
         </div>
         <div className="bg-white theme-card p-4 rounded-2xl border border-stone-100 shadow-sm overflow-hidden min-w-0">
            <span className="text-stone-500 text-xs sm:text-sm mb-1 block truncate">Finalizados/Separados</span>
            <span className="text-xl sm:text-2xl font-serif text-emerald-700 truncate block">{finishedOrders}</span>
         </div>
         <div className="bg-white theme-card p-4 rounded-2xl border border-stone-100 shadow-sm overflow-hidden min-w-0">
            <span className="text-stone-500 text-xs sm:text-sm mb-1 block truncate">Shopee / TikTok</span>
            <span className="text-xl sm:text-2xl font-serif text-stone-800 truncate block">{shopeeOrders} / {tiktokOrders}</span>
         </div>
         <div className="bg-white theme-card p-4 rounded-2xl border border-stone-100 shadow-sm overflow-hidden min-w-0">
            <span className="text-stone-500 text-xs sm:text-sm mb-1 block truncate">Valor Filtrado</span>
            <span className="text-lg sm:text-xl font-serif text-amber-700 truncate block">R$ {totalValue.toFixed(2)}</span>
         </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white theme-card p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-stone-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por cliente, produto, código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 appearance-none outline-none custom-select min-w-[120px] flex-1 text-stone-700"
          >
            <option value="all">Plataforma</option>
            <option value="Shopee">Shopee</option>
            <option value="TikTok">TikTok Shop</option>
            <option value="Outro">Outro</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 appearance-none outline-none custom-select min-w-[120px] flex-1 text-stone-700"
          >
            <option value="all">Status</option>
            <option value="Novo pedido">Novo pedido</option>
            <option value="Em produção">Em produção</option>
            <option value="Produto pronto">Produto pronto</option>
            <option value="Separado">Separado</option>
          </select>

          <select
            value={filterAudit}
            onChange={(e) => setFilterAudit(e.target.value)}
            className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 appearance-none outline-none custom-select min-w-[140px] flex-1 text-stone-700"
          >
            <option value="all">Auditoria Geral</option>
            <option value="cancelled">Pedidos Cancelados</option>
            <option value="late">Atrasados</option>
            <option value="no_image">Sem imagem</option>
            <option value="no_value">Sem valor</option>
            <option value="no_code">Sem código</option>
            <option value="edited">Foram editados</option>
            <option value="occurrence">Com ocorrência</option>
            <option value="resend_exchange">Reenvio / Troca</option>
          </select>

          <div className="flex bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={cn("p-2 rounded-lg transition-colors", viewMode === 'list' ? "bg-white shadow-sm text-amber-700" : "text-stone-500 hover:text-stone-700")}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={cn("p-2 rounded-lg transition-colors", viewMode === 'cards' ? "bg-white shadow-sm text-amber-700" : "text-stone-500 hover:text-stone-700")}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
         <div className="bg-white theme-card rounded-3xl border border-stone-100 p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-stone-300" />
            </div>
            <p className="text-xl font-serif text-stone-800 mb-2">Nenhum pedido encontrado</p>
            <p className="text-stone-500">Tente ajustar os filtros ou pesquisar por outro termo.</p>
         </div>
      ) : (
         viewMode === 'list' ? (
           <div className="bg-white theme-card rounded-2xl border border-stone-100 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider border-b border-stone-100">
                    <th className="px-6 py-4 font-medium">Data</th>
                    <th className="px-6 py-4 font-medium">Cliente / Plataforma</th>
                    <th className="px-6 py-4 font-medium">Produto</th>
                    <th className="px-6 py-4 font-medium">Qtd</th>
                    <th className="px-6 py-4 font-medium">Status / Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {filteredOrders.map(order => (
                    <tr 
                      key={order.id} 
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-stone-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-stone-600 whitespace-nowrap">
                         {formatDate(order.entry_date)}
                      </td>
                      <td className="px-6 py-4">
                         <div className="font-medium text-stone-800 mb-1">{order.customer_name}</div>
                         <div className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md inline-block">{order.platform}</div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="text-stone-700">{order.product_name}</div>
                         {order.order_code && <div className="text-xs text-stone-400 mt-1">Ref: {order.order_code}</div>}
                      </td>
                      <td className="px-6 py-4 text-stone-600 font-medium">{order.quantity}</td>
                      <td className="px-6 py-4">
                         <span className={cn("inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium mb-1", getStatusColor(order.status))}>
                           {order.status}
                         </span>
                         <div className="text-stone-600 text-sm">R$ {order.price?.toFixed(2) || '0.00'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredOrders.map(order => {
                const mainImage = order.images?.find(i => i.is_main) || order.images?.[0];
                return (
                <div 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white theme-card rounded-2xl border border-stone-100 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                   <div className="flex justify-between items-start mb-3">
                     <span className={cn("inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium", getStatusColor(order.status))}>
                       {order.status}
                     </span>
                     <span className="text-xs font-medium text-stone-400 px-2 py-1 bg-stone-100 rounded-lg">{order.platform}</span>
                   </div>
                   
                   {settings.enableImageUpload && settings.showMainImageOnCards && mainImage && (
                     <div className="mb-3 h-32 w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-100">
                       <img src={mainImage.url} alt={mainImage.file_name} className="w-full h-full object-cover" />
                     </div>
                   )}

                   <h3 className="font-serif text-lg text-stone-800 mb-1 truncate">{order.product_name}</h3>
                   <p className="text-sm text-stone-500 mb-4 truncate">Cliente: <span className="text-stone-700 font-medium">{order.customer_name}</span></p>
                   
                   <div className="grid grid-cols-2 gap-4 text-sm bg-stone-50 p-3 rounded-xl">
                      <div>
                        <span className="block text-stone-400 text-xs mb-0.5">Entrada</span>
                        <span className="text-stone-700">{formatDate(order.entry_date)}</span>
                      </div>
                      <div>
                        <span className="block text-stone-400 text-xs mb-0.5">Prazo</span>
                        <span className="text-stone-700">{order.due_date ? formatDate(order.due_date) : '-'}</span>
                      </div>
                   </div>
                </div>
             )})}
           </div>
         )
      )}

      {selectedOrder && (
         <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center md:p-6 animate-in fade-in">
           <div className="bg-white theme-card rounded-t-3xl md:rounded-3xl mt-12 md:mt-0 shadow-xl w-full max-w-3xl h-[calc(100svh-3rem)] md:h-auto md:max-h-[90vh] overflow-hidden border border-stone-100 flex flex-col">
              <div className="bg-stone-50 px-6 py-4 border-b border-stone-100 flex justify-between items-center z-10 shrink-0">
                 <div>
                    <h3 className="text-xl font-serif text-stone-800">Detalhes do Pedido</h3>
                    <p className="text-xs text-stone-500 font-mono mt-0.5">{selectedOrder.id}</p>
                 </div>
                 <button onClick={() => setSelectedOrder(null)} className="p-2 text-stone-400 hover:text-stone-700 bg-white rounded-xl shadow-sm border border-stone-100">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                 {/* Timeline Simplificada */}
                 <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 flex items-center justify-around text-xs font-medium text-stone-400">
                    <div className="flex flex-col items-center gap-2 text-amber-700">
                       <Clock className="w-5 h-5" /> <span>Criado</span>
                    </div>
                    <div className="h-0.5 w-8 bg-stone-200"></div>
                    <div className={cn("flex flex-col items-center gap-2", ['Em produção', 'Produto pronto', 'Separado', 'Embalado', 'Postado', 'Finalizado'].includes(selectedOrder.status) ? "text-amber-700" : "")}>
                       <Package className="w-5 h-5" /> <span>Produção/Embalagem</span>
                    </div>
                    <div className="h-0.5 w-8 bg-stone-200"></div>
                    <div className={cn("flex flex-col items-center gap-2", ['Postado', 'Finalizado'].includes(selectedOrder.status) ? "text-emerald-600" : "")}>
                       <Truck className="w-5 h-5" /> <span>Postado</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <h4 className="font-semibold text-stone-700 mb-2 border-b border-stone-100 pb-1">Cliente & Plataforma</h4>
                       <ul className="space-y-2 text-sm">
                          <li><span className="text-stone-500">Cliente:</span> <span className="font-medium text-stone-800">{selectedOrder.customer_name}</span></li>
                          {selectedOrder.platform_username && <li><span className="text-stone-500">Usuário:</span> {selectedOrder.platform_username}</li>}
                          {selectedOrder.delivery_address && <li><span className="text-stone-500">Endereço:</span> {selectedOrder.delivery_address}</li>}
                          <li><span className="text-stone-500">Plataforma:</span> {selectedOrder.platform}</li>
                          <li><span className="text-stone-500">Código:</span> {selectedOrder.order_code || '-'}</li>
                       </ul>
                    </div>
                    <div>
                       <h4 className="font-semibold text-stone-700 mb-2 border-b border-stone-100 pb-1">Produto</h4>
                       <ul className="space-y-2 text-sm">
                          <li><span className="text-stone-500">Item:</span> <span className="font-medium text-stone-800">{selectedOrder.product_name}</span></li>
                          <li><span className="text-stone-500">Categoria:</span> {selectedOrder.category}</li>
                          <li><span className="text-stone-500">Quantidade:</span> {selectedOrder.quantity}</li>
                          <li><span className="text-stone-500">Valor Pago:</span> R$ {selectedOrder.price?.toFixed(2) || '0.00'}</li>
                          {selectedOrder.estimated_profit > 0 && <li><span className="text-stone-500">Renda Est.:</span> R$ {selectedOrder.estimated_profit?.toFixed(2) || '0.00'}</li>}
                          <li><span className="text-stone-500">Detalhes:</span> {selectedOrder.details || selectedOrder.variation || '-'}</li>
                       </ul>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <h4 className="font-semibold text-stone-700 mb-2 border-b border-stone-100 pb-1">Status & Prazos</h4>
                       <ul className="space-y-2 text-sm">
                          <li><span className="text-stone-500">Status atual:</span> <span className={cn("px-2 py-0.5 rounded-lg text-xs font-medium ml-1", getStatusColor(selectedOrder.status))}>{selectedOrder.status}</span></li>
                          <li><span className="text-stone-500">Entrada:</span> {formatDate(selectedOrder.entry_date)}</li>
                          <li><span className="text-stone-500">Prazo:</span> {selectedOrder.due_date ? formatDate(selectedOrder.due_date) : '-'}</li>
                       </ul>
                    </div>
                    <div>
                       <h4 className="font-semibold text-stone-700 mb-2 border-b border-stone-100 pb-1">Observações</h4>
                       <p className="text-sm text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100 min-h-[4rem]">
                          {selectedOrder.notes || 'Nenhuma observação registrada.'}
                       </p>
                    </div>
                 </div>

                 {settings.enableImageUpload && selectedOrder.images && selectedOrder.images.length > 0 && (
                   <div className="pt-2">
                     <h4 className="font-semibold text-stone-700 mb-3 border-b border-stone-100 pb-1">Imagens do Pedido</h4>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {selectedOrder.images.map(img => (
                          <div key={img.id} className="group relative rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                             <div className="aspect-square">
                               <img src={img.url} alt={img.caption || img.file_name} className="w-full h-full object-cover" />
                             </div>
                             {img.caption && (
                               <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-white text-[10px] truncate">
                                  {img.caption}
                               </div>
                             )}
                             {img.is_main && (
                               <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm shadow-sm">
                                  Principal
                               </span>
                             )}
                             <a href={img.url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <Search className="w-6 h-6 text-white drop-shadow-md" />
                             </a>
                          </div>
                        ))}
                     </div>
                   </div>
                 )}

                 {selectedOrder.activity_logs && selectedOrder.activity_logs.length > 0 && (
                   <div className="pt-2">
                      <h4 className="font-semibold text-stone-700 mb-3 border-b border-stone-100 pb-1">Histórico de Alterações</h4>
                      <div className="space-y-3">
                         {selectedOrder.activity_logs.map(log => (
                           <div key={log.id} className="text-sm flex gap-3 text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                             <div className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5 shrink-0"></div>
                             <div className="flex-1">
                               <p className="font-medium text-stone-800">{log.action}</p>
                               {log.details && <p className="text-stone-500 mt-0.5 text-xs">{log.details}</p>}
                               <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-wider">{formatDate(log.date)}</p>
                             </div>
                           </div>
                         ))}
                      </div>
                   </div>
                 )}
              </div>
           </div>
         </div>
       )}
    </div>
  );
}