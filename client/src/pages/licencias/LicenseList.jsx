import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Plus, Pencil } from 'lucide-react';
import { EditLicenseModal } from '../../components/licencias/EditLicenseModal';

export default function LicenseList() {
  const navigate = useNavigate();
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el Modal de Edición
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLicenses(data || []);
    } catch (err) {
      console.error('Error al cargar licencias:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (license) => {
    setSelectedLicense(license);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Licencias de Software</h1>
          <p className="text-sm text-gray-500">Control de suscripciones, llaves de activación y vencimientos.</p>
        </div>
        <button
          onClick={() => navigate('/licenses/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Nueva Licencia
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando catálogo de licencias...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-3 px-4">Software</th>
                  <th className="py-3 px-4">Proveedor / Tipo</th>
                  <th className="py-3 px-4">Clave / Key</th>
                  <th className="py-3 px-4">Vencimiento</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {licenses.map((lic) => (
                  <tr key={lic.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-800">{lic.software_name}</td>
                    <td className="py-3 px-4 text-gray-600">{lic.provider || 'N/A'}</td>
                    <td className="py-3 px-4 font-mono text-xs text-blue-600">{lic.license_key || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {lic.expiration_date ? new Date(lic.expiration_date).toLocaleDateString() : 'Perpetua'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEditClick(lic)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-semibold hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                      >
                        <Pencil size={14} /> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Edición */}
      <EditLicenseModal
        license={selectedLicense}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchLicenses}
      />
    </div>
  );
}