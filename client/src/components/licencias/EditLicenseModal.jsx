import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../services/supabase';

export function EditLicenseModal({ license, isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    software_name: '',
    provider: '',
    license_key: '',
    seats_purchased: 1,
    expiration_date: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Cargar los datos de la licencia seleccionada en el formulario
  useEffect(() => {
    if (license) {
      setFormData({
        software_name: license.software_name || '',
        provider: license.provider || '',
        license_key: license.license_key || '',
        seats_purchased: license.seats_purchased || 1,
        expiration_date: license.expiration_date ? license.expiration_date.split('T')[0] : '',
        notes: license.notes || ''
      });
      setErrorMsg(null);
    }
  }, [license]);

  if (!isOpen || !license) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from('licenses')
        .update({
          software_name: formData.software_name,
          provider: formData.provider,
          license_key: formData.license_key,
          seats_purchased: parseInt(formData.seats_purchased, 10),
          expiration_date: formData.expiration_date || null,
          notes: formData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', license.id);

      if (error) throw error;

      onSuccess(); // Recarga la lista
      onClose();   // Cierra el modal
    } catch (err) {
      console.error('Error al actualizar licencia:', err);
      setErrorMsg(err.message || 'Error al guardar las modificaciones');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-fade-in">
        {/* Encabezado del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Editar Licencia</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Nombre del Software / Servicio
            </label>
            <input
              type="text"
              name="software_name"
              required
              value={formData.software_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Proveedor / Marca
            </label>
            <input
              type="text"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Clave de Licencia / Product Key
            </label>
            <input
              type="text"
              name="license_key"
              value={formData.license_key}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Asientos / Usuarios
              </label>
              <input
                type="number"
                name="seats_purchased"
                min="1"
                required
                value={formData.seats_purchased}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Fecha de Expiración
              </label>
              <input
                type="date"
                name="expiration_date"
                value={formData.expiration_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Notas / Observaciones
            </label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}