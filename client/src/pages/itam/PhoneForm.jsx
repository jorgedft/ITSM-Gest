import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { ArrowLeft, Save } from 'lucide-react';

export default function PhoneForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    imei: '',
    phone_number: '',
    assigned_to: '',
  });

  useEffect(() => {
    fetchUsers();
    if (isEdit) fetchPhoneDetail();
  }, [id]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('id, full_name');
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err.message);
    }
  };

  const fetchPhoneDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('phones').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) {
        setFormData({
          brand: data.brand || '',
          model: data.model || '',
          imei: data.imei || '',
          phone_number: data.phone_number || '',
          assigned_to: data.assigned_to || '',
        });
      }
    } catch (err) {
      console.error('Error al cargar detalle del teléfono:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      assigned_to: formData.assigned_to === '' ? null : formData.assigned_to,
    };

    try {
      let error;
      if (isEdit) {
        ({ error } = await supabase.from('phones').update(payload).eq('id', id));
      } else {
        ({ error } = await supabase.from('phones').insert([payload]));
      }

      if (error) throw error;
      navigate('/phones');
    } catch (err) {
      alert(`Error al guardar teléfono: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/phones')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Editar Dispositivo' : 'Nuevo Dispositivo Móvil'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
          <input
            type="text"
            required
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Samsung, Apple, Xiaomi..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
          <input
            type="text"
            required
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Galaxy A54, iPhone 13..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">IMEI</label>
          <input
            type="text"
            required
            value={formData.imei}
            onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="358912345678901"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número Celular / Línea</label>
          <input
            type="text"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="+52 55 1234 5678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Asignado a</label>
          <select
            value={formData.assigned_to}
            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sin Asignar</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.full_name || u.id}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/phones')}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Save size={16} /> {loading ? 'Guardando...' : 'Guardar Dispositivo'}
          </button>
        </div>
      </form>
    </div>
  );
}