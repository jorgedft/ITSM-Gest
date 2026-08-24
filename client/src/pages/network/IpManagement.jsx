import { useState, useEffect } from 'react';
import { Network, Search, RefreshCw, Save } from 'lucide-react';
import { supabase } from '../../services/supabase';

export default function IpManagement() {
  const [segment, setSegment] = useState('192.168.1');
  const [ipList, setIpList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateSegmentTemplate(segment);
  }, []);

  const generateSegmentTemplate = async (prefix) => {
    setLoading(true);
    
    // 1. Plantilla local base
    const template = [];
    for (let i = 1; i <= 254; i++) {
      template.push({
        ip_address: `${prefix}.${i}`,
        device_type: 'PC',
        status: 'AVAILABLE',
        mac_address: '',
        assigned_to_text: '',
        notes: ''
      });
    }

    // 2. Consulta y mapeo desde Supabase
    try {
      const { data, error } = await supabase
        .from('ip_addresses')
        .select('*')
        .like('ip_address', `${prefix}.%`);

      if (error) throw error;

      if (data && data.length > 0) {
        // Mapeamos asignando la columna de Supabase (assigned_user_text) al estado local (assigned_to_text)
        const savedMap = new Map(
          data.map(item => [
            item.ip_address,
            {
              ...item,
              assigned_to_text: item.assigned_user_text || item.assigned_to_text || ''
            }
          ])
        );

        const merged = template.map(item => savedMap.get(item.ip_address) || item);
        setIpList(merged);
      } else {
        setIpList(template);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setIpList(template);
    } finally {
      setLoading(false);
    }
  };

  const handleSegmentChange = (e) => {
    e.preventDefault();
    generateSegmentTemplate(segment);
  };

  const updateIpRow = (ipAddress, field, value) => {
    setIpList(prev => prev.map(row => {
      if (row.ip_address === ipAddress) {
        const updated = { ...row, [field]: value };
        // Cambio automático de estado según contenido
        if (field === 'assigned_to_text' || field === 'mac_address') {
          updated.status = (updated.assigned_to_text.trim() || updated.mac_address.trim()) ? 'ASSIGNED' : 'AVAILABLE';
        }
        return updated;
      }
      return row;
    }));
  };

  const saveSingleRow = async (row) => {
    try {
      const { error } = await supabase
        .from('ip_addresses')
        .upsert([{
          ip_address: row.ip_address,
          device_type: row.device_type,
          status: row.status,
          mac_address: row.mac_address,
          assigned_user_text: row.assigned_to_text,
          notes: row.notes
        }], { onConflict: 'ip_address' });

      if (error) throw error;
      alert(`Guardado con éxito: ${row.ip_address}`);
    } catch (err) {
      alert(`Error al guardar en Supabase: ${err.message}`);
    }
  };

  const filteredIps = ipList.filter(item => {
    const matchesFilter = filter === 'ALL' || item.status === filter;
    const matchesSearch = item.ip_address.includes(searchTerm) ||
      (item.device_type && item.device_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.assigned_to_text && item.assigned_to_text.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.mac_address && item.mac_address.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Network className="text-blue-600" /> Generador e Inventario de Red IP
          </h1>
          <p className="text-sm text-gray-500">Plantilla dinámica de direccionamiento por segmento (1.1 al 1.254).</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSegmentChange} className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Red / Segmento:</label>
          <input
            type="text"
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            placeholder="Ej: 192.168.1"
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-mono w-36 focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
          >
            <RefreshCw size={14} /> Cargar Segmento
          </button>
        </form>

        <div className="flex gap-2">
          {['ALL', 'AVAILABLE', 'ASSIGNED', 'RESERVED'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'ALL' ? 'Todas (254)' : s === 'AVAILABLE' ? 'Disponibles' : s === 'ASSIGNED' ? 'En Uso' : 'Reservadas'}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Filtrar por IP, host, tipo de dispositivo, MAC o usuario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Generando plantilla del segmento {segment}.X...</div>
        ) : (
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase z-10">
                <tr>
                  <th className="py-3 px-4">Dirección IP</th>
                  <th className="py-3 px-4">Tipo Dispositivo</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Dirección MAC</th>
                  <th className="py-3 px-4">Usuario / Equipo Asignado</th>
                  <th className="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredIps.map((row) => (
                  <tr key={row.ip_address} className="hover:bg-blue-50/50">
                    <td className="py-2 px-4 font-mono font-bold text-gray-900">{row.ip_address}</td>
                    
                    <td className="py-2 px-4">
                      <select
                        value={row.device_type}
                        onChange={(e) => updateIpRow(row.ip_address, 'device_type', e.target.value)}
                        className="px-2 py-1 border rounded text-xs bg-white"
                      >
                        <option value="PC">PC / Laptop</option>
                        <option value="SWITCH">Switch</option>
                        <option value="ROUTER">Router / Firewall</option>
                        <option value="ACCESS POINT">Access Point</option>
                        <option value="SERVER">Servidor</option>
                        <option value="IMPRESORA">Impresora</option>
                        <option value="CAMARA">Cámara IP</option>
                        <option value="LIBRE">Libre / Reserva</option>
                      </select>
                    </td>

                    <td className="py-2 px-4">
                      <select
                        value={row.status}
                        onChange={(e) => updateIpRow(row.ip_address, 'status', e.target.value)}
                        className={`px-2 py-1 rounded text-xs font-bold border ${
                          row.status === 'AVAILABLE' ? 'bg-green-50 text-green-700 border-green-200' :
                          row.status === 'ASSIGNED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}
                      >
                        <option value="AVAILABLE">Disponible</option>
                        <option value="ASSIGNED">En Uso</option>
                        <option value="RESERVED">Reservada</option>
                      </select>
                    </td>

                    <td className="py-2 px-4">
                      <input
                        type="text"
                        placeholder="00:1A:2B:3C:4D:5E"
                        value={row.mac_address || ''}
                        onChange={(e) => updateIpRow(row.ip_address, 'mac_address', e.target.value)}
                        className="px-2 py-1 border rounded text-xs font-mono w-32 focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    <td className="py-2 px-4">
                      <input
                        type="text"
                        placeholder="Escribe Usuario o Nombre de PC..."
                        value={row.assigned_to_text || ''}
                        onChange={(e) => updateIpRow(row.ip_address, 'assigned_to_text', e.target.value)}
                        className="px-2 py-1 border rounded text-xs w-full max-w-xs focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    <td className="py-2 px-4 text-center">
                      <button
                        onClick={() => saveSingleRow(row)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Guardar registro"
                      >
                        <Save size={16} />
                      </button>
                    </td>
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