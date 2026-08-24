import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Network } from 'lucide-react';

export default function NetworkList() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNetworkDevices();
  }, []);

  const fetchNetworkDevices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('network_devices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDevices(data || []);
    } catch (err) {
      console.error('Error al cargar equipos de red:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Infraestructura de Red</h1>
        <p className="text-sm text-gray-500">Monitoreo de Switches, Routers, Firewalls y Puntos de Acceso.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando dispositivos de red...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-3 px-4">Dispositivo</th>
                  <th className="py-3 px-4">Dirección IP</th>
                  <th className="py-3 px-4">Dirección MAC</th>
                  <th className="py-3 px-4">Ubicación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {devices.map((dev) => (
                  <tr key={dev.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-800">{dev.name}</td>
                    <td className="py-3 px-4 font-mono text-xs text-blue-600">{dev.ip_address}</td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-600">{dev.mac_address}</td>
                    <td className="py-3 px-4 text-gray-600">{dev.location || 'N/A'}</td>
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