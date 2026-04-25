import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Product, CATEGORIES } from '../types';
import { cn } from '../lib/utils';
import { 
  Plus, Search, Filter, LayoutGrid, List, Tag, EyeOff, X,
  MoreVertical, Edit2, Copy, Trash2, Heart, ExternalLink, Package 
} from 'lucide-react';

import { v4 as uuidv4 } from 'uuid';

import { PageHeader } from './PageHeader';

export function Products({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const { products, orders, updateProduct, deleteProduct, addProduct } = useStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const activeProducts = products.filter(p => p.status !== 'Inativo' && p.status !== 'Esgotado').length;
  const inactiveProducts = products.length - activeProducts;

  // Encontrar produto mais usado
  const productUsageCount = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => {
      if (o.product_id) {
         counts[o.product_id] = (counts[o.product_id] || 0) + 1;
      }
    });
    return counts;
  }, [orders]);

  const mostUsedProductId = Object.keys(productUsageCount).sort((a, b) => productUsageCount[b] - productUsageCount[a])[0];
  const mostUsedProduct = products.find(p => p.id === mostUsedProductId)?.name || '-';

  const filteredProducts = products.filter(p => {
    const name = p.name || '';
    const sku = p.sku || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus || (!p.status && filterStatus === 'Ativo');
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    // Favoritos primeiro
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDuplicate = (product: Product) => {
    const newProduct: Product = {
      ...product,
      id: uuidv4(),
      name: `${product.name} (Cópia)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    addProduct(newProduct);
  };

  const handleDelete = (id: string) => {
    // Verifica se está em uso
    const inUse = orders.some(o => o.product_id === id);
    if (inUse) {
      alert('Este produto já está vinculado a pedidos. Ele será apenas inativado para manter o histórico.');
      updateProduct(id, { status: 'Inativo' });
      return;
    }
    
    deleteProduct(id);
  };

  const createOrderFromProduct = (product: Product) => {
    // Navigate to add_order tab
    // We could pass product as initial data but for simplicity we rely on a custom event
    const evt = new CustomEvent('navigate_with_product', { detail: product });
    document.dispatchEvent(evt);
    if (setActiveTab) setActiveTab('add_order');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-24 animate-in fade-in">
      <PageHeader 
        title="Produtos Cadastrados" 
        description="Organize seus produtos artesanais, variações, cores e informações usadas nos pedidos."
      >
        <button 
          onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
          className="bg-amber-800 hover:bg-amber-900 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </PageHeader>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-center overflow-hidden min-w-0">
            <span className="text-stone-500 text-xs sm:text-sm mb-1 truncate block">Total de Produtos</span>
            <span className="text-xl sm:text-2xl font-serif text-stone-800 truncate block">{products.length}</span>
         </div>
         <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-center overflow-hidden min-w-0">
            <span className="text-stone-500 text-xs sm:text-sm mb-1 truncate block">Ativos</span>
            <span className="text-xl sm:text-2xl font-serif text-emerald-700 truncate block">{activeProducts}</span>
         </div>
         <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-center overflow-hidden min-w-0">
            <span className="text-stone-500 text-xs sm:text-sm mb-1 truncate block">Inativos</span>
            <span className="text-xl sm:text-2xl font-serif text-stone-600 truncate block">{inactiveProducts}</span>
         </div>
         <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-center overflow-hidden min-w-0">
            <span className="text-stone-500 text-xs sm:text-sm mb-1 truncate block">Produto + Vendido</span>
            <span className="text-lg sm:text-lg font-serif text-stone-800 truncate block" title={mostUsedProduct}>{mostUsedProduct}</span>
         </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-stone-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar produtos, SKU, categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 appearance-none outline-none custom-select min-w-[140px] flex-1 text-stone-700"
          >
            <option value="all">Categorias</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 appearance-none outline-none custom-select min-w-[120px] flex-1 text-stone-700"
          >
            <option value="all">Status</option>
            <option value="Ativo">Ativos</option>
            <option value="Sob encomenda">Sob encomenda</option>
            <option value="Inativo">Inativos</option>
            <option value="Esgotado">Esgotado</option>
          </select>

          <div className="flex bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={cn("p-2 rounded-lg transition-colors", viewMode === 'grid' ? "bg-white shadow-sm text-amber-700" : "text-stone-500 hover:text-stone-700")}
              title="Visualização em Grade"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn("p-2 rounded-lg transition-colors", viewMode === 'list' ? "bg-white shadow-sm text-amber-700" : "text-stone-500 hover:text-stone-700")}
              title="Visualização em Lista"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
         <div className="bg-white theme-card rounded-3xl border border-stone-100 p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-stone-300" />
            </div>
            <p className="text-xl font-serif text-stone-800 mb-2">Nenhum produto encontrado</p>
            <p className="text-stone-500 mb-6">Cadastre novos produtos ou ajuste os filtros.</p>
            <button 
              onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
              className="px-6 py-3 rounded-xl font-medium text-white bg-amber-700 hover:bg-amber-800 transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Cadastrar Produto
            </button>
         </div>
      ) : (
         viewMode === 'grid' ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {filteredProducts.map(product => (
               <div key={product.id} className="bg-white theme-card rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden group">
                  <div className="h-40 bg-stone-100 relative flex flex-col justify-end p-4 overflow-hidden">
                     <div className="absolute inset-0 w-full h-full text-center text-stone-300 flex items-center justify-center z-0">
                       {product.image_url ? (
                         <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                       ) : (
                         <Package className="w-16 h-16 mx-auto opacity-50" />
                       )}
                     </div>
                     {product.favorite && (
                       <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 flex items-center gap-1 rounded-lg shadow-sm text-xs font-medium text-rose-600 z-10">
                         <Heart className="w-3.5 h-3.5 fill-current" /> Favorito
                       </div>
                     )}
                     <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                        {['Ativo', undefined].includes(product.status) 
                          ? <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-lg font-medium shadow-sm">Ativo</span>
                          : <span className="bg-stone-200 text-stone-600 text-xs px-2 py-1 rounded-lg font-medium shadow-sm">{product.status}</span>}
                     </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                     <div className="flex justify-between items-start mb-1">
                        <div className="text-xs font-medium text-amber-700">{product.category}</div>
                        {(product.stock_quantity && product.stock_quantity > 0) ? (
                           <div className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold ml-2 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              {product.stock_quantity} pronto{(product.stock_quantity > 1) ? 's' : ''}
                           </div>
                        ) : null}
                     </div>
                     <h3 className="font-serif text-lg text-stone-800 leading-tight mb-2">{product.name}</h3>
                     <p className="text-stone-500 text-sm line-clamp-2 min-h-[40px]">
                       {product.description || (Array.isArray(product.colors) && product.colors.length > 0 ? `Cores: ${product.colors.join(', ')}` : 'Sem descrição')}
                     </p>
                     
                     <div className="mt-auto pt-4 flex items-end justify-between">
                        <div>
                           <span className="text-xs text-stone-500 block">Preço</span>
                           <span className="font-medium text-stone-800">
                             {product.suggested_price ? `R$ ${Number(product.suggested_price).toFixed(2)}` : '--'}
                           </span>
                        </div>
                        
                        <div className="flex gap-1">
                          <button onClick={() => createOrderFromProduct(product)} className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Criar Pedido">
                             <Plus className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleEdit(product)} className="p-2 text-stone-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors" title="Editar">
                             <Edit2 className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                             <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                     </div>
                  </div>
               </div>
             ))}
           </div>
         ) : (
           <div className="bg-white theme-card rounded-2xl border border-stone-100 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider border-b border-stone-100">
                    <th className="px-6 py-4 font-medium">Produto</th>
                    <th className="px-6 py-4 font-medium">Categoria</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Preço</th>
                    <th className="px-6 py-4 font-medium">Cores/Variações</th>
                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.favorite && <Heart className="w-4 h-4 text-rose-500 fill-current" />}
                          <span className="font-medium text-stone-800">{product.name}</span>
                          {product.sku && <span className="text-xs text-stone-400">({product.sku})</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-stone-600">{product.category}</td>
                      <td className="px-6 py-4">
                         {['Ativo', undefined].includes(product.status) 
                            ? <span className="text-emerald-700 font-medium">Ativo</span>
                            : <span className="text-stone-500">{product.status}</span>}
                      </td>
                      <td className="px-6 py-4 text-stone-800">
                        {product.suggested_price ? `R$ ${Number(product.suggested_price).toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-stone-500 max-w-[200px] truncate">
                        {(Array.isArray(product.colors) && product.colors.length > 0) ? product.colors.join(', ') : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 text-stone-400">
                          <button onClick={() => createOrderFromProduct(product)} className="p-1.5 hover:text-emerald-600 bg-white hover:bg-emerald-50 rounded-lg border border-transparent shadow-sm hover:border-emerald-100 transition-all">
                            <Plus className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDuplicate(product)} className="p-1.5 hover:text-stone-800 bg-white hover:bg-stone-100 rounded-lg border border-transparent shadow-sm hover:border-stone-200 transition-all">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEdit(product)} className="p-1.5 hover:text-amber-700 bg-white hover:bg-amber-50 rounded-lg border border-transparent shadow-sm hover:border-amber-100 transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-1.5 hover:text-red-600 bg-white hover:bg-red-50 rounded-lg border border-transparent shadow-sm hover:border-red-100 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
         )
      )}

      {/* Modal de Formulário Simplificado */}
      {isFormOpen && (
         <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center md:p-6 animate-in fade-in">
           <div className="bg-white rounded-t-3xl md:rounded-3xl mt-12 md:mt-0 shadow-xl w-full max-w-2xl h-[calc(100svh-3rem)] md:h-auto md:max-h-[90vh] border border-stone-100 flex flex-col overflow-hidden">
              <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-stone-100 z-10 flex justify-between items-center shrink-0">
                 <h3 className="text-xl font-serif text-stone-800">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
                 <button onClick={() => setIsFormOpen(false)} className="text-stone-400 hover:text-stone-700 text-2xl leading-none">&times;</button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                 <ProductForm 
                   initialData={editingProduct}
                   onSave={(prod) => {
                     if (editingProduct) updateProduct(prod.id, prod);
                     else addProduct(prod);
                     setIsFormOpen(false);
                   }}
                   onCancel={() => setIsFormOpen(false)}
                 />
              </div>
           </div>
         </div>
      )}

    </div>
  );
}

function ProductForm({ initialData, onSave, onCancel }: { initialData: Product | null, onSave: (p: Product) => void, onCancel: () => void }) {
  // Simplified Form state
  const [formData, setFormData] = useState<Partial<Product>>(initialData || {
    name: '',
    category: CATEGORIES[0],
    status: 'Ativo',
    favorite: false,
    sku: '',
    description: '',
    colors: [],
    suggested_price: 0,
    average_production_time: 1,
    active: true
  });

  const [colorInput, setColorInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const updateColor = (idx: number, value: string) => {
    const newColors = [...(formData.colors || [])];
    newColors[idx] = value;
    setFormData(prev => ({ ...prev, colors: newColors }));
  };

  const addColorField = () => {
    setFormData(prev => ({ ...prev, colors: [...(formData.colors || []), ''] }));
  };

  const removeColor = (idx: number) => {
    setFormData(prev => ({ ...prev, colors: (prev.colors||[]).filter((_, i) => i !== idx) }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) return alert('Nome e categoria são obrigatórios.');
    
    onSave({
      ...formData,
      suggested_price: formData.suggested_price ? parseFloat(formData.suggested_price.toString()) : 0,
      average_production_time: formData.average_production_time ? parseFloat(formData.average_production_time.toString()) : 0,
      colors: (formData.colors || []).filter(c => c.trim() !== ''),
      id: formData.id || uuidv4(),
      created_at: formData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Product);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-stone-700">Nome do Produto *</label>
            <input 
              name="name" value={formData.name || ''} onChange={handleChange}
              placeholder="Ex: Jogo Americano Bico Rendado"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none" required
            />
         </div>
         
         <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Categoria *</label>
            <select 
              name="category" value={formData.category || ''} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none" required
            >
               {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
         </div>

         <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Status</label>
            <select 
              name="status" value={formData.status || 'Ativo'} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
            >
               <option value="Ativo">Ativo</option>
               <option value="Sob encomenda">Sob encomenda</option>
               <option value="Pausado">Pausado</option>
               <option value="Esgotado">Esgotado</option>
               <option value="Inativo">Inativo</option>
            </select>
         </div>

         <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Tempo Médio Produção (Dias)</label>
            <input 
              name="average_production_time" type="number" min="0" value={formData.average_production_time || ''} onChange={handleChange} placeholder="Opcional"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
            />
         </div>

         <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Preço do Produto (R$)</label>
            <input 
              type="number" step="0.01" min="0"
              name="suggested_price" value={formData.suggested_price || 0} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
            />
         </div>

         <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-stone-700">Descrição Comercial</label>
            <textarea 
              name="description" value={formData.description || ''} onChange={handleChange} rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
            ></textarea>
         </div>
         
         <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-stone-700">Variações (Cor/Tamanho) separadas por vírgula</label>
            <input 
              name="variations" value={formData.variations?.join(', ') || ''} onChange={e => setFormData({...formData, variations: e.target.value.split(',').map(v => v.trim()).filter(Boolean)})}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
            />
         </div>

         <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Status do Estoque</label>
            <select 
              name="stock_status" value={formData.stock_status || 'Sob encomenda'} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
            >
               <option value="Pronto para envio">Pronto para envio</option>
               <option value="Sob encomenda">Sob encomenda</option>
               <option value="Esgotado">Esgotado</option>
               <option value="Pausado">Pausado</option>
            </select>
         </div>

         <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Quantidade Pronta</label>
            <input 
              type="number" min="0" name="stock_quantity" value={formData.stock_quantity || 0} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
            />
         </div>
         
         <div className="col-span-1 md:col-span-2"><hr className="border-stone-100 my-4" /><h3 className="text-lg font-serif text-stone-800">Ficha de Produção</h3></div>
         
         <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Material / Fio Usado</label>
            <input 
              name="materials" value={formData.materials || ''} onChange={handleChange} placeholder="Ex: Fio de Malha Premium"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
            />
         </div>
         
         <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Medida Final / Peso</label>
            <div className="flex gap-2">
              <input 
                name="size" value={formData.size || ''} onChange={handleChange} placeholder="Medida (ex: 30cm)"
                className="w-1/2 px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
              />
              <input 
                name="weight" value={formData.weight || ''} onChange={handleChange} placeholder="Peso (ex: 150g)"
                className="w-1/2 px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
              />
            </div>
         </div>
         
         <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Dificuldade</label>
            <select 
              name="difficulty" value={formData.difficulty || 'Média'} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
            >
               <option value="Fácil">Fácil</option>
               <option value="Média">Média</option>
               <option value="Avançada">Avançada</option>
            </select>
         </div>

         <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-stone-700">Detalhes de Confecção / Acabamento</label>
            <textarea 
              name="production_notes" value={formData.production_notes || ''} onChange={handleChange} rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
            ></textarea>
         </div>

         <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-stone-700">Cuidados com a Peça</label>
            <textarea 
              name="care_instructions" value={formData.care_instructions || ''} onChange={handleChange} rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
            ></textarea>
         </div>

         <div className="col-span-1 md:col-span-2"><hr className="border-stone-100 my-4" /><h3 className="text-lg font-serif text-stone-800">Preços e Custos</h3></div>
         
         <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Preço Shopee (R$)</label>
            <input 
              type="number" step="0.01" min="0" name="shopee_price" value={formData.shopee_price || 0} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
            />
         </div>
         
         <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Preço TikTok (R$)</label>
            <input 
              type="number" step="0.01" min="0" name="tiktok_price" value={formData.tiktok_price || 0} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
            />
         </div>

         <div className="space-y-1.5">
            <label className="text-sm font-medium text-rose-700">Custo Material (R$)</label>
            <input 
              type="number" step="0.01" min="0" name="material_cost" value={formData.material_cost || 0} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 outline-none"
            />
         </div>

         <div className="space-y-1.5">
            <label className="text-sm font-medium text-rose-700">Custo Embalagem (R$)</label>
            <input 
              type="number" step="0.01" min="0" name="packaging_cost" value={formData.packaging_cost || 0} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 outline-none"
            />
         </div>

         <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-emerald-700">Lucro Estimado Base (R$)</label>
            <div className="w-full px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-bold">
              R$ {Number((formData.suggested_price || 0) - (formData.material_cost || 0) - (formData.packaging_cost || 0)).toFixed(2)}
            </div>
         </div>

         <div className="col-span-1 md:col-span-2"><hr className="border-stone-100 my-4" /><h3 className="text-lg font-serif text-stone-800">Links e Referências</h3></div>

         <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Link Shopee</label>
            <input 
              type="url" name="shopee_link" value={formData.shopee_link || ''} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
            />
         </div>

         <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Link TikTok</label>
            <input 
              type="url" name="tiktok_link" value={formData.tiktok_link || ''} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
            />
         </div>

         <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Link Instagram</label>
            <input 
              type="url" name="instagram_link" value={formData.instagram_link || ''} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
            />
         </div>

         <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Foto Referência (Link)</label>
            <input 
              type="url" name="photo_reference_link" value={formData.photo_reference_link || ''} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
            />
         </div>

         <div className="col-span-1 md:col-span-2"><hr className="border-stone-100 my-4" /></div>
         
         <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-stone-700">Cores Disponíveis (Adicione quantas variações desejar)</label>
            <div className="w-full flex justify-end mb-1">
               <button type="button" onClick={addColorField} className="text-sm font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Adicionar Variação
               </button>
            </div>
            <div className="flex flex-col gap-2">
               {(formData.colors || []).map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input 
                      type="text" value={c} onChange={e => updateColor(i, e.target.value)}
                      placeholder="Ex: Cru com verde"
                      className="flex-1 px-4 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    />
                    <button type="button" onClick={() => removeColor(i)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
               ))}
               {(!formData.colors || formData.colors.length === 0) && (
                 <div className="text-sm text-stone-400 italic px-2 py-4 text-center border-2 border-dashed border-stone-200 rounded-xl">
                    Nenhuma variação adicionada. Clique em "Adicionar Variação".
                 </div>
               )}
            </div>
         </div>

         <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-stone-700">Imagem do Produto</label>
            <div className="w-full flex items-center gap-4">
              {formData.image_url ? (
                <div className="relative w-24 h-24 rounded-xl border border-stone-200 overflow-hidden group shadow-sm bg-stone-100 flex-shrink-0">
                  <img src={formData.image_url} alt="Produto" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, image_url: undefined }))} className="bg-white/90 text-red-600 p-1.5 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm">
                       <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-[1.5px] border-stone-300 border-dashed rounded-xl cursor-pointer bg-white/50 hover:bg-white hover:border-amber-400 transition-colors shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 text-stone-300 mb-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-1 text-sm font-medium text-stone-600">Clique para adicionar uma imagem</p>
                    <p className="text-xs text-stone-400">JPG, PNG ou WEBP (Max 5MB)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        alert('Esta imagem ultrapassa o limite de 5 MB. Escolha uma imagem menor.');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData(prev => ({ ...prev, image_url: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              )}
              {formData.image_url && (
                <label className="flex-1 flex flex-col items-center justify-center h-24 border-[1.5px] border-stone-300 border-dashed rounded-xl cursor-pointer bg-white/50 hover:bg-white hover:border-amber-400 transition-colors shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] px-4">
                  <span className="text-sm font-medium text-stone-600">Substituir imagem</span>
                  <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        alert('Esta imagem ultrapassa o limite de 5 MB. Escolha uma imagem menor.');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData(prev => ({ ...prev, image_url: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              )}
            </div>
         </div>

         <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-stone-700">Descrição / Observações</label>
            <textarea 
              name="description" value={formData.description || ''} onChange={handleChange} rows={3}
              placeholder="Fios usados, tamanhos, detalhes de produção..."
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none resize-none"
            />
         </div>

         <div className="space-y-1.5 md:col-span-2 flex items-center gap-3 bg-stone-50 p-4 rounded-xl border border-stone-100">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
              <input type="checkbox" name="favorite" checked={formData.favorite || false} onChange={handleCheckbox} className="w-5 h-5 rounded border-stone-300 text-rose-500 focus:ring-rose-500" />
              Marcar como Produto Favorito (Estrela)
            </label>
         </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
         <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl font-medium text-stone-600 hover:bg-stone-50 transition-colors">
           Cancelar
         </button>
         <button type="submit" className="px-6 py-2.5 rounded-xl font-medium text-white bg-amber-700 hover:bg-amber-800 transition-colors shadow-sm">
           Salvar Produto
         </button>
      </div>
    </form>
  );
}
