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
// ========== API WEBHOOK N8N ==========
const N8N_WEBHOOK_URL = 'https://api.energiaverdewasabi.es/webhook/dashboard/stats';

export interface N8NWebhookResponse {
  total_llamadas: number;
  llamadas_contestadas: number;
  duracion_total: string;
  duracion_total_segundos: number;
  agentes: number;
  ultima_actualizacion: string;
  tasa_respuesta: string;
  clasificaciones: {
    positivos: number;
    negativos: number;
    neutros: number;
    no_contestados: number;
  };
}

export const fetchDashboardFromN8N = async (): Promise<N8NWebhookResponse> => {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error del webhook: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error al obtener datos del webhook:', error);
    throw error;
  }
};