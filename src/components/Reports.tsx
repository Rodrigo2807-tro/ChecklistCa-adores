import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { isThisWeek, parseISO, format, isThisMonth, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { PageHeader } from './PageHeader';
import { Package, TrendingUp, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export function Reports() {
  const { orders, products } = useStore();

  const thisMonthOrders = useMemo(() => orders.filter(o => isThisMonth(parseISO(o.entry_date))), [orders]);
  
  // ================= 8.4 Relatório Financeiro =================
  const totalMonthValue = thisMonthOrders.reduce((acc, o) => acc + (o.price || 0), 0);
  const totalMonthProfit = thisMonthOrders.reduce((acc, o) => acc + (o.estimated_profit || 0), 0);
  const avgTicket = thisMonthOrders.length > 0 ? totalMonthValue / thisMonthOrders.length : 0;
  const noValueOrders = orders.filter(o => !o.price || o.price === 0).length;

  // ================= 8.2 Comparativo Shopee x TikTok =================
  const shopeeOrders = orders.filter(o => o.platform === 'Shopee');
  const tiktokOrders = orders.filter(o => o.platform === 'TikTok');
  const shopeeValue = shopeeOrders.reduce((acc, o) => acc + (o.price || 0), 0);
  const tiktokValue = tiktokOrders.reduce((acc, o) => acc + (o.price || 0), 0);
  
  // ================= 8.3 Relatório de Produção =================
  const inProduction = orders.filter(o => o.status === 'Em produção').length;
  const readyOrders = orders.filter(o => o.status === 'Produto pronto' || o.status === 'Separado' || o.status === 'Embalado').length;
  const lateOrders = orders.filter(o => !!o.due_date && new Date(o.due_date) < new Date() && !['Postado', 'Finalizado', 'Cancelado'].includes(o.status)).length;
  const urgentOrders = orders.filter(o => o.priority === 'Urgente' && !['Postado', 'Finalizado', 'Cancelado'].includes(o.status)).length;
  
  const productionOrders = orders.filter(o => o.status === 'Em produção' || o.status === 'Novo pedido');
  const customOrders = productionOrders.filter(o => o.order_type === 'Personalizado').length;
  const onDemandOrders = productionOrders.filter(o => o.order_type === 'Sob encomenda').length;

  // ================= 8.1 Ranking de Produtos =================
  const productRankingMap = orders.reduce((acc, order) => {
     if (!order.product_name || ['Cancelado'].includes(order.status)) return acc;
     const prod = acc[order.product_name] || { name: order.product_name, qty: 0, val: 0, platforms: {} as Record<string, number>, lastSale: order.entry_date };
     prod.qty += (order.quantity || 1);
     prod.val += (order.price || 0);
     prod.platforms[order.platform] = (prod.platforms[order.platform] || 0) + 1;
     if (new Date(order.entry_date) > new Date(prod.lastSale)) prod.lastSale = order.entry_date;
     acc[order.product_name] = prod;
     return acc;
  }, {} as Record<string, { name: string, qty: number, val: number, platforms: Record<string, number>, lastSale: string }>);
  
  const productRanking = Object.values(productRankingMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10); // Top 10

  // charts
  const platformData = [
    { name: 'Shopee', value: shopeeOrders.length },
    { name: 'TikTok', value: tiktokOrders.length },
    { name: 'Outro', value: orders.length - shopeeOrders.length - tiktokOrders.length },
  ].filter(d => d.value > 0);
  const COLORS = ['#ea580c', '#0f172a', '#b45309'];

  const daysMap = thisMonthOrders.reduce((acc, order) => {
    const day = format(parseISO(order.entry_date), 'dd/MM');
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const monthData = Object.keys(daysMap).sort().map(d => ({ name: d, pedidos: daysMap[d] }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in pb-24">
      <PageHeader 
        title="Relatórios Estratégicos" 
        description="Analise as vendas, entenda onde vêm seus clientes e acompanhe o fluxo de produção."
      />

      {/* Financeiro */}
      <section className="space-y-4">
         <h2 className="text-xl font-serif text-stone-800 flex items-center gap-2"><DollarSign className="w-5 h-5 text-amber-700"/> Visão Financeira (Mês Atual)</h2>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white theme-card p-5 rounded-2xl shadow-sm border border-stone-100">
              <p className="text-stone-500 text-xs font-bold uppercase tracking-wider">Faturamento</p>
              <p className="text-2xl font-serif text-stone-800 mt-1">R$ {totalMonthValue.toFixed(2)}</p>
            </div>
            <div className="bg-emerald-50 p-5 rounded-2xl shadow-sm border border-emerald-100/50">
              <p className="text-emerald-700/70 text-xs font-bold uppercase tracking-wider">Lucro Estimado</p>
              <p className="text-2xl font-serif text-emerald-800 mt-1">R$ {totalMonthProfit.toFixed(2)}</p>
            </div>
            <div className="bg-white theme-card p-5 rounded-2xl shadow-sm border border-stone-100">
              <p className="text-stone-500 text-xs font-bold uppercase tracking-wider">Ticket Médio</p>
              <p className="text-2xl font-serif text-stone-800 mt-1">R$ {avgTicket.toFixed(2)}</p>
            </div>
            <div className={cn("p-5 rounded-2xl shadow-sm border", noValueOrders > 0 ? "bg-rose-50 border-rose-100" : "bg-white border-stone-100 theme-card")}>
              <p className={cn("text-xs font-bold uppercase tracking-wider", noValueOrders > 0 ? "text-rose-700/70" : "text-stone-500")}>Pedidos S/ Valor</p>
              <p className={cn("text-2xl font-serif mt-1", noValueOrders > 0 ? "text-rose-800" : "text-stone-800")}>{noValueOrders}</p>
            </div>
         </div>
      </section>

      {/* Comparativo Shopee vs TikTok */}
      <section className="space-y-4">
         <h2 className="text-xl font-serif text-stone-800 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-amber-700"/> Comparativo: Shopee vs TikTok Shoppe</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white theme-card p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-6 md:col-span-1">
               <div className="h-32 w-32 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={platformData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={5} dataKey="value">
                        {platformData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="flex-1 space-y-2">
                 <div className="text-sm"><span className="inline-block w-3 h-3 rounded-full bg-orange-600 mr-2"></span>Shopee: <b>{shopeeOrders.length}</b></div>
                 <div className="text-sm"><span className="inline-block w-3 h-3 rounded-full bg-slate-900 mr-2"></span>TikTok: <b>{tiktokOrders.length}</b></div>
               </div>
            </div>

            <div className="bg-white theme-card p-6 rounded-2xl shadow-sm border border-stone-100 md:col-span-2 grid grid-cols-2 gap-6">
               <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-3">Performance Shopee</h4>
                  <ul className="space-y-2">
                     <li className="flex justify-between border-b border-stone-100 pb-1 text-sm"><span className="text-stone-500">Faturamento</span> <span className="font-medium">R$ {shopeeValue.toFixed(2)}</span></li>
                     <li className="flex justify-between border-b border-stone-100 pb-1 text-sm"><span className="text-stone-500">Ticket Médio</span> <span className="font-medium">R$ {shopeeOrders.length ? (shopeeValue/shopeeOrders.length).toFixed(2) : '0'}</span></li>
                  </ul>
               </div>
               <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-3">Performance TikTok</h4>
                  <ul className="space-y-2">
                     <li className="flex justify-between border-b border-stone-100 pb-1 text-sm"><span className="text-stone-500">Faturamento</span> <span className="font-medium">R$ {tiktokValue.toFixed(2)}</span></li>
                     <li className="flex justify-between border-b border-stone-100 pb-1 text-sm"><span className="text-stone-500">Ticket Médio</span> <span className="font-medium">R$ {tiktokOrders.length ? (tiktokValue/tiktokOrders.length).toFixed(2) : '0'}</span></li>
                  </ul>
               </div>
            </div>
         </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Relatório de Produção */}
         <section className="space-y-4">
            <h2 className="text-xl font-serif text-stone-800 flex items-center gap-2"><Clock className="w-5 h-5 text-amber-700"/> Volume de Produção</h2>
            <div className="bg-white theme-card p-6 rounded-3xl shadow-sm border border-stone-100">
               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-stone-50 p-4 rounded-2xl">
                     <div className="text-2xl font-serif text-stone-800">{inProduction}</div>
                     <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Em Produção</div>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-2xl">
                     <div className="text-2xl font-serif text-amber-700">{readyOrders}</div>
                     <div className="text-[10px] uppercase font-bold text-amber-900/60 tracking-wider">Prontos (P/ Enviar)</div>
                  </div>
               </div>
               
               <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-rose-50/50 border border-rose-100">
                     <span className="text-sm font-medium text-rose-800 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Atrasados</span>
                     <span className="font-bold text-rose-800">{lateOrders}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                     <span className="text-sm font-medium text-orange-800">Urgentes</span>
                     <span className="font-bold text-orange-800">{urgentOrders}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-stone-50 border border-stone-100">
                     <span className="text-sm font-medium text-stone-600">Sob Encomenda (Andamento)</span>
                     <span className="font-bold text-stone-800">{onDemandOrders}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-stone-50 border border-stone-100">
                     <span className="text-sm font-medium text-stone-600">Personalizado (Andamento)</span>
                     <span className="font-bold text-stone-800">{customOrders}</span>
                  </div>
               </div>
            </div>
         </section>

         {/* Ranking de Produtos */}
         <section className="space-y-4">
            <h2 className="text-xl font-serif text-stone-800 flex items-center gap-2"><Package className="w-5 h-5 text-amber-700"/> Ranking (Mais Vendidos)</h2>
            <div className="bg-white theme-card rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
               {productRanking.length === 0 ? (
                 <div className="p-8 text-center text-stone-500">Nenhum dado de vendas ainda.</div>
               ) : (
                 <table className="w-full text-left text-sm">
                   <thead className="bg-stone-50/80 border-b border-stone-100 text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                     <tr>
                       <th className="p-4">Produto</th>
                       <th className="p-4 text-center">Qtd</th>
                       <th className="p-4 text-right">Valor Gerado</th>
                     </tr>
                   </thead>
                   <tbody>
                     {productRanking.map((prod, i) => (
                       <tr key={i} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50">
                         <td className="p-4 font-medium text-stone-800">
                           <div className="truncate max-w-[180px]">{prod.name}</div>
                           <div className="text-[10px] text-stone-400 font-normal mt-0.5">Última: {format(parseISO(prod.lastSale), 'dd/MM/yy')}</div>
                         </td>
                         <td className="p-4 text-center font-bold text-stone-700">
                            {prod.qty}
                            <div className="text-[10px] text-stone-400 font-normal mt-0.5 max-w-[80px] mx-auto truncate">
                               {Object.entries(prod.platforms).map(([p, c]) => `${p.substring(0,2)}:${c}`).join(', ')}
                            </div>
                         </td>
                         <td className="p-4 text-right text-emerald-700 font-medium">R$ {prod.val.toFixed(2)}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
            </div>
         </section>
      </div>
      
      {monthData.length > 0 && (
         <section className="space-y-4">
           <h2 className="text-xl font-serif text-stone-800">Pedidos no Mês</h2>
           <div className="bg-white theme-card p-6 rounded-3xl shadow-sm border border-stone-100 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a8a29e', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#a8a29e', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f5f5f4'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="pedidos" fill="#b45309" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
           </div>
         </section>
      )}

    </div>
  );
}

