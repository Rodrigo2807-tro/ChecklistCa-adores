import React from 'react';
import { useStore } from '../store/useStore';
import { isToday, isBefore, startOfToday, parseISO } from 'date-fns';
import { 
  ShoppingBag, 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Truck,
  PackageSearch,
  BellRing
} from 'lucide-react';
import { cn, getStatusColor } from '../lib/utils';

import { PageHeader } from './PageHeader';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export function Dashboard({ setActiveTab }: DashboardProps) {
  const { orders, updateOrder } = useStore();

  const todayOrders = orders.filter(o => {
    try {
      return isToday(parseISO(o.created_at));
    } catch {
      return false;
    }
  });

  const allIncompleteOrders = orders.filter(o => o.status !== 'Finalizado' && o.status !== 'Cancelado');

  const getAlerts = () => {
    const alerts = [];

    const dueToday = allIncompleteOrders.filter(o => o.due_date && isToday(parseISO(o.due_date)));
    if (dueToday.length > 0) alerts.push({ label: 'Vencendo hoje', count: dueToday.length, filter: 'due_today', color: 'text-rose-600', bg: 'bg-rose-50' });

    const late = allIncompleteOrders.filter(o => o.due_date && isBefore(parseISO(o.due_date), startOfToday()) && o.status !== 'Postado');
    if (late.length > 0) alerts.push({ label: 'Atrasados', count: late.length, filter: 'late', color: 'text-red-600', bg: 'bg-red-50' });

    const urgent = allIncompleteOrders.filter(o => o.priority === 'Urgente');
    if (urgent.length > 0) alerts.push({ label: 'Urgentes', count: urgent.length, filter: 'urgent', color: 'text-orange-600', bg: 'bg-orange-50' });

    const noImage = allIncompleteOrders.filter(o => !o.images || o.images.length === 0);
    if (noImage.length > 0) alerts.push({ label: 'Sem imagem', count: noImage.length, filter: 'no_image', color: 'text-stone-600', bg: 'bg-stone-100' });

    const noCode = allIncompleteOrders.filter(o => !o.order_code);
    if (noCode.length > 0) alerts.push({ label: 'Sem código', count: noCode.length, filter: 'no_code', color: 'text-stone-600', bg: 'bg-stone-100' });

    const incompleteChecklist = allIncompleteOrders.filter(o => {
      const chk = o.checklist || {};
      const essentialKeys = ['produto_correto', 'imagem_conferida', 'cor_correta', 'quantidade_correta', 'cliente_conferido', 'codigo_conferido', 'plataforma_conferida', 'etiqueta_conferida', 'embalagem_feita'];
      return !essentialKeys.every(k => chk[k as keyof typeof chk]);
    });
    if (incompleteChecklist.length > 0) alerts.push({ label: 'Checklist incompleto', count: incompleteChecklist.length, filter: 'checklist_incomplete', color: 'text-amber-600', bg: 'bg-amber-50' });

    const withOccurrence = allIncompleteOrders.filter(o => o.occurrence_type && o.occurrence_type !== 'Pedido normal');
    if (withOccurrence.length > 0) alerts.push({ label: 'Com ocorrências', count: withOccurrence.length, filter: 'with_occurrence', color: 'text-rose-600', bg: 'bg-rose-50' });

    const readyShip = allIncompleteOrders.filter(o => o.status === 'Embalado');
    if (readyShip.length > 0) alerts.push({ label: 'Pronto para postar', count: readyShip.length, filter: 'ready_ship', color: 'text-emerald-600', bg: 'bg-emerald-50' });

    return alerts;
  };

  const alerts = getAlerts();

  const completedToday = todayOrders.filter(o => o.status === 'Finalizado').length;
  const progressPercent = todayOrders.length > 0 ? Math.round((completedToday / todayOrders.length) * 100) : 0;
  
  const shopeeCount = todayOrders.filter(o => o.platform === 'Shopee').length;
  const tiktokCount = todayOrders.filter(o => o.platform === 'TikTok').length;
  const pendingCount = todayOrders.filter(o => ['Novo pedido', 'Em produção'].includes(o.status)).length;
  const separatedCount = todayOrders.filter(o => o.status === 'Separado').length;
  const packedCount = todayOrders.filter(o => o.status === 'Embalado').length;
  const sentCount = todayOrders.filter(o => ['Postado', 'Finalizado'].includes(o.status)).length;
  const withNotesCount = todayOrders.filter(o => o.notes && o.notes.trim().length > 0).length;

  const handleMarkAsDone = (id: string) => {
    updateOrder(id, { status: 'Finalizado' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-24">
      <PageHeader 
        title="Painel do Dia" 
        description="Resumo das atividades e pedidos de hoje."
        className="items-center"
      >
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
           <button 
             onClick={() => setActiveTab('separation')}
             className="bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
           >
             <PackageSearch className="w-4 h-4" />
             Modo Separação
           </button>
           <button 
             onClick={() => setActiveTab('add_order')}
             className="bg-amber-800 hover:bg-amber-900 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
           >
             <ShoppingBag className="w-4 h-4" />
             Novo Pedido
           </button>
        </div>
      </PageHeader>

      <div className="bg-white theme-card rounded-3xl p-6 shadow-sm border border-stone-100">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
             <div>
                <h3 className="font-serif text-xl text-stone-900">Progresso do Dia</h3>
                <p className="text-sm text-stone-500">{completedToday} de {todayOrders.length} pedidos concluídos hoje — {progressPercent}%</p>
             </div>
             <div className="text-2xl font-serif text-amber-700">{progressPercent}%</div>
         </div>
         <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
         </div>
      </div>

      {alerts.length > 0 && (
         <div className="bg-white theme-card rounded-3xl p-6 md:p-8 shadow-sm border border-rose-100/50 bg-gradient-to-br from-white to-rose-50/20">
            <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-4">
               <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                 <BellRing className="w-5 h-5" />
               </div>
               <div>
                  <h3 className="font-serif text-xl text-stone-900">Atenção de Hoje</h3>
                  <p className="text-sm text-stone-500">Pedidos que precisam da sua atenção imediata.</p>
               </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
               {alerts.map(alert => (
                  <button 
                    key={alert.filter}
                    onClick={() => {
                        // Navegar para orders com o filtro rápido selecionado seria o ideal
                        setActiveTab('orders'); 
                        // Falta injetar o quickFilter no state global ou order list state, por hora focaremos em levar para a tela.
                    }}
                    className={cn(
                      "flex flex-col text-left p-4 rounded-2xl border border-transparent transition-all hover:shadow-md",
                      alert.bg, "hover:brightness-95"
                    )}
                  >
                     <span className={cn("text-2xl font-serif mb-1", alert.color)}>{alert.count}</span>
                     <span className="text-sm font-medium text-stone-700 leading-tight">{alert.label}</span>
                  </button>
               ))}
            </div>
         </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard title="Total Hoje" value={todayOrders.length} icon={<ShoppingBag className="text-stone-600 w-4 h-4 md:w-5 md:h-5" />} />
        <StatCard title="Shopee" value={shopeeCount} icon={<span className="text-orange-600 font-bold">S</span>} />
        <StatCard title="TikTok" value={tiktokCount} icon={<span className="text-slate-800 font-bold">T</span>} />
        <StatCard title="Com Obs" value={withNotesCount} icon={<AlertCircle className="text-amber-600 w-4 h-4 md:w-5 md:h-5" />} />
        
        <StatCard title="Pendentes" value={pendingCount} icon={<Clock className="text-blue-600 w-4 h-4 md:w-5 md:h-5" />} theme="blue" />
        <StatCard title="Separados" value={separatedCount} icon={<Package className="text-purple-600 w-4 h-4 md:w-5 md:h-5" />} theme="purple" />
        <StatCard title="Embalados" value={packedCount} icon={<CheckCircle2 className="text-pink-600 w-4 h-4 md:w-5 md:h-5" />} theme="pink" />
        <StatCard title="Enviados" value={sentCount} icon={<Truck className="text-emerald-600 w-4 h-4 md:w-5 md:h-5" />} theme="emerald" />
      </div>

      <div className="bg-white theme-card rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-medium text-stone-800">Pedidos de Hoje ({todayOrders.length})</h3>
          <button onClick={() => setActiveTab('orders')} className="text-sm text-amber-700 font-medium hover:underline">Ver todos</button>
        </div>
        
        {todayOrders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-stone-300" />
            </div>
            <p className="text-stone-500 font-medium">Nenhum pedido cadastrado ainda hoje.</p>
            <p className="text-stone-400 text-sm mt-1">Comece adicionando o primeiro pedido do dia.</p>
            <button 
              onClick={() => setActiveTab('add_order')}
              className="mt-6 text-amber-700 font-medium hover:underline"
            >
              + Adicionar Pedido
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-50/50 text-stone-500 font-medium border-b border-stone-100">
                <tr>
                  <th className="px-5 py-3 font-medium">Plataforma</th>
                  <th className="px-5 py-3 font-medium">Produto</th>
                  <th className="px-5 py-3 font-medium">Qtd</th>
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {todayOrders.map(order => (
                  <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-xs font-medium",
                        order.platform === 'Shopee' && "bg-orange-100 text-orange-800",
                        order.platform === 'TikTok' && "bg-slate-100 text-slate-800",
                        order.platform === 'Outro' && "bg-stone-100 text-stone-800"
                      )}>{order.platform}</span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap font-medium text-stone-700 max-w-[200px] truncate" title={order.product_name}>{order.product_name}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-stone-600">{order.quantity}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-stone-600 max-w-[150px] truncate" title={order.customer_name}>{order.customer_name}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", getStatusColor(order.status))}>
                          {order.status}
                        </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {order.status !== 'Finalizado' && (
                        <button 
                          onClick={() => handleMarkAsDone(order.id)}
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline px-2"
                        >
                          Concluir
                        </button>
                      )}
                      <button 
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-medium text-amber-700 hover:text-amber-800 hover:underline px-2 border-l border-stone-200"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, theme = 'stone' }: { title: string, value: number, icon: React.ReactNode, theme?: string }) {
  return (
    <div className="bg-white theme-card p-3 md:p-5 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between">
      <div>
        <p className="text-xs md:text-sm font-medium text-stone-500 mb-0.5 md:mb-1 truncate max-w-[80px] md:max-w-none">{title}</p>
        <p className="text-xl md:text-3xl font-serif text-stone-800">{value}</p>
      </div>
      <div className={cn(
        "w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0",
        theme === 'stone' && "bg-stone-50",
        theme === 'blue' && "bg-blue-50",
        theme === 'purple' && "bg-purple-50",
        theme === 'pink' && "bg-pink-50",
        theme === 'emerald' && "bg-emerald-50"
      )}>
        {icon}
      </div>
    </div>
  );
}

