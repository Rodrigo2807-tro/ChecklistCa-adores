import React from 'react';
import { 
  Home, 
  PlusCircle, 
  ListOrdered, 
  History, 
  Tags, 
  BarChart2, 
  Settings,
  PackageSearch,
  Box
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onClose?: () => void;
}

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Painel do Dia', icon: Home },
  { id: 'add_order', label: 'Adicionar Pedido', icon: PlusCircle },
  { id: 'orders', label: 'Pedidos Registrados', icon: ListOrdered },
  { id: 'separation', label: 'Modo Separação', icon: PackageSearch },
  { id: 'packaging', label: 'Modo Embalagem', icon: Box },
  { id: 'history', label: 'Histórico', icon: History },
  { id: 'products', label: 'Produtos', icon: Tags },
  { id: 'reports', label: 'Relatórios', icon: BarChart2 },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export function Sidebar({ activeTab, setActiveTab, onClose }: SidebarProps) {
  return (
    <aside className="w-72 lg:w-64 bg-white lg:bg-stone-50 border-r border-stone-200 h-screen flex flex-col font-sans shadow-2xl lg:shadow-none">
      <div className="p-6 border-b border-stone-200 flex flex-col gap-1 items-center text-center relative">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 lg:hidden rounded-lg hover:bg-stone-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        )}
        <h1 className="logo-text text-4xl font-semibold tracking-wide drop-shadow-sm pb-1 flex flex-col items-center w-full mt-2 lg:mt-0">
          <span>Caçadores da</span>
          <span className="text-3xl mt-[-4px]">Arte</span>
        </h1>
        <p className="text-[10px] w-full text-center font-sans font-medium text-amber-800/60 uppercase tracking-[0.2em]">Controle de Produção</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (onClose) onClose();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-amber-100/50 text-amber-900" 
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-amber-700" : "text-stone-400")} />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-stone-200">
        <div className="bg-stone-100 p-3 rounded-lg flex items-center justify-between text-xs text-stone-500 font-mono">
          <span>SISTEMA ATIVO</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>
      </div>
    </aside>
  );
}
