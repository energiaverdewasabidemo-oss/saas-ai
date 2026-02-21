import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

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

export interface WebhookStats {
  total_llamadas: number;
  llamadas_contestadas: number;
  duracion_total: string;
  duracion_total_segundos: number;
  agentes: number;
  ultima_actualizacion: string;
  tasa_respuesta: number;
  clasificaciones: {
    positivos: number;
    negativos: number;
    neutros: number;
    no_contestados: number;
  };
}

export async function fetchWebhookStats(): Promise<WebhookStats> {
  const response = await fetch('/.netlify/functions/webhook-stats');
  if (!response.ok) {
    throw new Error('Error al obtener datos del webhook');
  }
  const data = await response.json();
  // The API returns an array with one object
  return Array.isArray(data) ? data[0] : data;
}
