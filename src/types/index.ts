export type Platform = 'Shopee' | 'TikTok' | 'Outro';
export type OrderStatus = 'Novo pedido' | 'Em produção' | 'Produto pronto' | 'Separado' | 'Conferido' | 'Embalado' | 'Postado' | 'Finalizado' | 'Cancelado';
export type Priority = 'Normal' | 'Alta' | 'Urgente';

export type OrderType = 'Produto pronto' | 'Sob encomenda' | 'Personalizado' | 'Reposição' | 'Troca/Reenvio' | 'Brinde/Cortesia';
export type OccurrenceType = 'Pedido normal' | 'Reenvio' | 'Troca' | 'Produto errado' | 'Cliente solicitou alteração' | 'Cancelamento' | 'Outro';
export type ImageOrigin = 'Foto do produto pronto' | 'Referência da cliente' | 'Foto do anúncio' | 'Foto antes da embalagem' | 'Outro';
export type StockStatus = 'Pronto para envio' | 'Sob encomenda' | 'Esgotado' | 'Pausado';

export interface ActivityLog {
  id: string;
  action: string;
  date: string;
  details?: string;
  user?: string;
}

export interface OrderChecklist {
  produto_correto: boolean;
  imagem_conferida: boolean;
  cor_correta: boolean;
  quantidade_correta: boolean;
  cliente_conferido: boolean;
  plataforma_conferida: boolean;
  codigo_conferido: boolean;
  etiqueta_conferida: boolean;
  embalagem_feita: boolean;
  brinde_incluido: boolean;
  pronto_para_postagem: boolean;
}

export interface OrderImage {
  id: string;
  url: string; // base64 representation of the image
  file_name: string;
  file_size: number;
  caption: string;
  is_main: boolean;
}

export interface Order {
  id: string;
  product_id?: string;
  platform: Platform;
  order_code: string;
  customer_name: string;
  platform_username: string; // NEW
  delivery_address: string; // NEW
  product_name: string;
  category: string;
  quantity: number;
  details: string;
  accessories: string;
  variation: string;
  price: number;
  estimated_profit: number; // NEW
  images?: OrderImage[];
  entry_date: string; // ISO string
  due_date: string; // ISO string
  posting_date: string | null;
  status: OrderStatus;
  priority: Priority;
  notes: string;
  checklist: OrderChecklist;
  
  order_type?: OrderType;
  occurrence_type?: OccurrenceType;
  image_origin?: ImageOrigin;
  activity_logs?: ActivityLog[];
  is_ready_to_ship?: boolean;
  
  created_at: string; // ISO string
  updated_at: string; // ISO string
}

export interface Product {
  id: string;
  name: string;
  category: string;
  variations?: string[];
  colors?: string[];
  average_production_time: number; // in days
  notes: string;
  active: boolean;
  
  description?: string;
  status?: string;
  favorite?: boolean;
  sku?: string;
  image_url?: string;
  materials?: string;
  difficulty?: string;
  size?: string;
  weight?: string;
  suggested_price?: number;
  shopee_price?: number;
  tiktok_price?: number;
  material_cost?: number;
  packaging_cost?: number;
  shopee_link?: string;
  tiktok_link?: string;
  instagram_link?: string;
  photo_reference_link?: string;
  production_notes?: string;
  packaging_notes?: string;
  care_instructions?: string;
  
  stock_status?: StockStatus;
  stock_quantity?: number;
  
  created_at: string;
  updated_at: string;
}

export interface RequiredFieldsConfig {
  imagem: boolean;
  codigo_pedido: boolean;
  cor_variacao: boolean;
  cliente: boolean;
  endereco: boolean;
  valor: boolean;
  prazo: boolean;
  plataforma: boolean;
  tipo_pedido: boolean;
}

export interface AppSettings {
  themeMode: 'light' | 'dark' | 'system';
  colorTheme: string;
  defaultPlatform: Platform | '';
  defaultStatus: OrderStatus;
  defaultPriority: Priority;
  defaultCategory: string;
  defaultProductionDays: number;
  storeInfo: {
    name: string;
    owner: string;
    phone: string;
    instagram: string;
    shopeeLink: string;
    tiktokLink: string;
    cityState: string;
    reportNotes: string;
  };
  lastBackupDate: string | null;
  enableImageUpload?: boolean;
  requireImage?: boolean;
  maxImagesPerOrder?: number;
  showMainImageOnCards?: boolean;
  
  requiredFields?: RequiredFieldsConfig;
  
  alert1DayBefore?: boolean;
  alertOnShippingDay?: boolean;
  highlightUrgent?: boolean;
  highlightNoImage?: boolean;
  highlightNoCode?: boolean;
  highlightIncompleteChecklist?: boolean;
  highlightLate?: boolean;

  defaultChecklistItems?: Record<string, boolean>;

  confirmDeleteOrder?: boolean;
  blockDeleteFinalizedOrders?: boolean;
}

export const CATEGORIES = [
  'Porta Copos / Mini Sousplats',
  'Bolsas Artesanais em Crochê',
  'Tapetes em Crochê',
  'Peso de Porta',
  'Sousplats/Louças',
  'Necessaires',
  'Outros'
];
