import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Order, OrderStatus } from '../types';
import { Search, Filter, MoreVertical, Edit2, Copy, Trash2, CheckSquare, ListOrdered, X, AlertCircle, Eye, ClipboardCopy, Image as ImageIcon } from 'lucide-react';
import { cn, getStatusColor, getPriorityColor, formatDate } from '../lib/utils';
import { isToday, isTomorrow, isThisWeek, parseISO, isBefore, startOfToday } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import { PageHeader } from './PageHeader';

export function OrderList({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const { orders, updateOrder, deleteOrder, addOrder, settings } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<string>('all');
  
  // Filter application
  const filteredOrders = orders.filter(order => {
    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        order.customer_name.toLowerCase().includes(term) ||
        order.product_name.toLowerCase().includes(term) ||
        order.order_code.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    // Dropdowns
    if (filterPlatform !== 'all' && order.platform !== filterPlatform) return false;
    if (filterStatus !== 'all' && order.status !== filterStatus) return false;

    // Quick Filters
    if (quickFilter !== 'all') {
      const entryDate = parseISO(order.entry_date);
      const dueDate = order.due_date ? parseISO(order.due_date) : null;
      
      switch (quickFilter) {
        case 'today':
          if (!isToday(entryDate)) return false;
          break;
        case 'tomorrow':
          if (!dueDate || !isTomorrow(dueDate)) return false;
          break;
        case 'week':
          if (!isThisWeek(entryDate)) return false;
          break;
        case 'late':
          if (!dueDate || !isBefore(dueDate, startOfToday()) || ['Postado', 'Finalizado', 'Cancelado'].includes(order.status)) return false;
          break;
        case 'urgent':
          if (order.priority !== 'Urgente') return false;
          break;
        case 'finished':
          if (order.status !== 'Finalizado') return false;
          break;
        case 'no_image':
          if (order.images && order.images.length > 0) return false;
          break;
        case 'no_code':
          if (order.order_code) return false;
          break;
        case 'no_value':
          if (order.price > 0) return false;
          break;
        case 'with_notes':
          if (!order.notes && !order.details) return false;
          break;
        case 'with_occurrence':
          if (order.occurrence_type === 'Pedido normal' || !order.occurrence_type) return false;
          break;
        case 'due_today':
          if (!dueDate || !isToday(dueDate)) return false;
          break;
        case 'ready_pack':
          if (order.status !== 'Separado') return false;
          break;
        case 'ready_ship':
          if (order.status !== 'Embalado') return false;
          break;
        case 'checklist_incomplete': {
          const chk = order.checklist;
          const essentialsDone = 
            chk.produto_correto &&
            chk.imagem_conferida &&
            chk.cor_correta &&
            chk.quantidade_correta &&
            chk.cliente_conferido &&
            chk.codigo_conferido &&
            chk.etiqueta_conferida &&
            chk.embalagem_feita;
          if (essentialsDone) return false;
          break;
        }
      }
    }

    return true;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleDuplicate = (order: Order) => {
    const newOrder = {
      ...order,
      id: uuidv4(),
      order_code: order.order_code ? `${order.order_code}-copy` : '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'Novo pedido' as OrderStatus,
    };
    addOrder(newOrder);
  };

  const handleDelete = (id: string, currentStatus: OrderStatus) => {
    if (settings.blockDeleteFinalizedOrders !== false && ['Finalizado', 'Postado'].includes(currentStatus)) {
      alert("A exclusão de pedidos finalizados ou postados está bloqueada pelas configurações de segurança.");
      return;
    }

    if (settings.confirmDeleteOrder !== false) {
      if (!window.confirm("Você tem certeza que deseja excluir permanentemente este pedido?")) {
        return;
      }
    }

    deleteOrder(id);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <PageHeader 
        title="Pedidos Registrados" 
        description="Gerencie, filtre e atualize os status de todos os pedidos."
        className="items-center"
      />

      {/* Filters */}
      <div className="bg-white theme-card p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input 
            type="text" 
            placeholder="Buscar cliente, produto ou código..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select 
            value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}
            className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none flex-1 min-w-[140px]"
          >
            <option value="all">Todas as Plataformas</option>
            <option value="Shopee">Shopee</option>
            <option value="TikTok">TikTok Shop</option>
            <option value="Outro">Outro</option>
          </select>
          
          <select 
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none flex-1 min-w-[140px]"
          >
            <option value="all">Todos os Status</option>
            <option value="Novo pedido">Novo pedido</option>
            <option value="Em produção">Em produção</option>
            <option value="Separado">Separado</option>
            <option value="Embalado">Embalado</option>
            <option value="Postado">Postado</option>
            <option value="Finalizado">Finalizado</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'no_image', 'no_code', 'checklist_incomplete', 'no_value', 'with_notes', 'with_occurrence', 'due_today', 'ready_pack', 'ready_ship', 'late', 'urgent', 'finished'].map(f => {
          let label = '';
          switch (f) {
            case 'all': label = 'Todos'; break;
            case 'no_image': label = 'Sem imagem'; break;
            case 'no_code': label = 'Sem código'; break;
            case 'checklist_incomplete': label = 'Checklist Incompleto'; break;
            case 'no_value': label = 'Sem valor'; break;
            case 'with_notes': label = 'Com observação'; break;
            case 'with_occurrence': label = 'Com ocorrência'; break;
            case 'due_today': label = 'Vencendo hoje'; break;
            case 'ready_pack': label = 'Pronto para embalagem'; break;
            case 'ready_ship': label = 'Pronto para postagem'; break;
            case 'late': label = 'Atrasados'; break;
            case 'urgent': label = 'Urgentes'; break;
            case 'finished': label = 'Finalizados'; break;
          }
          return (
          <button 
            key={f}
            onClick={() => setQuickFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
              quickFilter === f 
                ? "bg-stone-800 text-white border-stone-800" 
                : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
            )}
          >
            {label}
          </button>
        )})}
      </div>

      {/* List */}
      <div className="bg-white theme-card rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4">
               <ListOrdered className="w-8 h-8 text-stone-300" />
             </div>
             <p className="text-stone-800 font-serif text-xl mb-2">Nenhum pedido cadastrado ainda.</p>
             <p className="text-stone-500 font-medium mb-6">Comece adicionando o primeiro pedido do dia.</p>
             <button 
                onClick={() => {
                  if (setActiveTab) setActiveTab('add_order')
                }}
                className="px-6 py-3 rounded-xl font-medium text-white bg-amber-700 hover:bg-amber-800 transition-colors shadow-sm"
              >
                + Adicionar Pedido
             </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-stone-500">Nenhum pedido encontrado com estes filtros.</div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onUpdate={(data) => updateOrder(order.id, data)}
                onDuplicate={() => handleDuplicate(order)}
                onDelete={() => handleDelete(order.id, order.status)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type OrderCardProps = {
  order: Order;
  onUpdate: (data: Partial<Order>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdate, onDuplicate, onDelete }) => {
  const [showChecklist, setShowChecklist] = useState(false);
  const [showDetailedModal, setShowDetailedModal] = useState(false);
  const [showFinishWarning, setShowFinishWarning] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const { settings } = useStore();

  const fullChecklistItems = [
    { key: 'produto_correto', label: 'Produto correto' },
    { key: 'imagem_conferida', label: 'Imagem conferida' },
    { key: 'cor_correta', label: 'Cor correta' },
    { key: 'quantidade_correta', label: 'Quantidade correta' },
    { key: 'cliente_conferido', label: 'Cliente conferido' },
    { key: 'codigo_conferido', label: 'Código do pedido conferido' },
    { key: 'plataforma_conferida', label: 'Plataforma conferida' },
    { key: 'etiqueta_conferida', label: 'Etiqueta conferida' },
    { key: 'embalagem_feita', label: 'Embalagem feita' },
    { key: 'brinde_incluido', label: 'Brinde/Bilhete colocado' },
    { key: 'pronto_para_postagem', label: 'Pronto para postagem' },
  ] as const;

  const essentialKeys = [
    'produto_correto', 'imagem_conferida', 'cor_correta', 'quantidade_correta', 
    'cliente_conferido', 'codigo_conferido', 'plataforma_conferida', 'etiqueta_conferida', 'embalagem_feita'
  ];

  const chk = order.checklist || {};
  const checkedCount = fullChecklistItems.filter(item => chk[item.key as keyof typeof chk]).length;
  const progressPercent = Math.round((checkedCount / fullChecklistItems.length) * 100);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    
    if (newStatus === 'Finalizado' || newStatus === 'Postado') {
      const isComplete = essentialKeys.every(k => chk[k as keyof typeof chk]);
      if (!isComplete) {
        setShowFinishWarning(true);
        return;
      }
    }
    
    onUpdate({ status: newStatus });
  };

  const forceStatusChange = (newStatus: OrderStatus) => {
    onUpdate({ status: newStatus });
    setShowFinishWarning(false);
  };

  const handleCheck = (key: keyof Order['checklist']) => {
    onUpdate({
      checklist: {
        ...order.checklist,
        [key]: !order.checklist[key]
      }
    });
  };

  const handleCopySummary = () => {
    const text = `Pedido ${order.platform} — Cliente: ${order.customer_name} — Produto: ${order.quantity}x ${order.product_name} — Cor: ${order.variation || 'N/A'} — Entrega: ${order.due_date ? formatDate(order.due_date) : 'N/A'}.`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const mainImage = order.images?.find(i => i.is_main) || order.images?.[0];

  const pipeline = ['Novo pedido', 'Em produção', 'Separado', 'Embalado', 'Postado', 'Finalizado'];
  let pipeIndex = pipeline.indexOf(order.status);
  if (order.status === 'Produto pronto') pipeIndex = 1;
  if (order.status === 'Conferido') pipeIndex = 2;
  if (order.status === 'Cancelado') pipeIndex = -1;

  // Alerts logic
  const isUrgentAndHighlighted = settings.highlightUrgent && order.priority === 'Urgente' && !['Postado', 'Finalizado', 'Cancelado'].includes(order.status);
  const isNoImageHighlighted = settings.highlightNoImage && (!order.images || order.images.length === 0);
  const isNoCodeHighlighted = settings.highlightNoCode && (!order.order_code || order.order_code.trim() === '');
  const isLateHighlighted = settings.highlightLate && !!order.due_date && new Date(order.due_date) < new Date() && !['Postado', 'Finalizado', 'Cancelado'].includes(order.status);
  const isChecklistIncompleteHighlighted = settings.highlightIncompleteChecklist && ['Separado', 'Embalado'].includes(order.status) && progressPercent < 100;
  
  const hasAlertMarker = isUrgentAndHighlighted || isNoImageHighlighted || isNoCodeHighlighted || isLateHighlighted || isChecklistIncompleteHighlighted;

  return (
    <div className={cn("p-5 hover:bg-stone-50/30 transition-colors group border-b last:border-b-0", hasAlertMarker ? 'bg-orange-50/10 border-orange-200' : 'border-stone-100')}>
      <div className="flex flex-col lg:flex-row gap-6 relative">
        {hasAlertMarker && (
           <div className="absolute top-0 right-0 -mt-2 -mr-2 w-3 h-3 rounded-full bg-orange-500 shadow-sm animate-pulse z-10 shrink-0 hidden lg:block" title="Atenção necessária" />
        )}

        {settings.enableImageUpload && settings.showMainImageOnCards && mainImage && (
          <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 mt-1 hidden sm:block cursor-zoom-in group-hover:shadow-md transition-all relative" onClick={() => setZoomedImage(mainImage.url)}>
            <img src={mainImage.url} alt={mainImage.file_name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-stone-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Eye className="w-6 h-6 text-white text-shadow-sm" />
            </div>
          </div>
        )}

        {/* Left: Key Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className={cn(
              "px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider",
              order.platform === 'Shopee' ? "bg-orange-100 text-orange-800" :
              order.platform === 'TikTok' ? "bg-slate-100 text-slate-800" :
              "bg-stone-200 text-stone-800"
            )}>
              {order.platform}
            </span>
            <span className="font-mono text-xs text-stone-500">{order.order_code || '#SemCodigo'}</span>
            {order.priority !== 'Normal' && (
              <span className={cn("px-2 py-0.5 rounded text-xs border font-medium", getPriorityColor(order.priority))}>
                {order.priority}
              </span>
            )}
            <span className="text-xs text-stone-400">Entrega: {order.due_date ? formatDate(order.due_date) : 'N/A'}</span>
          </div>
          
          {hasAlertMarker && (
             <div className="flex flex-wrap gap-1 mb-2">
                {isUrgentAndHighlighted && <span className="bg-red-50 text-red-600 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold border border-red-100">Urgente</span>}
                {isNoImageHighlighted && <span className="bg-stone-100 text-stone-500 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold border border-stone-200">Sem Imagem</span>}
                {isNoCodeHighlighted && <span className="bg-stone-100 text-stone-500 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold border border-stone-200">Sem Código</span>}
                {isLateHighlighted && <span className="bg-rose-50 text-rose-600 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold border border-rose-100 flex gap-1 items-center"><AlertCircle className="w-3 h-3"/> Atrasado</span>}
                {isChecklistIncompleteHighlighted && <span className="bg-amber-50 text-amber-700 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold border border-amber-200 flex gap-1 items-center">Checklist Pendente</span>}
             </div>
          )}

          <h3 className="text-lg font-serif font-medium text-stone-900 truncate">
            {order.quantity}x {order.product_name}
          </h3>
          <p className="text-stone-600 mt-1 truncate">Cliente: <span className="font-medium text-stone-800">{order.customer_name}</span></p>
          
          {(order.details || order.variation) && (
            <p className="text-sm text-stone-500 mt-2 truncate">
              {order.variation && `Var: ${order.variation}`}
              {order.variation && order.details && ` | `}
              {order.details && `Detalhes: ${order.details}`}
            </p>
          )}

          {/* Pipeline visual */}
          {order.status !== 'Cancelado' && (
            <div className="mt-4 flex items-center gap-1 w-full max-w-sm">
              {pipeline.map((step, idx) => (
                <div key={step} className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden relative" title={step}>
                  <div className={cn("absolute inset-0 transition-all", idx <= pipeIndex ? "bg-amber-500" : "bg-transparent")}></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Center: Status & Checklist */}
        <div className="w-full lg:w-72 flex flex-col justify-center gap-3 border-t lg:border-t-0 border-stone-100 pt-4 lg:pt-0 lg:border-l lg:pl-6">
          <select 
            value={order.status}
            onChange={handleStatusChange}
            className={cn("w-full px-3 py-2 rounded-lg text-sm font-medium border-0 ring-1 ring-inset outline-none appearance-none cursor-pointer hover:shadow-sm transition-shadow", getStatusColor(order.status), "ring-black/5 custom-select")}
          >
              <option value="Novo pedido">Novo pedido</option>
              <option value="Em produção">Em produção</option>
              <option value="Produto pronto">Produto pronto</option>
              <option value="Separado">Separado</option>
              <option value="Conferido">Conferido</option>
              <option value="Embalado">Embalado</option>
              <option value="Postado">Postado</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Cancelado">Cancelado</option>
          </select>

          <button 
            onClick={() => setShowChecklist(!showChecklist)}
            className="flex flex-col items-center justify-center gap-1 text-sm text-stone-600 bg-white border border-stone-200 py-1.5 rounded-lg hover:bg-stone-50 relative overflow-hidden group/check"
          >
            <div className="flex items-center gap-2 relative z-10 w-full justify-center px-4">
              <CheckSquare className="w-4 h-4 text-stone-400 group-hover/check:text-amber-600 transition-colors" />
              <span className="font-medium mt-0.5">Checklist: {progressPercent}%</span>
            </div>
            <div className="absolute left-0 bottom-0 h-1 bg-emerald-500 transition-all opacity-80" style={{ width: `${progressPercent}%` }}></div>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex justify-end items-center gap-2 border-t lg:border-t-0 border-stone-100 pt-4 lg:pt-0 lg:border-l lg:pl-6 shrink-0 lg:flex-col lg:items-end w-full lg:w-auto">
           <button onClick={() => setShowDetailedModal(true)} className="flex items-center justify-center gap-2 px-4 py-2 w-full lg:w-auto text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg text-sm font-medium transition-colors border border-stone-200">
              <Eye className="w-4 h-4" />
              Ver Pedido
           </button>
           <div className="flex gap-1 w-full lg:w-auto justify-end mt-2 lg:mt-0">
             <button onClick={onDuplicate} title="Duplicar" className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg border border-transparent hover:border-stone-200 transition-all">
               <Copy className="w-4 h-4" />
             </button>
             <button onClick={onDelete} title="Excluir" className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all">
               <Trash2 className="w-4 h-4" />
             </button>
           </div>
        </div>
      </div>

      {showChecklist && (
        <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200/50 pointer-events-auto">
          {fullChecklistItems.map(item => (
             <label key={item.key} className="flex items-center gap-3 cursor-pointer group p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-stone-200 hover:shadow-sm">
               <div className={cn(
                 "w-5 h-5 rounded flex items-center justify-center border transition-all shrink-0",
                 chk[item.key as keyof typeof chk] ? "bg-emerald-600 border-emerald-600 shadow-inner" : "border-stone-300 bg-white group-hover:border-emerald-500"
               )}>
                 {chk[item.key as keyof typeof chk] && <CheckSquare className="w-3.5 h-3.5 text-white" />}
               </div>
               <input 
                 type="checkbox" 
                 className="hidden"
                 checked={!!chk[item.key as keyof typeof chk]}
                 onChange={() => handleCheck(item.key as keyof Order['checklist'])}
               />
               <span className={cn("text-sm", chk[item.key as keyof typeof chk] ? "text-stone-400 line-through" : "text-stone-700 font-medium")}>{item.label}</span>
             </label>
          ))}
        </div>
      )}

      {showFinishWarning && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 text-left">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 border text-center relative pointer-events-auto">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif text-stone-800 mb-2">Checklist Incompleto</h3>
            <p className="text-stone-500 mb-6 text-sm">
              Este pedido ainda possui conferências pendentes. Deseja finalizar mesmo assim?
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={() => forceStatusChange('Finalizado')} className="px-4 py-3 bg-amber-700 text-white rounded-xl text-sm font-medium hover:bg-amber-800 transition-colors shadow-sm">
                Finalizar mesmo assim
              </button>
              <button onClick={() => forceStatusChange('Postado')} className="px-4 py-3 bg-stone-100 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-200 transition-colors border border-stone-200 shadow-sm">
                Marcar como postado
              </button>
              <button onClick={() => setShowFinishWarning(false)} className="px-4 py-2 mt-2 bg-transparent text-stone-500 rounded-xl text-sm font-medium hover:text-stone-700 transition-colors underline underline-offset-4">
                Voltar e conferir
              </button>
            </div>
          </div>
        </div>
      )}

      {zoomedImage && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-stone-900/90 backdrop-blur-sm px-4 py-8 pointer-events-auto" onClick={() => setZoomedImage(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-stone-300 p-2 transition-colors focus:outline-none" onClick={() => setZoomedImage(null)}>
            <X className="w-8 h-8" />
          </button>
          <img src={zoomedImage} alt="Zoom" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in fade-in zoom-in-95 pointer-events-auto" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {showDetailedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 sm:p-6 lg:p-8">
          <div className="bg-[#fcfbfa] w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 pointer-events-auto">
            {/* Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-stone-200 flex flex-wrap gap-4 items-center justify-between bg-white shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-serif text-stone-900">Pedido <span className="text-amber-700">#{order.order_code || '---'}</span></h2>
                <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border", getStatusColor(order.status), "shadow-sm")}>{order.status}</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleCopySummary} className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-sm font-medium transition-all shadow-sm border border-stone-200/50">
                  {copiedSummary ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <ClipboardCopy className="w-4 h-4" />}
                  <span className="hidden sm:inline">{copiedSummary ? 'Copiado!' : 'Copiar Resumo'}</span>
                </button>
                <div className="h-6 w-px bg-stone-200"></div>
                <button onClick={() => setShowDetailedModal(false)} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 relative">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Modal Left Column: Images & Primary Info */}
                <div className="lg:col-span-4 space-y-6">
                  {mainImage ? (
                    <div className="aspect-square rounded-3xl overflow-hidden border border-stone-200/80 bg-stone-100 shadow-md cursor-zoom-in group relative" onClick={() => setZoomedImage(mainImage.url)}>
                      <img src={mainImage.url} alt="Produto" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                      <div className="absolute inset-0 bg-stone-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                        <Eye className="w-8 h-8 text-white drop-shadow-md" />
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center text-stone-400">
                      <ImageIcon className="w-12 h-12 mb-3 opacity-50" />
                      <span className="text-sm font-medium">Sem imagem</span>
                    </div>
                  )}

                  <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                    <div>
                      <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-stone-300 rounded-full"></span>Cliente</p>
                      <p className="font-serif text-xl text-stone-900 break-words">{order.customer_name}</p>
                      {order.platform_username && <p className="text-sm text-stone-500 font-medium mt-1 break-words">@{order.platform_username}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-stone-300 rounded-full"></span>Endereço</p>
                      <p className="text-sm text-stone-700 leading-relaxed break-words">{order.delivery_address || 'Não informado'}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-stone-100/80 pt-4 mt-2">
                      <div>
                        <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1">Plataforma</p>
                        <span className="text-sm font-bold bg-stone-100 px-2.5 py-1 rounded-md text-stone-700">{order.platform}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1">Origem Img.</p>
                        <span className="text-xs font-medium text-stone-600">{order.image_origin || '---'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Right Column: Details & Checklist */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 rounded-3xl border border-amber-100/50 flex-[2] relative overflow-hidden group">
                      <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl group-hover:bg-amber-300/30 transition-colors"></div>
                      <p className="text-xs font-bold uppercase tracking-widest text-amber-800/60 mb-2">Produto Encomendado</p>
                      <h4 className="text-2xl font-serif text-amber-950 mb-2 leading-tight break-words">{order.product_name}</h4>
                      <p className="text-amber-800/80 font-medium text-lg bg-white/40 inline-flex items-center px-3 py-1 rounded-xl backdrop-blur-sm border border-amber-200/50 break-words flex-wrap max-w-full">
                        {order.quantity}x unidades {order.variation && <span className="ml-2 pl-2 border-l border-amber-800/20">{order.variation}</span>}
                      </p>
                    </div>
                    <div className="bg-emerald-50 flex-col justify-center p-6 rounded-3xl border border-emerald-100 flex-1 flex relative overflow-hidden">
                      <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-emerald-200/30 rounded-full blur-xl"></div>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-1">Valor Total</p>
                      <p className="text-3xl font-serif text-emerald-900 relative z-10">R$ {parseFloat(order.price.toString()).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-2xl border border-stone-100/80 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mb-1.5">Tipo do Pedido</p>
                        <p className="text-sm font-semibold text-stone-800">{order.order_type || 'Produto pronto'}</p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-stone-100/80 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mb-1.5">Ocorrência</p>
                        <p className={cn("text-sm font-semibold", order.occurrence_type && order.occurrence_type !== 'Pedido normal' ? "text-rose-600" : "text-stone-800")}>{order.occurrence_type || 'Pedido normal'}</p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-stone-100/80 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mb-1.5">Data de Entrada</p>
                        <p className="text-sm font-semibold text-stone-800">{formatDate(order.entry_date)}</p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-stone-100/80 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-[10px] text-red-400 uppercase font-bold tracking-widest mb-1.5">Prazo de Envio</p>
                        <p className="text-sm font-bold text-red-600">{order.due_date ? formatDate(order.due_date) : 'Não definido'}</p>
                      </div>
                  </div>

                  {(order.details || order.notes) && (
                    <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm relative overflow-hidden">
                       <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-stone-300"></div>
                       <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
                         <Edit2 className="w-4 h-4" /> Observações e Detalhes
                       </p>
                       <div className="space-y-4">
                          {order.details && (
                            <div>
                               <p className="text-sm font-medium text-stone-900 mb-1">Detalhes do produto:</p>
                               <p className="text-sm text-stone-600 bg-stone-50 p-4 rounded-2xl border border-stone-100/50 leading-relaxed">{order.details}</p>
                            </div>
                          )}
                          {order.notes && (
                            <div>
                               <p className="text-sm font-medium text-stone-900 mb-1">Anotações internas:</p>
                               <p className="text-sm text-stone-700 bg-amber-50/50 italic p-4 rounded-2xl border border-amber-100/50 leading-relaxed flex items-start gap-3">
                                 <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                 {order.notes}
                               </p>
                            </div>
                          )}
                       </div>
                    </div>
                  )}

                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-100 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-stone-50 rounded-bl-full -z-10"></div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                      <div>
                        <h4 className="font-serif text-2xl text-stone-900 mb-1 relative inline-block">
                           Checklist Completo
                           <span className="absolute -bottom-1 left-0 w-12 h-1 bg-amber-500 rounded-full"></span>
                        </h4>
                      </div>
                      <div className="bg-stone-50 border border-stone-200 px-4 py-2 rounded-2xl flex items-center gap-3">
                        <div className="text-sm font-bold text-stone-800">{progressPercent}% Concluído</div>
                        <div className="w-24 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                      {fullChecklistItems.map(item => (
                        <label key={item.key} className="flex items-start gap-3 cursor-pointer group p-2 hover:bg-stone-50 rounded-xl transition-colors border border-transparent hover:border-stone-100">
                          <div className={cn(
                            "w-6 h-6 mt-0.5 rounded-lg flex items-center justify-center border-2 transition-all shrink-0 shadow-sm group-hover:shadow-md",
                            chk[item.key as keyof typeof chk] ? "bg-emerald-500 border-emerald-500 text-white" : "border-stone-300 bg-white group-hover:border-emerald-400 group-hover:bg-emerald-50 text-transparent"
                          )}>
                             <CheckSquare className="w-4 h-4" />
                          </div>
                          <span className={cn("text-sm font-medium pt-1 transition-colors leading-snug", chk[item.key as keyof typeof chk] ? "text-stone-400 line-through" : "text-stone-700")}>
                            {item.label}
                          </span>
                          <input 
                            type="checkbox" 
                            className="hidden"
                            checked={!!chk[item.key as keyof typeof chk]}
                            onChange={() => handleCheck(item.key as keyof Order['checklist'])}
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Histórico/Log */}
                  {order.activity_logs && order.activity_logs.length > 0 && (
                    <div className="bg-stone-50/50 p-6 sm:p-8 rounded-3xl border border-stone-200/50">
                      <h4 className="font-serif text-xl text-stone-900 mb-6 flex items-center gap-2">Histórico de Atividades</h4>
                      <div className="relative border-l-2 border-stone-200 ml-3 pl-6 space-y-6">
                        {order.activity_logs.slice().reverse().map((log, index) => (
                          <div key={log.id} className="relative">
                            <div className="absolute -left-[31px] bg-white w-4 h-4 rounded-full border-2 border-amber-500 ring-4 ring-stone-50"></div>
                            <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm w-full">
                              <p className="text-sm font-medium text-stone-800">{log.action}</p>
                              <div className="flex gap-2 items-center mt-2 text-xs text-stone-500">
                                <span>{new Date(log.date).toLocaleDateString('pt-BR')}</span>
                                <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
                                <span>{new Date(log.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</span>
                                {log.user && (
                                  <>
                                    <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
                                    <span className="font-medium">{log.user}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
