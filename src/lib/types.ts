
export type Product = {
  id: string;
  barcode?: string;
  name: string;
  category: 'Desinfectantes' | 'Probióticos' | 'Antiparasitarios' | 'Accesorios para mascotas' | 'Fertilizantes' | 'Vitaminas' | 'Medicamentos' | 'Equipos';
  stock: number;
  purchasePrice: number;
  salePrice: number;
  imageUrl: string;
  salesHistory: Record<string, number>;
  expiryDate?: string;
};

export type Sale = {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  totalPrice: number;
  date: string;
  employee: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  purchasePrice: number;
};

export type Order = {
  id: string;
  date: string;
  status: 'Pendiente' | 'Completado' | 'Cancelado';
  items: OrderItem[];
  supplier?: string;
};

export type SaleItem = {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  stock: number;
};

export type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'pedido' | 'cita' | 'evento';
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Empleado';
  password?: string;
};

export type BankAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  cci: string;
};
