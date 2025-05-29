// Global type declarations
declare global {
  interface Window {
    reloadNotifications?: () => Promise<void>;
  }
}

export type Income = {
  id: number;
  date: string; // ISO string
  description: string;
  amount: number;
  category?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Expense = {
  id: number;
  date: string; // ISO string
  description: string;
  amount: number;
  category?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type SppPayment = {
  id: number;
  student_id: number;
  month: number;
  year: number;
  paid_at: string; // ISO string
  amount: number;
  infaq?: number;
  student?: {
    id: number;
    name: string;
    nis: string;
  };
  created_at?: string;
  updated_at?: string;
};

export {}; 