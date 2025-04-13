// User type definitions
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'resident';
  roomNumber: string | null;
  preferredLanguage: string;
  phoneNumber?: string;
  upiId?: string;
  notificationsEnabled?: boolean;
  createdAt: Date;
}

// Room type definitions
export interface Room {
  id: string;
  roomNumber: string;
  residentId?: string;
  residentName?: string;
  contactNumber?: string;
  monthlyFee: number;
  totalDue: number;
  dueDate: string;
  payments: Payment[];
  lastPaymentDate?: string;
}

// Payment type definitions
export interface Payment {
  id: string;
  roomNumber: string;
  amount: number;
  date: string;
  method: 'UPI' | 'Cash' | 'Bank Transfer';
  status: 'pending' | 'completed';
  receiptURL?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

// Expense type definitions
export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  receiptURL?: string;
  createdBy: string;
  createdAt: Date;
}

// Settings type definitions
export interface AppSettings {
  upiId: string;
  defaultMaintenanceFee: number;
  defaultDueDate: number;
  adminUserId: string;
  languageOptions: string[];
}

// Dashboard stats type definitions
export interface DashboardStats {
  totalCollected: number;
  totalExpenses: number;
  currentBalance: number;
  pendingDues: number;
  pendingRooms: number;
}
