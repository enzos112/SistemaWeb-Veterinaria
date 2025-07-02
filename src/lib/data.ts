
import { parseDate } from './utils';
import type { Product, Sale, Order, CalendarEvent, User, BankAccount } from './types';

const originalProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'SURFAC 820 500ML',
    category: 'Desinfectantes',
    stock: 2,
    purchasePrice: 10.00,
    salePrice: 14.00,
    imageUrl: 'https://placehold.co/100x100.png',
    salesHistory: {},
    expiryDate: parseDate('5/08/2023'),
  },
  {
    id: 'prod-002',
    name: 'SURFAC 820 250ML',
    category: 'Desinfectantes',
    stock: 3,
    purchasePrice: 6.50,
    salePrice: 10.00,
    imageUrl: 'https://placehold.co/100x100.png',
    salesHistory: {},
    expiryDate: parseDate('19/08/2023'),
  },
  {
    id: 'prod-003',
    name: 'PROTEXIN 1 LITRO',
    category: 'Probióticos',
    stock: 1,
    purchasePrice: 40.00,
    salePrice: 53.00,
    imageUrl: 'https://placehold.co/100x100.png',
    salesHistory: {},
    expiryDate: parseDate('23/10/2023'),
  },
  {
    id: 'prod-004',
    name: 'DORSAN 250ML',
    category: 'Antiparasitarios',
    stock: 3,
    purchasePrice: 16.00,
    salePrice: 20.00,
    imageUrl: 'https://placehold.co/100x100.png',
    salesHistory: {},
    expiryDate: parseDate('25/08/2022'),
  },
  {
    id: 'prod-005',
    name: 'TIFON 1 LITRO LIQUIDO',
    category: 'Fertilizantes',
    stock: 0,
    purchasePrice: 38.00,
    salePrice: 45.00,
    imageUrl: 'https://placehold.co/100x100.png',
    salesHistory: {},
  },
  {
    id: 'prod-006',
    name: 'TIFON 1/4 LIQUIDO',
    category: 'Fertilizantes',
    stock: 3,
    purchasePrice: 14.00,
    salePrice: 20.00,
    imageUrl: 'https://placehold.co/100x100.png',
    salesHistory: {},
  },
  {
    id: 'prod-007',
    name: 'PLATOS DE PERRO GRANDE',
    category: 'Accesorios para mascotas',
    stock: 3,
    purchasePrice: 5.00,
    salePrice: 6.50,
    imageUrl: 'https://placehold.co/100x100.png',
    salesHistory: {},
  },
  {
    id: 'prod-008',
    name: 'PLATO GATO',
    category: 'Accesorios para mascotas',
    stock: 1,
    purchasePrice: 2.50,
    salePrice: 4.00,
    imageUrl: 'https://placehold.co/100x100.png',
    salesHistory: {},
  },
  {
    id: 'prod-009',
    name: 'HORMIFIN GRANULADO',
    category: 'Fertilizantes',
    stock: 4,
    purchasePrice: 6.00,
    salePrice: 9.00,
    imageUrl: 'https://placehold.co/100x100.png',
    salesHistory: {},
  },
  {
    id: 'prod-010',
    name: 'SULFATO DE COBRE DE 1K',
    category: 'Fertilizantes',
    stock: 2,
    purchasePrice: 13.00,
    salePrice: 18.00,
    imageUrl: 'https://placehold.co/100x100.png',
    salesHistory: {},
    expiryDate: parseDate('Mar-22'),
  },
  {
    id: 'prod-011',
    name: 'CURTINE UV DE 500GR',
    category: 'Medicamentos',
    stock: 2,
    purchasePrice: 30.00,
    salePrice: 42.00,
    imageUrl: 'https://placehold.co/100x100.png',
    salesHistory: {},
    expiryDate: parseDate('20/04/2022'),
  },
  {
    id: 'prod-012',
    name: 'EVITANE DE 1KG',
    category: 'Medicamentos',
    stock: 1,
    purchasePrice: 24.00,
    salePrice: 33.00,
    imageUrl: 'https://placehold.co/100x100.png',
    salesHistory: {},
    expiryDate: parseDate('20/02/2023'),
  },
  {
    id: 'prod-013',
    name: 'TIFON DE 1KG POLVO',
    category: 'Fertilizantes',
    stock: 8,
    purchasePrice: 8.50,
    salePrice: 13.00,
    imageUrl: 'https://placehold.co/100x100.png',
    salesHistory: {},
    expiryDate: parseDate('Set-23'),
  },
  {
    id: 'prod-014',
    name: 'BOMBA 10 DE',
    category: 'Equipos',
    stock: 6,
    purchasePrice: 13.50,
    salePrice: 17.00,
    imageUrl: 'https://placehold.co/100x100.png',
    salesHistory: {},
    expiryDate: parseDate('Feb-24'),
  },
  {
    id: 'prod-015',
    name: 'RUMIFAR DE 100GR',
    category: 'Medicamentos',
    stock: 2,
    purchasePrice: 13.00,
    salePrice: 17.00,
    imageUrl: 'https://placehold.co/100x100.png',
    salesHistory: {},
    expiryDate: parseDate('Feb-24'),
  },
  {
    id: 'prod-016',
    name: 'SULFATO DE MAGNESIO X 1KG',
    category: 'Fertilizantes',
    stock: 4,
    purchasePrice: 7.50,
    salePrice: 10.00,
    imageUrl: 'https://placehold.co/100x100.png',
    salesHistory: {},
  },
  {
    id: 'prod-017',
    name: 'METSUL',
    category: 'Fertilizantes',
    stock: 2,
    purchasePrice: 15.00,
    salePrice: 20.00,
    imageUrl: 'https://placehold.co/100x100.png',
    salesHistory: {},
    expiryDate: parseDate('23/11/2022'),
  },
  {
    id: 'prod-018',
    name: 'POLIFON X 25GR',
    category: 'Vitaminas',
    stock: 10,
    purchasePrice: 7.00,
    salePrice: 9.00,
    imageUrl: 'https://placehold.co/100x100.png',
    salesHistory: {},
    expiryDate: parseDate('May-23'),
  },
  {
    id: 'prod-019',
    name: 'ANTIPAPILOMA DE 20ML',
    category: 'Medicamentos',
    stock: 2,
    purchasePrice: 11.00,
    salePrice: 15.00,
    imageUrl: 'https://placehold.co/100x100.png',
    salesHistory: {},
    expiryDate: parseDate('Nov-22'),
  },
  {
    id: 'prod-020',
    name: 'VERRUFIN X 20ML',
    category: 'Medicamentos',
    stock: 1,
    purchasePrice: 10.50,
    salePrice: 14.00,
    imageUrl: 'https://placehold.co/100x100.png',
    salesHistory: {},
    expiryDate: parseDate('Jun-22'),
  },
];

const categories: Product['category'][] = ["Desinfectantes", "Probióticos", "Antiparasitarios", "Accesorios para mascotas", "Fertilizantes", "Vitaminas", "Medicamentos", "Equipos"];
const productNames = [
    "Limpiador Multiusos", "Suplemento Vitamínico", "Collar Antipulgas", "Juguete para Perro", "Abono para Plantas",
    "Comedero de Acero", "Shampoo Medicado", "Bomba de Fumigación", "Tierra para Macetas", "Correa de Nylon",
    "Tabletas Desparasitantes", "Arena para Gatos", "Jaula de Transporte", "Pipeta Antiparasitaria", "Vitaminas para Cachorros",
    "Desinfectante de Superficies", "Antibiótico de Amplio Espectro", "Crema Cicatrizante", "Gotas para los Oídos", "Rascador para Gatos"
];

function generateProducts() {
    const generatedProducts: Product[] = [];
    for (let i = 21; i <= 500; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const productName = productNames[Math.floor(Math.random() * productNames.length)];
        const purchasePrice = parseFloat((Math.random() * 50 + 5).toFixed(2));
        const salePrice = parseFloat((purchasePrice * (1 + Math.random() * 0.5 + 0.2)).toFixed(2)); // 20% to 70% markup
        const stock = Math.floor(Math.random() * 100);
        const hasExpiry = Math.random() > 0.5;
        const expiryDate = hasExpiry ? new Date(new Date().setFullYear(new Date().getFullYear() + Math.floor(Math.random() * 3))) : undefined;
        
        generatedProducts.push({
            id: `prod-${String(i).padStart(3, '0')}`,
            name: `${productName} #${i - 20}`,
            category,
            stock,
            purchasePrice,
            salePrice,
            imageUrl: 'https://placehold.co/100x100.png',
            salesHistory: {},
            expiryDate: expiryDate ? expiryDate.toISOString().split('T')[0] : undefined,
        });
    }
    return generatedProducts;
}

originalProducts.push(...generateProducts());


export const products: Product[] = originalProducts;

export const sales: Sale[] = [];

export const orders: Order[] = [];

export const salesDataForChart = [
    { date: '2024-07-22', sales: 0 },
    { date: '2024-07-23', sales: 0 },
    { date: '2024-07-24', sales: 0 },
    { date: '2024-07-25', sales: 0 },
    { date: '2024-07-26', sales: 0 },
    { date: '2024-07-27', sales: 0 },
    { date: '2024-07-28', sales: 0 },
    { date: '2024-07-29', sales: 0 },
];

// Helper to get a future date for calendar events
const getFutureDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export const calendarEvents: CalendarEvent[] = [];

export const bankAccounts: BankAccount[] = [
  {
    id: 'acc-001',
    bankName: 'Banco de Crédito del Perú (BCP)',
    accountNumber: '123-4567890-1-23',
    accountHolder: 'El Amigo E.I.R.L.',
    cci: '00212300456789012398',
  },
  {
    id: 'acc-002',
    bankName: 'Interbank',
    accountNumber: '098-7654321000',
    accountHolder: 'El Amigo E.I.R.L.',
    cci: '00309801076543210051',
  },
];

export const users: User[] = [
  { id: 'user-admin', name: 'Diana', email: 'diana@admin.com', role: 'Admin', password: 'Zaru2025' },
  { id: 'user-001', name: 'Donato', email: 'donato@gmail.com', role: 'Empleado', password: '123' },
  { id: 'user-002', name: 'Alex', email: 'alex@vetstock.com', role: 'Empleado', password: '123' },
  { id: 'user-003', name: 'Maria', email: 'maria@vetstock.com', role: 'Empleado', password: '123' },
  { id: 'user-004', name: 'Jane', email: 'jane@vetstock.com', role: 'Empleado', password: '123' },
];


const USER_STORAGE_KEY = 'el_amigo_user_id';

export function login(email: string, password?: string): User | null {
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_STORAGE_KEY, user.id);
    }
    return user;
  }
  return null;
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

export function getCurrentUser(): User | null {
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem(USER_STORAGE_KEY);
    if (userId) {
      return users.find(u => u.id === userId) || null;
    }
  }
  return null;
}
