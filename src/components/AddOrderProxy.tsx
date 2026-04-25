import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { v4 as uuidv4 } from 'uuid';
import { Platform, OrderStatus, Priority, CATEGORIES, OrderType, OccurrenceType, ImageOrigin, Order, ActivityLog, RequiredFieldsConfig } from '../types';
import { cn } from '../lib/utils';
import { Check, X, AlertCircle } from 'lucide-react';

import { PageHeader } from './PageHeader';

interface Props {
  setActiveTab: (tab: string) => void;
}

export function AddOrderProxy({ setActiveTab }: Props) {
  const { addOrder, settings } = useStore();
  const [platform, setPlatform] = useState<Platform | null>(settings.defaultPlatform || null);
  
  // States for form
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Create default due date based on settings.defaultProductionDays
  const calcDefaultDueDate = () => {
    if (!settings.defaultProductionDays) return '';
    const date = new Date();
    date.setDate(date.getDate() + settings.defaultProductionDays);
    return date.toISOString().split('T')[0];
  };

  const [dueDate, setDueDate] = useState(calcDefaultDueDate());
  
  const [category, setCategory] = useState(settings.defaultCategory || CATEGORIES[0]);
  const [details, setDetails] = useState('');
  const [accessories, setAccessories] = useState('');
  const [variation, setVariation] = useState('');
  const [price, setPrice] = useState('');
  const [estimatedProfit, setEstimatedProfit] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [priority, setPriority] = useState<Priority>(settings.defaultPriority || 'Normal');
  const [status, setStatus] = useState<OrderStatus>(settings.defaultStatus || 'Novo pedido');
  const [notes, setNotes] = useState('');
  const [platformUsername, setPlatformUsername] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const [images, setImages] = useState<any[]>([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [productId, setProductId] = useState<string | undefined>(undefined);

  const [orderType, setOrderType] = useState<OrderType>('Produto pronto');
  const [occurrenceType, setOccurrenceType] = useState<OccurrenceType>('Pedido normal');
  const [imageOrigin, setImageOrigin] = useState<ImageOrigin>('Foto do produto pronto');

  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  
  const [pendingSave, setPendingSave] = useState(false);

  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Esta imagem ultrapassa o limite permitido de 5 MB. Escolha uma imagem menor.'));
        return;
      }
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings.enableImageUpload) return;
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > (settings.maxImagesPerOrder || 10)) {
      alert(`Você pode adicionar no máximo ${settings.maxImagesPerOrder || 10} imagens por pedido.`);
      return;
    }

    try {
       const newImages = await Promise.all(
         files.map(async (file: File) => {
           const url = await processImage(file);
           return {
             id: uuidv4(),
             url,
             file_name: file.name,
             file_size: file.size,
             caption: '',
             is_main: images.length === 0, // make first image main
           };
         })
       );
       
       setImages(prev => {
         const combined = [...prev, ...newImages];
         if (combined.length > 0 && !combined.some(i => i.is_main)) {
           combined[0].is_main = true;
         }
         return combined;
       });
    } catch (err: any) {
       alert(err.message || 'Erro ao processar imagem.');
    } finally {
       // Reset input so same file can be selected again
       if (e.target) {
         e.target.value = '';
       }
    }
  };

  React.useEffect(() => {
    const handleAddFromProduct = (e: any) => {
      const product = e.detail;
      if (product) {
        setProductName(product.name);
        setCategory(product.category);
        if (product.colors && product.colors.length > 0) {
            setVariation(`Cor: ${product.colors[0]}`);
        }
        if (product.suggested_price) {
            setPrice(product.suggested_price.toString());
        }
        setProductId(product.id);
        
        let due = new Date();
        due.setDate(due.getDate() + (product.average_production_time || settings.defaultProductionDays || 0));
        setDueDate(due.toISOString().split('T')[0]);

        if (product.image_url) {
           setImages([{
              id: uuidv4(),
              url: product.image_url,
              file_name: 'Produto.jpg',
              file_size: 0,
              caption: 'Imagem do produto',
              is_main: true
           }]);
        }
      }
    };
    
    document.addEventListener('navigate_with_product', handleAddFromProduct);
    return () => {
      document.removeEventListener('navigate_with_product', handleAddFromProduct);
    };
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Always required
    if (!productName.trim()) { setError('Nome do produto é obrigatório.'); return; }
    if (quantity < 1) { setError('A quantidade deve ser maior que 0.'); return; }

    const req: Partial<RequiredFieldsConfig> = settings.requiredFields || {};
    
    // Required fields check
    if (req.plataforma && !platform) { setError('Plataforma é um campo obrigatório.'); return; }
    if (!platform && !req.plataforma && !settings.defaultPlatform) { setError('Selecione uma plataforma.'); return; } // fallback constraint if completely empty
    
    if (req.cliente && !customerName.trim()) { setError('Nome do cliente é obrigatório.'); return; }
    if (req.codigo_pedido && !orderCode.trim()) { setError('Código do pedido é obrigatório.'); return; }
    if (req.cor_variacao && !variation.trim()) { setError('Cor / Variação é um campo obrigatório.'); return; }
    if (req.endereco && !deliveryAddress.trim()) { setError('Endereço é obrigatório.'); return; }
    if (req.valor && (!price || parseFloat(price) <= 0)) { setError('Valor do pedido é obrigatório.'); return; }
    if (req.prazo && !dueDate) { setError('Prazo final é obrigatório.'); return; }
    if (req.imagem && images.length === 0) { setError('Imagem é obrigatória.'); return; }
    if (req.tipo_pedido && !orderType) { setError('Tipo de pedido é obrigatório.'); return; }

    if (entryDate && dueDate && new Date(dueDate) < new Date(entryDate)) {
      setError('A data final não pode ser anterior à data de entrada.');
      return;
    }

    if (settings.requireImage && images.length === 0) {
      setError('É obrigatório adicionar pelo menos uma imagem a este pedido (Config. de App).');
      return;
    }

    // Basic incomplete warning for UX (not blocking, but warns) if not strictly required
    const isIncomplete =
      (!req.imagem && images.length === 0) ||
      (!req.cor_variacao && variation.trim() === '') ||
      (!req.codigo_pedido && orderCode.trim() === '') ||
      (!req.cliente && customerName.trim() === '');

    if (isIncomplete && !showWarningModal && !pendingSave) {
      setShowWarningModal(true);
      return;
    }

    setShowSummaryModal(true);
  };

  const finalizeSave = () => {
    const newLog: ActivityLog = {
      id: uuidv4(),
      action: 'Pedido criado',
      date: new Date().toISOString()
    };

    const newOrder: Order = {
      id: uuidv4(),
      product_id: productId,
      platform,
      order_code: orderCode,
      customer_name: customerName,
      platform_username: platformUsername,
      delivery_address: deliveryAddress,
      product_name: productName,
      category,
      quantity,
      details,
      accessories,
      variation,
      price: parseFloat(price) || 0,
      estimated_profit: parseFloat(estimatedProfit) || 0,
      images,
      entry_date: new Date(entryDate).toISOString(),
      due_date: dueDate ? new Date(dueDate).toISOString() : '',
      posting_date: null,
      status,
      priority,
      notes,
      
      order_type: orderType,
      occurrence_type: occurrenceType,
      image_origin: imageOrigin,
      activity_logs: [newLog],
      is_ready_to_ship: false,

      checklist: {
        produto_correto: false,
        imagem_conferida: false,
        cor_correta: false,
        quantidade_correta: false,
        cliente_conferido: false,
        plataforma_conferida: false,
        codigo_conferido: false,
        etiqueta_conferida: false,
        embalagem_feita: false,
        brinde_incluido: false,
        pronto_para_postagem: false,
        ...(settings.defaultChecklistItems || {})
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addOrder(newOrder);
    setShowSummaryModal(false);
    setShowWarningModal(false);
    setSuccess(true);
    
    setTimeout(() => {
      setActiveTab('orders');
    }, 1500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 pb-24">
      <PageHeader 
        title="Novo Pedido" 
        description="Preencha os dados abaixo com carinho para registrar o pedido."
        className="mb-2"
      />

      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-100 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 flex items-center gap-3">
          <Check className="w-5 h-5" />
          <p className="font-medium text-sm">Pedido salvo com sucesso. Redirecionando...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#FCFBFA] p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-[0_4px_32px_-12px_rgba(0,0,0,0.06)] border border-stone-200/60 space-y-10 relative overflow-hidden">
        
        {/* Plataforma */}
        <section>
          <label className="block text-sm font-semibold text-stone-700/80 mb-3 uppercase tracking-wider">Plataforma de Venda *</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => setPlatform('Shopee')}
              className={cn(
                "py-3 md:py-4 rounded-xl border-2 font-medium transition-all duration-200",
                platform === 'Shopee' ? "border-orange-500 bg-orange-50/70 text-orange-900 shadow-sm" : "border-stone-200 hover:border-orange-300 text-stone-500 hover:bg-stone-50 bg-white"
              )}
            >
              Shopee
            </button>
            <button
              type="button"
              onClick={() => setPlatform('TikTok')}
              className={cn(
                "py-3 md:py-4 rounded-xl border-2 font-medium transition-all duration-200",
                platform === 'TikTok' ? "border-slate-800 bg-slate-50 text-slate-900 shadow-sm" : "border-stone-200 hover:border-slate-300 text-stone-500 hover:bg-stone-50 bg-white"
              )}
            >
              TikTok Shop
            </button>
            <button
              type="button"
              onClick={() => setPlatform('Outro')}
              className={cn(
                "py-3 md:py-4 rounded-xl border-2 font-medium transition-all duration-200",
                platform === 'Outro' ? "border-amber-700 bg-amber-50/50 text-amber-950 shadow-sm" : "border-stone-200 hover:border-amber-300 text-stone-500 hover:bg-stone-50 bg-white"
              )}
            >
              Outro
            </button>
          </div>
        </section>

        <hr className="border-stone-200/50" />

        {/* Cliente */}
        <section className="theme-section space-y-4">
          <h3 className="text-[1.35rem] font-serif text-amber-900/90">Dados do Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Nome do Cliente *</label>
              <input 
                type="text" 
                value={customerName} onChange={e => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200/80 bg-white/70 text-stone-800 placeholder-stone-400 focus:bg-white focus:ring-[3px] focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all hover:border-stone-300 shadow-sm"
                placeholder="Nome completo"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Nome do Usuário na Plataforma</label>
              <input 
                type="text" 
                value={platformUsername} onChange={e => setPlatformUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200/80 bg-white/70 text-stone-800 placeholder-stone-400 focus:bg-white focus:ring-[3px] focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all hover:border-stone-300 shadow-sm"
                placeholder="Ex: @usuario"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-stone-700">Endereço de Entrega</label>
              <input 
                type="text" 
                value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200/80 bg-white/70 text-stone-800 placeholder-stone-400 focus:bg-white focus:ring-[3px] focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all hover:border-stone-300 shadow-sm"
                placeholder="Rua, Número, Bairro, Cidade - Estado, CEP"
              />
            </div>
          </div>
        </section>

        <hr className="border-stone-200/50" />

        {/* Produto */}
        <section className="theme-section space-y-4">
          <h3 className="text-[1.35rem] font-serif text-amber-900/90">Detalhes do Produto</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Produto *</label>
              <input 
                type="text" 
                value={productName} onChange={e => setProductName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200/80 bg-white/70 text-stone-800 placeholder-stone-400 focus:bg-white focus:ring-[3px] focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all hover:border-stone-300 shadow-sm"
                placeholder="Ex: Jogo de Americano..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Código do Pedido</label>
              <input 
                type="text" 
                value={orderCode} onChange={e => setOrderCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200/80 bg-white/70 text-stone-800 placeholder-stone-400 focus:bg-white focus:ring-[3px] focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all hover:border-stone-300 shadow-sm"
                placeholder="Ex: BR123456"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Categoria</label>
              <select 
                value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200/80 bg-white/70 text-stone-800 focus:bg-white focus:ring-[3px] focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all hover:border-stone-300 shadow-sm appearance-none custom-select"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Cor / Variável</label>
              <input 
                type="text" 
                value={variation} onChange={e => setVariation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200/80 bg-white/70 text-stone-800 placeholder-stone-400 focus:bg-white focus:ring-[3px] focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all hover:border-stone-300 shadow-sm"
                placeholder="Ex: Cru com verde"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Quantidade *</label>
              <input 
                type="number" 
                min="1"
                value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200/80 bg-white/70 text-stone-800 placeholder-stone-400 focus:bg-white focus:ring-[3px] focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all hover:border-stone-300 shadow-sm"
              />
            </div>

            <div className="space-y-2 md:col-span-3">
              <label className="text-sm font-medium text-stone-700">Detalhes / Cores Secundárias / Acessórios</label>
              <input 
                type="text" 
                value={details} onChange={e => setDetails(e.target.value)}
                placeholder="Laços, etiquetas extras, personalizações..."
                className="w-full px-4 py-3 rounded-xl border border-stone-200/80 bg-white/70 text-stone-800 placeholder-stone-400 focus:bg-white focus:ring-[3px] focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all hover:border-stone-300 shadow-sm"
              />
            </div>
          </div>
        </section>

        <hr className="border-stone-200/50" />
        {settings.enableImageUpload && (
        <section className="theme-section space-y-4">
          <div className="flex flex-col">
            <h3 className="text-[1.35rem] font-serif text-amber-900/90">Imagem do Produto no Pedido</h3>
            <p className="text-sm text-stone-500">Adicione uma foto do produto vendido para facilitar a conferência depois.</p>
          </div>

          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-36 border-[1.5px] border-stone-300 border-dashed rounded-2xl cursor-pointer bg-white/50 hover:bg-white hover:border-amber-400 transition-colors shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 text-stone-300 mb-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-1 text-sm font-medium text-stone-600">Clique para adicionar uma imagem do produto</p>
                <p className="text-xs text-stone-400">JPG, PNG ou WEBP (Max 5MB)</p>
              </div>
              <input type="file" className="hidden" multiple accept="image/jpeg, image/png, image/webp" onChange={handleImageUpload} />
            </label>

            {images.length > 0 && (
              <div className="space-y-4">
                <div className="w-full md:w-1/2">
                  <label className="text-sm font-medium text-stone-700 block mb-2">Origem da Imagem</label>
                  <select 
                    value={imageOrigin} onChange={e => setImageOrigin(e.target.value as ImageOrigin)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200/80 bg-white/70 text-stone-800 focus:bg-white focus:ring-[3px] focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all hover:border-stone-300 shadow-sm appearance-none custom-select text-sm"
                  >
                    <option value="Foto do produto pronto">Foto do produto pronto</option>
                    <option value="Referência da cliente">Referência da cliente</option>
                    <option value="Foto do anúncio">Foto do anúncio</option>
                    <option value="Foto antes da embalagem">Foto antes da embalagem</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img) => (
                  <div key={img.id} className={cn("relative flex flex-col bg-white border rounded-[1rem] overflow-hidden shadow-sm transition-all", img.is_main ? "border-amber-400 ring-[2px] ring-amber-400/30" : "border-stone-200")}>
                    <div className="h-36 bg-stone-100 relative group">
                      <img src={img.url} alt={img.file_name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                         <button type="button" onClick={() => setImages(images.filter(i => i.id !== img.id))} className="bg-white/90 text-red-600 p-2 rounded-xl hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm" title="Remover imagem">
                           <X className="w-4 h-4" />
                         </button>
                      </div>
                      {img.is_main && (
                        <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                           Principal
                        </span>
                      )}
                    </div>
                    <div className="p-3 flex flex-col gap-2 bg-white">
                      <p className="text-xs font-medium text-stone-700 truncate" title={img.file_name}>{img.file_name}</p>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] text-stone-400">{(img.file_size / 1024 / 1024).toFixed(1)} MB</span>
                         {!img.is_main && (
                           <button type="button" onClick={() => setImages(images.map(i => ({...i, is_main: i.id === img.id})))} className="text-[11px] text-stone-500 hover:text-amber-700 font-medium transition-colors">
                             Definir principal
                           </button>
                         )}
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}
          </div>
        </section>
        )}

        <hr className="border-stone-200/50" />

        {/* Status & Datas */}
        <section className="theme-section space-y-4">
          <h3 className="text-[1.35rem] font-serif text-amber-900/90">Valores e Prazos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Data de Entrada *</label>
              <input 
                type="date" 
                value={entryDate} onChange={e => setEntryDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200/80 bg-white/70 text-stone-800 placeholder-stone-400 focus:bg-white focus:ring-[3px] focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all hover:border-stone-300 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Prazo Final / Envio</label>
              <input 
                type="date" 
                value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200/80 bg-white/70 text-stone-800 placeholder-stone-400 focus:bg-white focus:ring-[3px] focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all hover:border-stone-300 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Valor Pago Pelo Cliente (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={price} onChange={e => setPrice(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200/80 bg-white/70 text-stone-800 placeholder-stone-400 focus:bg-white focus:ring-[3px] focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all hover:border-stone-300 shadow-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Renda Estimada do Pedido (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={estimatedProfit} onChange={e => setEstimatedProfit(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200/80 bg-white/70 text-stone-800 placeholder-stone-400 focus:bg-white focus:ring-[3px] focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all hover:border-stone-300 shadow-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Tipo de Pedido</label>
              <select 
                value={orderType} onChange={e => setOrderType(e.target.value as OrderType)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200/80 bg-white/70 text-stone-800 focus:bg-white focus:ring-[3px] focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all hover:border-stone-300 shadow-sm appearance-none custom-select"
              >
                <option value="Produto pronto">Produto pronto</option>
                <option value="Sob encomenda">Sob encomenda</option>
                <option value="Personalizado">Personalizado</option>
                <option value="Reposição">Reposição</option>
                <option value="Troca/Reenvio">Troca/Reenvio</option>
                <option value="Brinde/Cortesia">Brinde/Cortesia</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Tipo de Ocorrência</label>
              <select 
                value={occurrenceType} onChange={e => setOccurrenceType(e.target.value as OccurrenceType)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200/80 bg-white/70 text-stone-800 focus:bg-white focus:ring-[3px] focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all hover:border-stone-300 shadow-sm appearance-none custom-select"
              >
                <option value="Pedido normal">Pedido normal</option>
                <option value="Reenvio">Reenvio</option>
                <option value="Troca">Troca</option>
                <option value="Produto errado">Produto errado</option>
                <option value="Cliente solicitou alteração">Cliente solicitou alteração</option>
                <option value="Cancelamento">Cancelamento</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Status Inicial</label>
              <select 
                value={status} onChange={e => setStatus(e.target.value as OrderStatus)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200/80 bg-white/70 text-stone-800 focus:bg-white focus:ring-[3px] focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all hover:border-stone-300 shadow-sm appearance-none custom-select"
              >
                <option value="Novo pedido">Novo pedido</option>
                <option value="Em produção">Em produção</option>
                <option value="Produto pronto">Produto pronto</option>
                <option value="Separado">Separado</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Prioridade</label>
              <select 
                value={priority} onChange={e => setPriority(e.target.value as Priority)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200/80 bg-white/70 text-stone-800 focus:bg-white focus:ring-[3px] focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all hover:border-stone-300 shadow-sm appearance-none custom-select"
              >
                <option value="Normal">Normal</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
          </div>
        </section>

        {/* Observações */}
        <section className="theme-section space-y-4">
          <div className="pt-2">
            <h3 className="text-[1.35rem] font-serif text-amber-900/90 mb-6">Observações Internas</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Anotações extras</label>
              <textarea 
                value={notes} onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Alguma instrução especial para a produção ou embalagem?"
                className="w-full px-4 py-3 rounded-xl border border-stone-200/80 bg-white/70 text-stone-800 placeholder-stone-400 focus:bg-white focus:ring-[3px] focus:ring-amber-500/10 focus:border-amber-500 outline-none resize-none transition-all hover:border-stone-300 shadow-sm"
              ></textarea>
            </div>
          </div>
        </section>

        <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 border-t border-stone-200/50 mt-8">
          <button 
            type="button" 
            onClick={() => setActiveTab('dashboard')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-stone-600 bg-transparent hover:bg-stone-100 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="w-full sm:w-auto px-8 py-3 rounded-xl font-medium text-white bg-amber-800 hover:bg-amber-900 transition-all shadow-[0_4px_12px_-4px_rgba(146,64,14,0.4)] hover:shadow-[0_6px_16px_-4px_rgba(146,64,14,0.5)] hover:-translate-y-0.5"
          >
            Salvar Pedido
          </button>
        </div>
      </form>

      {showWarningModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif text-stone-800 mb-2">Pedido Incompleto</h3>
              <p className="text-stone-500 mb-6">
                Este pedido ainda está sem algumas informações (imagem, cor, código ou cliente).
                Deseja prosseguir mesmo assim?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPendingSave(true);
                    setShowWarningModal(false);
                    setShowSummaryModal(true);
                  }}
                  className="w-full px-6 py-3 rounded-xl font-medium text-white bg-amber-700 hover:bg-amber-800 transition-colors"
                >
                  Prosseguir Assim Mesmo
                </button>
                <button
                  type="button"
                  onClick={() => setShowWarningModal(false)}
                  className="w-full px-6 py-3 rounded-xl font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  Voltar e Preencher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSummaryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <h3 className="text-xl font-serif text-stone-800">Resumo antes de salvar</h3>
              <button onClick={() => setShowSummaryModal(false)} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-stone-500 mb-1">Plataforma</span>
                    <strong className="text-stone-800 bg-stone-100 px-2 py-1 rounded-md">{platform}</strong>
                  </div>
                  <div>
                    <span className="block text-stone-500 mb-1">Código do Pedido</span>
                    <strong className="text-stone-800">{orderCode || 'N/A'}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-stone-500 mb-1">Cliente</span>
                    <strong className="text-stone-800">{customerName}</strong>
                  </div>
                  <div className="col-span-2 border-t border-stone-100 pt-4">
                    <span className="block text-stone-500 mb-1">Produto</span>
                    <strong className="text-stone-800">{productName}</strong>
                  </div>
                  <div>
                    <span className="block text-stone-500 mb-1">Quantidade</span>
                    <strong className="text-stone-800">{quantity}x</strong>
                  </div>
                  <div>
                    <span className="block text-stone-500 mb-1">Cor / Variação</span>
                    <strong className="text-stone-800">{variation || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="block text-stone-500 mb-1">Prazo</span>
                    <strong className="text-stone-800">{dueDate ? new Date(dueDate).toLocaleDateString('pt-BR') : 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="block text-stone-500 mb-1">Valor</span>
                    <strong className="text-stone-800">R$ {parseFloat(price).toFixed(2)}</strong>
                  </div>
                  <div className="col-span-2 border-t border-stone-100 pt-4">
                    <span className="block text-stone-500 mb-1">Tipo de Pedido</span>
                    <strong className="text-stone-800">{orderType}</strong>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="text-stone-500">Imagem Anexada?</span>
                    <strong>{images.length > 0 ? (
                      <span className="text-emerald-600 flex items-center gap-1"><Check className="w-4 h-4"/> Sim ({images.length})</span>
                    ) : (
                      <span className="text-red-500">Não</span>
                    )}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 flex gap-3">
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="flex-1 px-4 py-3 rounded-xl font-medium text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 transition-colors"
              >
                Revisar
              </button>
              <button
                type="button"
                onClick={finalizeSave}
                className="flex-[2] px-4 py-3 rounded-xl font-medium text-white bg-amber-700 hover:bg-amber-800 transition-colors shadow-sm"
              >
                Confirmar e Salvar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
