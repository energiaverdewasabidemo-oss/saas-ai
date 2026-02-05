import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Call {
  id: string;
  call_id: string;
  lead_name: string;
  phone?: string;
  classification?: 'Positivo' | 'Neutro' | 'Negativo' | 'No Contestados' | 'Buzón';
  duration_seconds: number;
  answered: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface DashboardMetrics {
  id: string;
  total_calls: number;
  answered_calls: number;
  total_duration_seconds: number;
  total_filtered: number;
  agents_count: number;
  updated_at: string;
}
