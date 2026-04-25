import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, Product, AppSettings } from '../types';

interface AppState {
  orders: Order[];
  products: Product[];
  settings: AppSettings;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updatedOrder: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updatedProduct: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  importData: (data: { orders?: Order[], products?: Product[] }) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'light',
  colorTheme: 'Artesanal Marrom',
  defaultPlatform: '',
  defaultStatus: 'Novo pedido',
  defaultPriority: 'Normal',
  defaultCategory: 'Sousplats',
  defaultProductionDays: 3,
  storeInfo: {
    name: 'Caçadores da Arte',
    owner: '',
    phone: '',
    instagram: '',
    shopeeLink: '',
    tiktokLink: '',
    cityState: '',
    reportNotes: '',
  },
  lastBackupDate: null,
  enableImageUpload: true,
  requireImage: false,
  maxImagesPerOrder: 10,
  showMainImageOnCards: true,
  requiredFields: {
    imagem: false,
    codigo_pedido: true,
    cor_variacao: true,
    cliente: true,
    endereco: false,
    valor: true,
    prazo: true,
    plataforma: true,
    tipo_pedido: true,
  }
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      orders: [],
      products: [],
      settings: DEFAULT_SETTINGS,
      addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
      updateOrder: (id, updatedFields) => set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? { ...o, ...updatedFields, updated_at: new Date().toISOString() } : o))
      })),
      deleteOrder: (id) => set((state) => ({
        orders: state.orders.filter((o) => o.id !== id)
      })),
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (id, updatedFields) => set((state) => ({
        products: state.products.map((p) => (p.id === id ? { ...p, ...updatedFields, updated_at: new Date().toISOString() } : p))
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id)
      })),
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      importData: (data) => set((state) => {
        const newOrders = data.orders || [];
        const newProducts = data.products || [];
        
        // Merge avoiding duplicate IDs
        const existingOrderIds = new Set(state.orders.map(o => o.id));
        const mergedOrders = [...state.orders, ...newOrders.filter(o => !existingOrderIds.has(o.id))];
        
        const existingProductIds = new Set(state.products.map(p => p.id));
        const mergedProducts = [...state.products, ...newProducts.filter(p => !existingProductIds.has(p.id))];

        return { orders: mergedOrders, products: mergedProducts };
      }),
    }),
    {
      name: 'cacadores-da-arte-storage', // key in local storage
    }
  )
);
