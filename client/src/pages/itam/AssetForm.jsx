import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { UserPlus, Save, ArrowLeft, X } from 'lucide-react';

export default function AssetForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal de usuario rápido
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserDept, setNewUserDept] = useState('');

  const [formData, setFormData] = useState({
    asset_code: '',
    category: 'Laptop',
    brand: '',
    model: '',
    serial_number: '',
    department: '',
    status: 'Disponible',
    assigned_to: '',
    notes: ''
  });

  useEffect(() => {
    fetchEmployees();
    if (id) fetchAsset();
  }, [id]);

  const fetchEmployees = async () => {
    const { data } = await supabase.from('employees').select('*').order('full_name');
    setEmployees(data || []);
  };

  const fetchAsset = async () => {
    const { data } = await supabase.from('assets').select('*').eq('id', id).single();
    if (data) setFormData(data);
  };

  // Auto-completar el departamento al seleccionar un empleado existente
  const handleUserChange = (e) => {
    const selectedId = e.target.value;
    const selectedEmp = employees.find(emp => emp.id === selectedId);
    
    setFormData(prev => ({
      ...prev,
      assigned_to: selectedId,
      department: selectedEmp?.department || prev.department,
      status: selectedId ? 'Asignado' : 'Disponible'
    }));
  };

  const handleQuickAddUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('employees')
        .insert([{ full_name: newUserName, department: newUserDept }])
        .select()
        .single();

      if (error) throw error;

      setEmployees(prev => [...prev, data]);
      setFormData(prev => ({ 
        ...prev, 
        assigned_to: data.id, 
        department: data.department || prev.department,
        status: 'Asignado' 
      }));
      
      setNewUserName('');
      setNewUserDept('');
      setShowUserModal(false);
    } catch (err) {
      alert(`Error al agregar usuario: ${err.message}`);
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const payload = {
      ...formData,
      asset_tag: formData.asset_code,   // Asigna asset_tag si la BD lo pide
      asset_type: formData.category,    // Asigna asset_type enviando la categoría
      status: formData.assigned_to ? 'Asignado' : formData.status
    };

    const { error } = id
      ? await supabase.from('assets').update(payload).eq('id', id)
      : await supabase.from('assets').insert([payload]);

    if (error) throw error;
    navigate('/assets');
  } catch (err) {
    alert(`Error al guardar: ${err.message}`);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/assets')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          {id ? 'Editar Equipo' : 'Nuevo Equipo'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Código de Activo</label>
            <input
              type="text"
              required
              value={formData.asset_code}
              onChange={e => setFormData({ ...formData, asset_code: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="Ej: ESQ870001"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Categoría</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="Laptop">Laptop</option>
              <option value="Desktop">Desktop</option>
              <option value="Servidor">Servidor</option>
              <option value="Switch">Switch</option>
              <option value="Impresora">Impresora</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Marca</label>
            <input
              type="text"
              value={formData.brand}
              onChange={e => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Modelo</label>
            <input
              type="text"
              value={formData.model}
              onChange={e => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Número de Serie (SN)</label>
            <input
              type="text"
              required
              placeholder="SN-XXXXXX"
              value={formData.serial_number}
              onChange={e => setFormData({ ...formData, serial_number: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Campo Asignación con Botón para Crear Usuario */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-700">Usuario Asignado</label>
              <button
                type="button"
                onClick={() => setShowUserModal(true)}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                <UserPlus size={14} /> + Crear Usuario
              </button>
            </div>

            <select
              value={formData.assigned_to}
              onChange={handleUserChange}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="">Sin Asignar</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} {emp.department ? `(${emp.department})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Departamento</label>
            <input
              type="text"
              placeholder="Ej: Finanzas / Sistemas"
              value={formData.department}
              onChange={e => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Notas / Observaciones</label>
          <textarea
            rows="3"
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold"
          >
            <Save size={16} /> {loading ? 'Guardando...' : 'Guardar Equipo'}
          </button>
        </div>
      </form>

      {/* Modal para Crear Usuario Rápido */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-900 text-base">Registrar Nuevo Empleado</h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleQuickAddUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Pérez"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Departamento</label>
                <input
                  type="text"
                  placeholder="Ej: Contabilidad / IT"
                  value={newUserDept}
                  onChange={e => setNewUserDept(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
                >
                  Guardar y Seleccionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}