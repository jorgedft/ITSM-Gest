import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { ASSET_TYPES, ASSET_STATUS } from '../../utils/constants';

export default function AssetForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [formData, setFormData] = useState({
    asset_tag: '',
    asset_type: '',
    brand: '',
    model: '',
    serial_number: '',
    status: '',
    condition: '',
    assigned_to: '',
    location: '',
    purchase_price: '',
    purchase_date: '',
    warranty_until: '',
    notes: '',
  });

  // Cargar lista de empleados para la asignación y los datos del activo si se está editando
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);

        // 1. Obtener empleados para el selector
        const { data: empData, error: empErr } = await supabase
          .from('employees')
          .select('id, full_name, department')
          .order('full_name', { ascending: true });

        if (empErr) console.error('Error al obtener empleados:', empErr);
        else setEmployees(empData || []);

        // 2. Si se trata de una edición, cargar los datos del activo
        if (isEditing) {
          const { data, error } = await supabase
            .from('assets')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          if (data) {
            setFormData({
              asset_tag: data.asset_tag || data.asset_code || '',
              asset_type: data.asset_type || data.category || '',
              brand: data.brand || '',
              model: data.model || '',
              serial_number: data.serial_number || '',
              status: data.status || '',
              condition: data.condition || '',
              assigned_to: data.assigned_to || '',
              location: data.location || '',
              purchase_price: data.purchase_price || '',
              purchase_date: data.purchase_date || '',
              warranty_until: data.warranty_until || '',
              notes: data.notes || '',
            });
          }
        }
      } catch (err) {
        setErrorMsg('Error al cargar la información del formulario.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  setErrorMsg(null);

  // Convertir cadenas vacías en null para no romper los tipos DATE / NUMERIC en Supabase
  const payload = {
    ...formData,
    assigned_to: formData.assigned_to || null,
    purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
    warranty_until: formData.warranty_until || null,
    // Asegurar que campos de texto opcionales no envíen solo espacios
    brand: formData.brand || null,
    model: formData.model || null,
    serial_number: formData.serial_number || null,
    condition: formData.condition || null,
    location: formData.location || null,
    notes: formData.notes || null,
  };

  try {
    if (isEditing) {
      const { error } = await supabase.from('assets').update(payload).eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('assets').insert([payload]);
      if (error) throw error;
    }

    navigate('/assets');
  } catch (err) {
    setErrorMsg(err.message || 'Error al guardar el registro.');
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="animate-spin text-brand-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Activo' : 'Nuevo Activo'}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/assets')}
          className="btn-secondary text-sm flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Volver / Cancelar</span>
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6 bg-white p-6 rounded-xl border border-gray-200">
        
        {/* Sección: Datos Generales */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Información Principal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Etiqueta / Código *
              </label>
              <input
                type="text"
                name="asset_tag"
                value={formData.asset_tag}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Tipo de Activo
              </label>
              <select
                name="asset_type"
                value={formData.asset_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="">Seleccionar tipo</option>
                {ASSET_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Marca</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Modelo</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Nº Serie</label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono text-gray-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Estado</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="">Seleccionar estado</option>
                {ASSET_STATUS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sección: Asignación y Ubicación */}
        <div className="pt-4 border-t border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Asignación y Ubicación</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Asignado a</label>
              <select
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="">Sin asignar</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} {emp.department ? `(${emp.department})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Condición</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="">Seleccionar condición</option>
                <option value="nuevo">Nuevo</option>
                <option value="excelente">Excelente</option>
                <option value="bueno">Bueno</option>
                <option value="regular">Regular</option>
                <option value="malo">Malo / Para reparación</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Ubicación / Oficina</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ej. Oficina Central, Piso 2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Sección: Datos Financieros y Garantía */}
        <div className="pt-4 border-t border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Detalles de Compra y Garantía</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Precio de Compra</label>
              <input
                type="number"
                step="0.01"
                name="purchase_price"
                value={formData.purchase_price}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Fecha de Compra</label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Vencimiento de Garantía</label>
              <input
                type="date"
                name="warranty_until"
                value={formData.warranty_until}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Sección: Notas */}
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Notas Adicionales</label>
          <textarea
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Observaciones sobre el estado del equipo, accesorios incluidos..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/assets')}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>{isEditing ? 'Guardar Cambios' : 'Crear Activo'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}