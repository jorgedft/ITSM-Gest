import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ASSET_TYPES, LOCATIONS } from '../constants/assets';

export default function AssetForm({ assetToEdit, onSuccess, onCancel }) {
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
        asset_code: formData.asset_tag, // Mantenemos compatibilidad si usas asset_code en otro lado
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