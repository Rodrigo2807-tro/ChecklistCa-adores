import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(isoString: string) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR');
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'Novo pedido': return 'bg-blue-100 text-blue-800';
    case 'Em produção': return 'bg-amber-100 text-amber-800';
    case 'Produto pronto': return 'bg-orange-100 text-orange-800';
    case 'Separado': return 'bg-purple-100 text-purple-800';
    case 'Conferido': return 'bg-indigo-100 text-indigo-800';
    case 'Embalado': return 'bg-pink-100 text-pink-800';
    case 'Postado': return 'bg-teal-100 text-teal-800';
    case 'Finalizado': return 'bg-emerald-100 text-emerald-800';
    case 'Cancelado': return 'bg-red-100 text-red-800';
    default: return 'bg-stone-100 text-stone-800';
  }
}

export function getThemeColors(themeId: string) {
  const themes: Record<string, { border: string, bg: string }> = {
    'Artesanal Marrom': { border: '#b45309', bg: 'rgba(180,83,9,0.06)' },
    'Crochê Caramelo': { border: '#ea580c', bg: 'rgba(234,88,12,0.06)' },
    'Minimalista Cinza': { border: '#475569', bg: 'rgba(71,85,105,0.06)' },
    'Elegante Rosé': { border: '#e11d48', bg: 'rgba(225,29,72,0.06)' },
    'Verde Natural': { border: '#22c55e', bg: 'rgba(34,197,94,0.06)' },
    'Azul Sereno': { border: '#3b82f6', bg: 'rgba(59,130,246,0.06)' },
    'Terracota': { border: '#ef4444', bg: 'rgba(239,68,68,0.06)' },
    'Lavanda Suave': { border: '#8b5cf6', bg: 'rgba(139,92,246,0.06)' },
    'Dourado Clássico': { border: '#eab308', bg: 'rgba(234,179,8,0.06)' },
    'Preto Café': { border: '#525252', bg: 'rgba(82,82,82,0.06)' },
  };
  return themes[themeId] || themes['Artesanal Marrom'];
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case 'Urgente': return 'bg-red-100 text-red-800 border-red-200';
    case 'Alta': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-stone-100 text-stone-800 border-stone-200';
  }
}
