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

export {}; 