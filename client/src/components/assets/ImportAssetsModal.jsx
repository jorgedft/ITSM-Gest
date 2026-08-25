import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient'; // Ajusta la ruta a tu cliente de Supabase si es distinta

// 1. Constantes de tipos y ubicaciones (Áreas)
const ASSET_TYPES = [
  { value: 'Router', label: 'Router' },
  { value: 'Switch', label: 'Switch' },
  { value: 'Laptop/CPU', label: 'Laptop / CPU' },
  { value: 'Monitor', label: 'Monitor' },
  { value: 'Impresora', label: 'Impresora' },
  { value: 'Periferico', label: 'Periférico' },
  { value: 'Otro', label: 'Otro' }
];

const LOCATIONS = [
  'Contabilidad',
  'Administración',
  'Sistemas / TI',
  'Ventas',
  'Recursos Humanos',
  'Operaciones / Almacén',
  'Dirección',
  'Recepción',
  'Soporte Técnico'
];

const LIMIT = 10;

// 2. Componente Interno del Formulario (Crear / Editar)
function AssetForm({ assetToEdit, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    asset_tag: '',
    asset_type: 'Laptop/CPU',
    brand: '',
    model: '',
    serial_number: '',
    assigned_to: '',
    location: LOCATIONS[0],
    warranty_info: ''
  });

  useEffect(() => {
    if (assetToEdit) {
      setFormData({
        asset_tag: assetToEdit.asset_tag || assetToEdit.asset_code || '',
        asset_type: assetToEdit.asset_type || 'Laptop/CPU',
        brand: assetToEdit.brand || '',
        model: assetToEdit.model || '',
        serial_number: assetToEdit.serial_number || '',
        assigned_to: assetToEdit.assigned_to || '',
        location: assetToEdit.location || LOCATIONS[0],
        warranty_info: assetToEdit.warranty_info || ''
      });
    }
  }, [assetToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        asset_tag: formData.asset_tag,
        asset_code: formData.asset_tag, // Mantiene compatibilidad
        asset_type: formData.asset_type,
        brand: formData.brand,
        model: formData.model,
        serial_number: formData.serial_number,
        assigned_to: formData.assigned_to,
        location: formData.location,
        warranty_info: formData.warranty_info
      };

      if (assetToEdit?.id) {
        const { error } = await supabase
          .from('assets')
          .update(payload)
          .eq('id', assetToEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('assets')
          .insert([payload]);
        if (error) throw error;
      }

      onSuccess();
    } catch (err) {
      alert('Error al guardar el equipo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Etiqueta / Código de Activo */}
        <div>
          <label className="label">Etiqueta / Código de Activo *</label>
          <input
            type="text"
            name="asset_tag"
            required
            value={formData.asset_tag}
            onChange={handleChange}
            placeholder="Ej. ACT-001"
            className="input-field"
          />
        </div>

        {/* Tipo de Activo */}
        <div>
          <label className="label">Tipo de Activo *</label>
          <select
            name="asset_type"
            value={formData.asset_type}
            onChange={handleChange}
            className="input-field"
          >
            {ASSET_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Marca */}
        <div>
          <label className="label">Marca</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Ej. Dell, Cisco, HP"
            className="input-field"
          />
        </div>

        {/* Modelo */}
        <div>
          <label className="label">Modelo</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="Ej. Latitude 3420"
            className="input-field"
          />
        </div>

        {/* Número de Serie */}
        <div>
          <label className="label">Número de Serie (SN)</label>
          <input
            type="text"
            name="serial_number"
            value={formData.serial_number}
            onChange={handleChange}
            placeholder="Ej. SN-987654321"
            className="input-field"
          />
        </div>

        {/* Asignado a (Texto libre) */}
        <div>
          <label className="label">Asignado a (Persona o Lugar)</label>
          <input
            type="text"
            name="assigned_to"
            value={formData.assigned_to}
            onChange={handleChange}
            placeholder="Ej. Juan Pérez / Sala de Juntas"
            className="input-field"
          />
        </div>

        {/* Ubicación (Lista de Áreas) */}
        <div>
          <label className="label">Ubicación (Área)</label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="input-field"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Garantía */}
        <div>
          <label className="label">Garantía / Info de Garantía</label>
          <input
            type="text"
            name="warranty_info"
            value={formData.warranty_info}
            onChange={handleChange}
            placeholder="Ej. Vigente hasta 2027 / ProSupport"
            className="input-field"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Guardando...' : assetToEdit ? 'Actualizar Equipo' : 'Guardar Equipo'}
        </button>
      </div>
    </form>
  );
}

// 3. Componente Principal Exportado
export default function ImportAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    const from = (page - 1) * LIMIT;
    const to = from + LIMIT - 1;

    let query = supabase
      .from('assets')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false });

    if (selectedType) {
      query = query.eq('asset_type', selectedType);
    }
    if (selectedLocation) {
      query = query.eq('location', selectedLocation);
    }
    if (search.trim()) {
      query = query.or(
        `asset_tag.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%,serial_number.ilike.%${search}%,assigned_to.ilike.%${search}%`
      );
    }

    const { data, count, error } = await query;

    if (error) {
      console.error('Error al cargar equipos:', error.message);
    } else {
      setAssets(data || []);
      setTotal(count || 0);
    }
    setLoading(false);
  }, [page, search, selectedType, selectedLocation]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleCreateNew = () => {
    setEditingAsset(null);
    setIsModalOpen(true);
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Deseas eliminar este equipo?')) return;

    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) {
      alert('Error al eliminar: ' + error.message);
    } else {
      loadAssets();
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingAsset(null);
    loadAssets();
  };

  return (
    <div className="space-y-4 p-2 sm:p-4">
      {/* Cabecera y Botón Nuevo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inventario de Equipos ({total})</h1>
        </div>
        <button onClick={handleCreateNew} className="btn-primary">
          + Nuevo equipo
        </button>
      </div>

      {/* Filtros y Buscador */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Buscar etiqueta, marca, modelo, serie, asignado..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field"
        />

        <select
          value={selectedType}
          onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
          className="input-field"
        >
          <option value="">Todos los tipos</option>
          {ASSET_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <select
          value={selectedLocation}
          onChange={(e) => { setSelectedLocation(e.target.value); setPage(1); }}
          className="input-field"
        >
          <option value="">Todas las ubicaciones</option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* Tabla de Equipos */}
      <div className="table-container">
        <table className="table-app">
          <thead>
            <tr>
              <th>Etiqueta</th>
              <th>Tipo</th>
              <th>Marca / Modelo</th>
              <th>Serie (SN)</th>
              <th>Asignado a</th>
              <th>Ubicación</th>
              <th>Garantía</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">Cargando equipos...</td>
              </tr>
            ) : assets.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">No se encontraron equipos</td>
              </tr>
            ) : (
              assets.map((item) => (
                <tr key={item.id}>
                  <td className="font-semibold text-gray-900">{item.asset_tag || item.asset_code || '—'}</td>
                  <td>{item.asset_type || '—'}</td>
                  <td>
                    {item.brand || ''} {item.model || ''}
                  </td>
                  <td className="font-mono text-xs">{item.serial_number || '—'}</td>
                  <td>{item.assigned_to || '—'}</td>
                  <td>{item.location || '—'}</td>
                  <td>{item.warranty_info || '—'}</td>
                  <td className="text-right space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-medium"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingAsset ? 'Editar Equipo' : 'Nuevo Equipo'}
            </h2>
            <AssetForm
              assetToEdit={editingAsset}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}