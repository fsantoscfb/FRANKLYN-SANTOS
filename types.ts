export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum ProductType {
  MACHINE = 'MACHINE', // Parent
  COMPONENT = 'COMPONENT' // Child
}

export interface ComponentItem {
  id: string;
  name: string;
  code: string;
  imageUrl?: string; // New: Image for the specific component
  status: ProductStatus;
  scanned?: boolean; // UI state for dispatch
}

export interface Product {
  id: string;
  name: string;
  code: string;
  type: ProductType;
  imageUrl: string;
  status: ProductStatus;
  components: ComponentItem[]; // If type is MACHINE
  updatedAt: string;
}

export interface DispatchRecord {
  id: string;
  orderNumber: string;
  operatorName: string;
  operatorId: string;
  productName: string;
  productCode: string;
  scannedItems: ComponentItem[];
  timestamp: string;
}

export interface OperatorSession {
  name: string;
  employeeId: string;
  currentOrderNumber: string;
}