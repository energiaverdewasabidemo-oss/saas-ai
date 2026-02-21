import { useState, useEffect, useRef } from 'react';
import { LogOut, Phone, Clock, BarChart3, Search, RotateCcw } from 'lucide-react';
import { supabase, WebhookStats, fetchWebhookStats } from '../lib/supabase';

const POLL_INTERVAL_MS = 30_000; // Actualizar cada 30 segundos

interface LlamadasIAProps {
  onExit: () => void;
}

export default function LlamadasIA({ onExit }: LlamadasIAProps) {
  const [stats, setStats] = useState<WebhookStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWebhookStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar las métricas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    intervalRef.current = setInterval(fetchMetrics, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const { error } = await supabase.rpc('reset_daily_data');

      if (error) throw error;

      await fetchMetrics();
      setShowConfirm(false);
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('Error al reiniciar datos. Por favor intenta de nuevo.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <Phone className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Llamadas IA</h1>
          </div>
          <button
            onClick={onExit}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Salir
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            <p className="font-semibold">Error:</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2">Verifica que las variables de entorno estén configuradas correctamente en Netlify.</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 mb-2">Total de Llamadas</p>
                <p className="text-5xl font-bold text-gray-900">
                  {stats?.total_llamadas || 0}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <Phone className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 mb-2">Llamadas Contestadas</p>
                <p className="text-5xl font-bold text-gray-900">
                  {stats?.llamadas_contestadas || 0}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <Phone className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 mb-2">Duración Total</p>
                <p className="text-5xl font-bold text-gray-900">
                  {stats ? formatDuration(stats.duracion_total_segundos) : '0h 0m 0s'}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 mb-2">Agentes</p>
                <p className="text-5xl font-bold text-gray-900">
                  {stats?.agentes || 0}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          disabled={isResetting}
          className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium disabled:opacity-50"
        >
          <RotateCcw className={`w-5 h-5 ${isResetting ? 'animate-spin' : ''}`} />
          Reiniciar Datos del Día
        </button>

        <div className="mt-6 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar en todos los registros..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
          />
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        )}

        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirmar Reinicio</h2>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas reiniciar todos los datos del día? Esta acción eliminará todas las llamadas y reseteará las métricas a 0.
              </p>
              <p className="text-red-600 font-semibold mb-6">Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isResetting}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResetData}
                  disabled={isResetting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isResetting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Reiniciando...
                    </>
                  ) : (
                    'Sí, Reiniciar'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
