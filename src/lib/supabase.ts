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

export const fetchDashboardFromN8N = async (): Promise<DashboardMetrics> => {
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
    
    // Convertir el formato de n8n al formato DashboardMetrics
    return {
      id: '1',
      total_calls: result.data.total_llamadas || 0,
      answered_calls: result.data.llamadas_contestadas || 0,
      total_duration_seconds: parseDuration(result.data.duracion_total || '0h 0m 0s'),
      total_filtered: result.data.total_filtrados || 0,
      agents_count: result.data.agentes || 1,
      updated_at: result.timestamp || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error al obtener datos del webhook:', error);
    throw error;
  }
};

// Función auxiliar para convertir "1h 23m 45s" a segundos
function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)h\s*(\d+)m\s*(\d+)s/);
  if (!match) return 0;
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  
  return (hours * 3600) + (minutes * 60) + seconds;
}