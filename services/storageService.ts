import { Product, ProductStatus, DispatchRecord, ProductType } from '../types';

// Initial Mock Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'BANCA PLANA PROFESIONAL',
    code: 'FB0318',
    type: ProductType.MACHINE,
    imageUrl: 'https://picsum.photos/400/300',
    status: ProductStatus.ACTIVE,
    updatedAt: new Date().toISOString(),
    components: [
      { id: 'c1', name: 'Estructura Base', code: 'FB0318-A', status: ProductStatus.ACTIVE },
      { id: 'c2', name: 'Cojín Principal', code: 'FB0318-B', status: ProductStatus.ACTIVE },
      { id: 'c3', name: 'Kit Tornillería', code: 'FB0318-C', status: ProductStatus.ACTIVE }
    ]
  }
];

const STORAGE_KEYS = {
  PRODUCTS: 'fitbarz_products',
  DISPATCH_LOGS: 'fitbarz_logs'
};

export const storageService = {
  getProducts: (): Product[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const products: Product[] = JSON.parse(data);
    return products;
  },

  getActiveProducts: (): Product[] => {
    const all = storageService.getProducts();
    return all.filter(p => p.status === ProductStatus.ACTIVE);
  },

  saveProduct: (product: Product): void => {
    const products = storageService.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    
    product.updatedAt = new Date().toISOString();

    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  // Soft Delete - STRICT: Never delete, only mark inactive
  deleteProduct: (productId: string): void => {
    const products = storageService.getProducts();
    const index = products.findIndex(p => p.id === productId);
    if (index >= 0) {
      products[index].status = ProductStatus.INACTIVE;
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }
  },

  getDispatchLogs: (): DispatchRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DISPATCH_LOGS);
    return data ? JSON.parse(data) : [];
  },

  saveDispatchLog: (record: DispatchRecord): void => {
    const logs = storageService.getDispatchLogs();
    logs.unshift(record); // Add to top
    localStorage.setItem(STORAGE_KEYS.DISPATCH_LOGS, JSON.stringify(logs));
  },

  // BACKUP SYSTEM
  createBackup: (): string => {
    const products = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const logs = localStorage.getItem(STORAGE_KEYS.DISPATCH_LOGS);
    
    const backupData = {
      timestamp: new Date().toISOString(),
      products: products ? JSON.parse(products) : [],
      logs: logs ? JSON.parse(logs) : [],
      version: "1.0.0"
    };
    
    return JSON.stringify(backupData, null, 2);
  },

  restoreBackup: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.products && Array.isArray(data.products)) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data.products));
      }
      if (data.logs && Array.isArray(data.logs)) {
        localStorage.setItem(STORAGE_KEYS.DISPATCH_LOGS, JSON.stringify(data.logs));
      }
      return true;
    } catch (e) {
      console.error("Error restoring backup", e);
      return false;
    }
  }
};