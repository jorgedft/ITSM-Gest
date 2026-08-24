import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Plus, Smartphone } from 'lucide-react';

export default function PhoneList() {
  const navigate = useNavigate();
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhones();
  }, []);

  const fetchPhones = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('phones')
        .select('*, profiles:assigned_to(full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhones(data || []);
    } catch (err) {
      console.error('Error al cargar la telefonía:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control de Telefonía</h1>
          <p className="text-sm text-gray-500">Gestión de dispositivos móviles, líneas corporativas y SIM cards.</p>
        </div>
        <button
          onClick={() => navigate('/phones/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Nuevo Teléfono
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando inventario de teléfonos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-3 px-4">Dispositivo</th>
                  <th className="py-3 px-4">Número / SIM</th>
                  <th className="py-3 px-4">IMEI</th>
                  <th className="py-3 px-4">Asignado a</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {phones.map((phone) => (
                  <tr key={phone.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-800">{phone.brand} {phone.model}</td>
                    <td className="py-3 px-4 font-mono text-xs text-blue-600">{phone.phone_number || 'Sin Línea'}</td>
                    <td className="py-3 px-4 font-mono text-xs">{phone.imei}</td>
                    <td className="py-3 px-4 text-gray-700">
                      {phone.profiles?.full_name || <span className="text-gray-400 italic">Sin asignar</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/phones/${phone.id}/edit`)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                      >
                        Editar
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