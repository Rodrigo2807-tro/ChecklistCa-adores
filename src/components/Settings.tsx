import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { 
  Palette, 
  Settings2, 
  CheckSquare, 
  Tags, 
  Bell, 
  Download, 
  ShieldCheck, 
  Store, 
  TerminalSquare,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { Platform, OrderStatus, Priority, CATEGORIES, AppSettings } from '../types';

type TabId = 
  | 'appearance' 
  | 'preferences' 
  | 'checklist' 
  | 'products' 
  | 'alerts' 
  | 'backup' 
  | 'security' 
  | 'store' 
  | 'system'
  | 'images';

import { PageHeader } from './PageHeader';

export function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>('appearance');
  const [saveMessage, setSaveMessage] = useState('');

  const TABS = [
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'preferences', label: 'Preferências de Pedidos', icon: Settings2 },
    { id: 'images', label: 'Imagens em pedidos', icon: ImageIcon },
    { id: 'checklist', label: 'Checklist Padrão', icon: CheckSquare },
    { id: 'products', label: 'Produtos e Categorias', icon: Tags },
    { id: 'alerts', label: 'Alertas e Prazos', icon: Bell },
    { id: 'backup', label: 'Backup e Exportação', icon: Download },
    { id: 'security', label: 'Segurança dos Dados', icon: ShieldCheck },
    { id: 'store', label: 'Informações da Loja', icon: Store },
    { id: 'system', label: 'Sistema', icon: TerminalSquare },
  ] as const;

  const showSaveSuccess = () => {
    setSaveMessage('Configurações salvas com sucesso.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 pb-24">
      <PageHeader 
        title="Configurações" 
        description="Personalize o app, organize seus dados e ajuste o sistema para a rotina da Caçadores da Arte."
        className="mb-8"
      />

      {saveMessage && (
        <div className="fixed top-8 right-8 bg-emerald-50 text-emerald-800 px-6 py-4 rounded-xl border border-emerald-100 flex items-center gap-3 shadow-lg z-50 animate-in fade-in slide-in-from-top-4">
          <Check className="w-5 h-5 text-emerald-600" />
          <p className="font-medium text-sm">{saveMessage}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <nav className="flex flex-col p-2 space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all text-left",
                    isActive 
                      ? "bg-stone-50 text-amber-700 hover:bg-stone-50" 
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-amber-700" : "text-stone-400")} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0 bg-white rounded-3xl shadow-sm border border-stone-100 p-8">
          {activeTab === 'appearance' && <AppearanceSettings onSave={showSaveSuccess} />}
          {activeTab === 'preferences' && <OrderPreferencesSettings onSave={showSaveSuccess} />}
          {activeTab === 'images' && <ImageSettings onSave={showSaveSuccess} />}
          {activeTab === 'store' && <StoreInfoSettings onSave={showSaveSuccess} />}
          {activeTab === 'checklist' && <ChecklistSettings />}
          {activeTab === 'products' && <ProductsSettings />}
          {activeTab === 'alerts' && <AlertsSettings />}
          {activeTab === 'backup' && <BackupExportSettings />}
          {activeTab === 'security' && <SecuritySettings onSave={showSaveSuccess} />}
          {activeTab === 'system' && <SystemSettings />}
        </div>
      </div>
    </div>
  );
}

// Sub-components for Settings TABS

function AppearanceSettings({ onSave }: { onSave: () => void }) {
  const { settings, updateSettings } = useStore();
  
  const COLORS = [
    { id: 'Artesanal Marrom', colors: ['bg-[#78350f]', 'bg-[#b45309]', 'bg-[#fef3c7]'] }, // amber
    { id: 'Crochê Caramelo', colors: ['bg-[#9a3412]', 'bg-[#ea580c]', 'bg-[#ffedd5]'] }, // orange
    { id: 'Minimalista Cinza', colors: ['bg-[#1e293b]', 'bg-[#475569]', 'bg-[#f1f5f9]'] }, // slate
    { id: 'Elegante Rosé', colors: ['bg-[#9f1239]', 'bg-[#e11d48]', 'bg-[#ffe4e6]'] }, // rose
    { id: 'Verde Natural', colors: ['bg-[#14532d]', 'bg-[#22c55e]', 'bg-[#f0fdf4]'] }, // green
    { id: 'Azul Sereno', colors: ['bg-[#1e3a8a]', 'bg-[#3b82f6]', 'bg-[#eff6ff]'] }, // blue
    { id: 'Terracota', colors: ['bg-[#7f1d1d]', 'bg-[#ef4444]', 'bg-[#fef2f2]'] }, // red
    { id: 'Lavanda Suave', colors: ['bg-[#4c1d95]', 'bg-[#8b5cf6]', 'bg-[#f5f3ff]'] }, // violet
    { id: 'Dourado Clássico', colors: ['bg-[#854d0e]', 'bg-[#eab308]', 'bg-[#fefce8]'] }, // yellow
    { id: 'Preto Café', colors: ['bg-[#171717]', 'bg-[#525252]', 'bg-[#f5f5f5]'] }, // neutral
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      <section className="theme-section">
        <h3 className="text-lg font-serif text-stone-800 mb-4 border-b border-stone-100 pb-2">Temas de Cores do App</h3>
        <p className="text-sm text-stone-500 mb-6">Escolha a paleta de cores principal. (A aplicação completa do tema requer configurações CSS avançadas, atualmente demonstrativo).</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 justify-items-stretch gap-4">
          {COLORS.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                updateSettings({ colorTheme: theme.id });
                onSave();
              }}
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl border-2 transition-all w-full",
                settings.colorTheme === theme.id 
                  ? "border-amber-600 bg-amber-50/50" 
                  : "border-stone-100 hover:border-stone-200 bg-white"
              )}
            >
              <div className="flex -space-x-2">
                {theme.colors.map((colorClass, idx) => (
                  <div key={idx} className={cn("w-6 h-6 rounded-full border-2 border-white shadow-sm ring-1 ring-black/5", colorClass)} />
                ))}
              </div>
              <span className="text-sm font-medium text-stone-700">{theme.id}</span>
              {settings.colorTheme === theme.id && <Check className="w-5 h-5 text-amber-600 ml-auto" />}
            </button>
          ))}
        </div>
      </section>

     </div>
  );
}

function OrderPreferencesSettings({ onSave }: { onSave: () => void }) {
  const { settings, updateSettings } = useStore();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  const reqFields = settings.requiredFields || {
    imagem: false, codigo_pedido: false, cor_variacao: false, cliente: false, endereco: false, valor: false, prazo: false, plataforma: false, tipo_pedido: false
  };

  const updateReqField = (key: keyof typeof reqFields, value: boolean) => {
    updateSettings({ requiredFields: { ...reqFields, [key]: value }});
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in">
      <section className="space-y-6">
        <h3 className="text-lg font-serif text-stone-800 mb-4 border-b border-stone-100 pb-2">Campos Obrigatórios no Cadastro</h3>
        <p className="text-sm text-stone-500 mb-4">Selecione quais campos devem ser exigidos para Salvar um pedido.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {Object.keys(reqFields).map((k) => (
             <label key={k} className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 bg-stone-50/50 hover:bg-stone-50 cursor-pointer transition-colors">
               <input 
                 type="checkbox" 
                 checked={reqFields[k as keyof typeof reqFields]} 
                 onChange={(e) => updateReqField(k as keyof typeof reqFields, e.target.checked)}
                 className="w-5 h-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500" 
               />
               <span className="text-sm font-medium text-stone-700 capitalize">{k.replace('_', ' ')}</span>
             </label>
           ))}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-lg font-serif text-stone-800 mb-4 border-b border-stone-100 pb-2">Padrões para Novos Pedidos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Plataforma Padrão</label>
            <select 
              value={settings.defaultPlatform} 
              onChange={e => updateSettings({ defaultPlatform: e.target.value as Platform | '' })}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
            >
              <option value="">Nenhuma (Forçar Preenchimento)</option>
              <option value="Shopee">Shopee</option>
              <option value="TikTok">TikTok Shop</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Categoria Padrão</label>
            <select 
              value={settings.defaultCategory} 
              onChange={e => updateSettings({ defaultCategory: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
            >
              <option value="">Selecione...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Status Padrão</label>
            <select 
              value={settings.defaultStatus} 
              onChange={e => updateSettings({ defaultStatus: e.target.value as OrderStatus })}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
            >
              <option value="Novo pedido">Novo pedido</option>
              <option value="Em produção">Em produção</option>
              <option value="Produto pronto">Produto pronto</option>
              <option value="Separado">Separado</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Prioridade Padrão</label>
            <select 
              value={settings.defaultPriority} 
              onChange={e => updateSettings({ defaultPriority: e.target.value as Priority })}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
            >
              <option value="Normal">Normal</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Prazo de Produção Padrão (Dias)</label>
            <input 
              type="number" min="0" step="1"
              value={settings.defaultProductionDays} 
              onChange={e => updateSettings({ defaultProductionDays: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
            />
          </div>
        </div>
      </section>

      <div className="pt-4 flex justify-end">
        <button type="submit" className="px-6 py-2.5 rounded-xl font-medium text-white bg-amber-700 hover:bg-amber-800 transition-colors shadow-sm">
          Salvar Preferências
        </button>
      </div>
    </form>
  );
}

function ImageSettings({ onSave }: { onSave: () => void }) {
  const { settings, updateSettings } = useStore();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in">
      <section className="space-y-6">
        <h3 className="text-lg font-serif text-stone-800 mb-4 border-b border-stone-100 pb-2">Imagens em Pedidos</h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.enableImageUpload} 
              onChange={e => updateSettings({ enableImageUpload: e.target.checked })}
              className="w-5 h-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500" 
            />
            <span className="font-medium text-stone-800">Ativar anexos de imagem nos pedidos</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer pl-8">
            <input 
              type="checkbox" 
              checked={settings.requireImage} 
              onChange={e => updateSettings({ requireImage: e.target.checked })}
              disabled={!settings.enableImageUpload}
              className="w-5 h-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500 disabled:opacity-50" 
            />
            <span className={cn("font-medium", settings.enableImageUpload ? "text-stone-800" : "text-stone-400")}>
               Tornar imagem obrigatória para salvar/finalizar pedido
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer pl-8">
            <input 
              type="checkbox" 
              checked={settings.showMainImageOnCards} 
              onChange={e => updateSettings({ showMainImageOnCards: e.target.checked })}
              disabled={!settings.enableImageUpload}
              className="w-5 h-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500 disabled:opacity-50" 
            />
            <span className={cn("font-medium", settings.enableImageUpload ? "text-stone-800" : "text-stone-400")}>
               Exibir a imagem principal nos cards de pedidos (Histórico e Registrados)
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-1.5 pl-8">
            <label className="text-sm font-medium text-stone-700">Quantidade Máxima de Imagens por Pedido</label>
            <input 
              type="number" min="1" max="20" step="1"
              value={settings.maxImagesPerOrder} 
              onChange={e => updateSettings({ maxImagesPerOrder: parseInt(e.target.value) || 10 })}
              disabled={!settings.enableImageUpload}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none disabled:opacity-50"
            />
            <p className="text-xs text-stone-500">Recomendado: 10.</p>
          </div>
        </div>
      </section>

      <div className="pt-4 flex justify-end">
        <button type="submit" className="px-6 py-2.5 rounded-xl font-medium text-white bg-amber-700 hover:bg-amber-800 transition-colors shadow-sm">
          Salvar Configurações
        </button>
      </div>
    </form>
  );
}

function StoreInfoSettings({ onSave }: { onSave: () => void }) {
  const { settings, updateSettings } = useStore();
  const [storeInfo, setStoreInfo] = useState(settings.storeInfo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ storeInfo });
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in">
      <section className="space-y-6">
        <h3 className="text-lg font-serif text-stone-800 mb-4 border-b border-stone-100 pb-2">Dados da Empresa</h3>
        <p className="text-sm text-stone-500 mb-6">Estas informações podem aparecer em relatórios, PDFs ou exportações futuras.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Nome da Loja</label>
            <input 
              type="text" 
              value={storeInfo.name} onChange={e => setStoreInfo({...storeInfo, name: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Responsável</label>
            <input 
              type="text" 
              value={storeInfo.owner} onChange={e => setStoreInfo({...storeInfo, owner: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Telefone / WhatsApp</label>
            <input 
              type="text" 
              value={storeInfo.phone} onChange={e => setStoreInfo({...storeInfo, phone: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Instagram</label>
            <input 
              type="text" 
              value={storeInfo.instagram} onChange={e => setStoreInfo({...storeInfo, instagram: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
              placeholder="@"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-stone-700">Link da Loja (Shopee/Principal)</label>
            <input 
              type="url" 
              value={storeInfo.shopeeLink} onChange={e => setStoreInfo({...storeInfo, shopeeLink: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-stone-700">Mensagem Padrão (Rodapé de Relatórios)</label>
            <textarea 
              rows={2}
              value={storeInfo.reportNotes} onChange={e => setStoreInfo({...storeInfo, reportNotes: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none resize-none"
            />
          </div>
        </div>
      </section>

      <div className="pt-4 flex justify-end">
        <button type="submit" className="px-6 py-2.5 rounded-xl font-medium text-white bg-amber-700 hover:bg-amber-800 transition-colors shadow-sm">
          Atualizar Dados
        </button>
      </div>
    </form>
  );
}

function BackupExportSettings() {
  const { orders, products, importData, updateSettings } = useStore();

  const handleExportJson = () => {
    const backupData = {
      orders,
      products,
      exportDate: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", `backup_cacadores_da_arte_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
    
    updateSettings({ lastBackupDate: new Date().toISOString() });
  };

  const handleExportCsv = () => {
    if (orders.length === 0) return alert('Nenhum dado para exportar.');
    const headers = Object.keys(orders[0]).join(',');
    const rows = orders.map(order => Object.values(order).map(val => typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : typeof val === 'object' ? `"${JSON.stringify(val).replace(/"/g, '""')}"` : val).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + '\n' + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pedidos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <section className="space-y-6">
        <h3 className="text-lg font-serif text-stone-800 border-b border-stone-100 pb-2">Exportação Rápida</h3>
        
        <div className="flex flex-wrap gap-4">
           <button onClick={handleExportJson} className="px-5 py-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium flex items-center gap-2">
             <Download className="w-5 h-5 text-stone-400" />
             Exportar JSON (Backup Completo)
           </button>
           <button onClick={handleExportCsv} className="px-5 py-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium flex items-center gap-2">
             <Download className="w-5 h-5 text-stone-400" />
             Exportar CSV (Excel)
           </button>
        </div>
      </section>

      <section className="space-y-6 pt-6 border-t border-stone-100">
        <div>
          <h3 className="text-lg font-serif text-stone-800 border-b border-stone-100 pb-2 mb-4">Restaurar Backup</h3>
          <p className="text-sm text-stone-500 mb-4">
            Selecione um arquivo .json gerado anteriormente para restaurar os pedidos e produtos.
            <strong> Atenção: Isso não apaga os dados atuais, apenas adiciona e mescla os dados novos.</strong>
          </p>
          <div className="flex gap-4 items-center">
            <label className="px-5 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium cursor-pointer transition-colors shadow-sm">
              Selecionar Arquivo JSON
              <input type="file" accept=".json" className="hidden" onChange={(e) => {
                 if(e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                       try {
                         const data = JSON.parse(ev.target?.result as string);
                         // Handle two formats: old array or new object
                         if (Array.isArray(data)) {
                            importData({ orders: data, products: [] });
                         } else if (data.orders || data.products) {
                            importData({ orders: data.orders || [], products: data.products || [] });
                         }
                         alert('Backup restaurado com sucesso! ' + ((data.orders?.length || data.length) || 0) + ' pedidos processados.');
                       } catch(err) {
                         alert('Arquivo inválido ou corrompido.');
                       }
                    }
                    reader.readAsText(file);
                 }
              }} />
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}

function SecuritySettings({ onSave }: { onSave: () => void }) {
  const { settings, updateSettings } = useStore();
  const [confirmDelete, setConfirmDelete] = useState(settings.confirmDeleteOrder !== false);
  const [blockFinalized, setBlockFinalized] = useState(settings.blockDeleteFinalizedOrders !== false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      confirmDeleteOrder: confirmDelete,
      blockDeleteFinalizedOrders: blockFinalized
    });
    onSave();
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in">
      <section className="space-y-6">
        <h3 className="text-lg font-serif text-stone-800 mb-4 border-b border-stone-100 pb-2">Proteção Contra Exclusão Acidental</h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={confirmDelete} 
              onChange={e => setConfirmDelete(e.target.checked)} 
              className="w-5 h-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500" 
            />
            <div className="flex flex-col">
              <span className="font-medium text-stone-800">Confirmar ao excluir pedido</span>
              <span className="text-sm text-stone-500">Exibirá um aviso antes de apagar qualquer pedido.</span>
            </div>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={blockFinalized} 
              onChange={e => setBlockFinalized(e.target.checked)} 
              className="w-5 h-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500" 
            />
            <div className="flex flex-col">
              <span className="font-medium text-stone-800">Impedir exclusão de finalizados</span>
              <span className="text-sm text-stone-500">Pedidos finalizados ou postados não poderão ser apagados, apenas arquivados.</span>
            </div>
          </label>
        </div>
      </section>
      
      <section className="space-y-6 pt-6 border-t border-stone-100">
         <h3 className="text-lg font-serif text-stone-800 mb-4 border-b border-stone-100 pb-2">Log de Alterações Básico</h3>
         <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-sm text-stone-500">
            Nenhuma alteração crítica detectada hoje.
         </div>
      </section>

      <div className="pt-4 flex justify-end">
        <button type="submit" className="px-6 py-2.5 rounded-xl font-medium text-white bg-amber-700 hover:bg-amber-800 transition-colors shadow-sm">
          Salvar Permissões
        </button>
      </div>
    </form>
  );
}

function SystemSettings() {
  const { orders, products } = useStore();

  return (
    <div className="space-y-8 animate-in fade-in">
      <section className="space-y-6">
        <h3 className="text-lg font-serif text-stone-800 mb-4 border-b border-stone-100 pb-2">Informações do Sistema</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
             <p className="text-sm text-stone-500 mb-1">Total de Pedidos Gerados</p>
             <p className="text-2xl font-serif text-stone-800">{orders.length}</p>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
             <p className="text-sm text-stone-500 mb-1">Produtos Cadastrados</p>
             <p className="text-2xl font-serif text-stone-800">{products.length}</p>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
             <p className="text-sm text-stone-500 mb-1">Banco de Dados</p>
             <p className="text-lg font-medium text-emerald-700 mt-1 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
               Local (Ativo)
             </p>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-100">
           <h4 className="text-red-800 font-medium mb-2">Zona de Perigo</h4>
           <p className="text-sm text-stone-500 max-w-xl mb-4">
             As ações abaixo são destrutivas e não podem ser desfeitas. Faça backup dos seus dados antes de prosseguir.
           </p>
           <button 
             onClick={() => {
               if ((window as any)._resetConfirm) {
                 localStorage.removeItem('cacadores-da-arte-storage');
                 window.location.reload();
               } else {
                 (window as any)._resetConfirm = true;
                 alert('Atenção: Para APAGAR TODOS OS DADOS, clique novamente no botão "Redefinir" nos próximos 3 segundos.');
                 setTimeout(() => { (window as any)._resetConfirm = false; }, 3000);
               }
             }}
             className="px-5 py-2.5 rounded-xl font-medium text-red-700 border border-red-200 hover:bg-red-50 transition-colors"
           >
             Redefinir e Limpar Todo o Aplicativo
           </button>
        </div>
      </section>
    </div>
  );
}

function ChecklistSettings() {
  const { settings, updateSettings } = useStore();
  
  const checklistKeys = [
     { id: 'produto_correto', label: 'Produto correto' },
     { id: 'imagem_conferida', label: 'Imagem conferida' },
     { id: 'cor_correta', label: 'Cor correta' },
     { id: 'quantidade_correta', label: 'Quantidade correta' },
     { id: 'cliente_conferido', label: 'Cliente conferido' },
     { id: 'plataforma_conferida', label: 'Plataforma conferida' },
     { id: 'codigo_conferido', label: 'Código do pedido conferido' },
     { id: 'embalagem_feita', label: 'Embalagem concluída' },
     { id: 'brinde_incluido', label: 'Bilhete/brinde incluído' },
     { id: 'etiqueta_conferida', label: 'Etiqueta de envio conferida' },
     { id: 'pronto_para_postagem', label: 'Pronto para postagem' }
  ];

  const defaultItems = settings.defaultChecklistItems || {};

  const handleToggle = (key: string) => {
     updateSettings({ 
       defaultChecklistItems: {
         ...defaultItems,
         [key]: !defaultItems[key]
       }
     });
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <section className="space-y-6">
        <h3 className="text-lg font-serif text-stone-800 mb-4 border-b border-stone-100 pb-2">Itens Padrão do Checklist</h3>
        <p className="text-sm text-stone-500 mb-4">Escolha os itens que devem vir checados por padrão em TODO novo pedido.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {checklistKeys.map((item) => (
             <label key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 bg-stone-50/50 hover:bg-stone-50 cursor-pointer transition-colors">
               <input 
                 type="checkbox" 
                 checked={!!defaultItems[item.id]} 
                 onChange={() => handleToggle(item.id)}
                 className="w-5 h-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500" 
               />
               <span className="text-sm font-medium text-stone-700">{item.label}</span>
             </label>
           ))}
        </div>
      </section>
    </div>
  );
}

function ProductsSettings() {
  return (
    <div className="space-y-8 animate-in fade-in">
      <section className="space-y-6">
        <h3 className="text-lg font-serif text-stone-800 mb-4 border-b border-stone-100 pb-2">Preenchimento Rápido</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
            <span className="font-medium text-stone-800">Ativar sugestão de produto ao digitar</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
            <span className="font-medium text-stone-800">Mostrar produtos favoritos no topo da lista</span>
          </label>
        </div>
      </section>
    </div>
  );
}

function AlertsSettings() {
  const { settings, updateSettings } = useStore();

  const toggleAlert = (key: keyof AppSettings) => {
    updateSettings({ [key]: !settings[key] });
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <section className="space-y-6">
        <h3 className="text-lg font-serif text-stone-800 mb-4 border-b border-stone-100 pb-2">Configurações de Alerta e Destaque</h3>
        <p className="text-sm text-stone-500 mb-4">Ative ou desative itens que receberão avisos visuais vermelhos/amarelos pelo aplicativo.</p>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={!!settings.alert1DayBefore} onChange={() => toggleAlert('alert1DayBefore')} className="w-5 h-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
            <span className="font-medium text-stone-800">Avisar 1 dia antes do prazo</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={!!settings.alertOnShippingDay} onChange={() => toggleAlert('alertOnShippingDay')} className="w-5 h-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
            <span className="font-medium text-stone-800">Avisar no dia do envio/postagem</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={!!settings.highlightUrgent} onChange={() => toggleAlert('highlightUrgent')} className="w-5 h-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
            <span className="font-medium text-stone-800">Destacar pedidos com prioridade Urgente</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={!!settings.highlightNoImage} onChange={() => toggleAlert('highlightNoImage')} className="w-5 h-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
            <span className="font-medium text-stone-800">Destacar pedidos sem imagem</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={!!settings.highlightNoCode} onChange={() => toggleAlert('highlightNoCode')} className="w-5 h-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
            <span className="font-medium text-stone-800">Destacar pedidos sem código</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={!!settings.highlightIncompleteChecklist} onChange={() => toggleAlert('highlightIncompleteChecklist')} className="w-5 h-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
            <span className="font-medium text-stone-800">Destacar checklist incompleto nos Modos (Separação/Embalagem)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={!!settings.highlightLate} onChange={() => toggleAlert('highlightLate')} className="w-5 h-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
            <span className="font-medium text-stone-800">Destacar pedidos atrasados</span>
          </label>
        </div>
      </section>
    </div>
  );
}
