import { useState, useEffect } from 'react';
import { Search, RefreshCw, Database, Phone, Zap } from 'lucide-react';
import { supabase, Call } from '../lib/supabase';

interface FiltradosIAProps {
  onNavigateToLlamadas: () => void;
}

export default function FiltradosIA({ onNavigateToLlamadas }: FiltradosIAProps) {
  const [calls, setCalls] = useState<Call[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<Call[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [totalLlamadas, setTotalLlamadas] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: callsData, error: callsError } = await supabase
        .from('calls')
        .select('*')
        .order('created_at', { ascending: false });

      if (callsError) throw callsError;

      const { data: metricsData, error: metricsError } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .maybeSingle();

      if (metricsError) throw metricsError;

      setCalls(callsData || []);
      setFilteredCalls(callsData || []);
      setTotalLlamadas(metricsData?.total_calls || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const callsSubscription = supabase
      .channel('calls_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'calls' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const metricsSubscription = supabase
      .channel('metrics_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'dashboard_metrics' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(callsSubscription);
      supabase.removeChannel(metricsSubscription);
    };
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = calls.filter(
        (call) =>
          call.lead_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          call.call_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          call.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCalls(filtered);
    } else {
      setFilteredCalls(calls);
    }
  }, [searchTerm, calls]);

  const formatCallId = (callId: string) => {
    return `# ${callId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-green-100 p-3 rounded-xl">
            <Zap className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Filtrados IA</h1>
        </div>

        <p className="text-gray-500 mb-6">Datos en tiempo real</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            <p className="font-semibold">Error:</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2">Verifica que las variables de entorno estén configuradas correctamente en Netlify.</p>
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-600"
          />
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="w-full bg-gray-900 text-white py-4 rounded-xl mb-6 flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>

        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 mb-2">Total Filtrados</p>
              <p className="text-4xl font-bold text-gray-900">{filteredCalls.length}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <Database className="w-6 h-6 text-gray-500" />
            </div>
          </div>
        </div>

        <div
          onClick={onNavigateToLlamadas}
          className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 mb-2">Total Llamadas Lanzadas</p>
              <p className="text-4xl font-bold text-gray-900">{totalLlamadas}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <Phone className="w-6 h-6 text-gray-500" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredCalls.map((call) => (
            <div
              key={call.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <p className="text-gray-400 text-sm mb-2">{formatCallId(call.call_id)}</p>
              <p className="text-xl font-semibold text-gray-900">{call.lead_name}</p>
              {call.classification && (
                <div className="mt-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      call.classification === 'Positivo'
                        ? 'bg-green-100 text-green-700'
                        : call.classification === 'Negativo'
                        ? 'bg-red-100 text-red-700'
                        : call.classification === 'Neutro'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {call.classification}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredCalls.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            No se encontraron registros
          </div>
        )}
      </div>
    </div>
  );
}
