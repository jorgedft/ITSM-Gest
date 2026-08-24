import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Wrench } from 'lucide-react';

export default function MaintenanceLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('maintenance_logs')
        .select('*, assets(brand, model, asset_code)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error al cargar la bitácora:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bitácora de Mantenimientos</h1>
        <p className="text-sm text-gray-500">Historial de intervenciones preventivas y correctivas en equipos.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando registros de mantenimiento...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Equipo</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(log.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800">
                      {log.assets ? `${log.assets.brand} ${log.assets.model} (${log.assets.asset_code})` : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {log.type || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}