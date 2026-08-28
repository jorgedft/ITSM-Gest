import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { ASSET_TYPES, LOCATIONS } from '@/utils/constants';
import AssetForm from './AssetForm';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function escapeCSV(value) {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Descompone una etiqueta en prefijo + número final, para poder ordenar TG002 antes que TG010.
function parseAssetTag(tag) {
  const match = /^(.*?)(\d+)$/.exec(tag || '');
  if (match) {
    return { hasNumber: true, prefix: match[1], number: parseInt(match[2], 10) };
  }
  return { hasNumber: false, prefix: tag || '', number: 0 };
}

// Ordena por número ascendente (TG001, TG002...); las etiquetas sin número al final, alfabéticamente.
function compareAssetTags(a, b) {
  const tagA = a.asset_tag || a.asset_code || '';
  const tagB = b.asset_tag || b.asset_code || '';
  const pa = parseAssetTag(tagA);
  const pb = parseAssetTag(tagB);

  if (pa.hasNumber && pb.hasNumber) {
    if (pa.prefix !== pb.prefix) return pa.prefix.localeCompare(pb.prefix);
    return pa.number - pb.number;
  }
  if (pa.hasNumber && !pb.hasNumber) return -1;
  if (!pa.hasNumber && pb.hasNumber) return 1;
  return tagA.localeCompare(tagB);
}

function getLocationLabel(value) {
  if (!value) return '—';
  const match = LOCATIONS.find((loc) => (typeof loc === 'object' ? loc.value : loc) === value);
  if (!match) return value;
  return typeof match === 'object' ? match.label : match;
}

export default function AssetList() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [exporting, setExporting] = useState(false);

  // Estados para Modal / Formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  // Aplica los filtros/búsqueda activos a cualquier query de Supabase.
  const applyFilters = useCallback((query) => {
    let q = query;
    if (selectedType) {
      q = q.eq('asset_type', selectedType);
    }
    if (selectedLocation) {
      q = q.eq('location', selectedLocation);
    }
    if (search.trim()) {
      q = q.or(
        `asset_tag.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%,serial_number.ilike.%${search}%,assigned_to.ilike.%${search}%,status.ilike.%${search}%`
      );
    }
    return q;
  }, [selectedType, selectedLocation, search]);

  // Trae todos los equipos que cumplan el filtro/búsqueda actual y los ordena por etiqueta.
  const loadAssets = useCallback(async () => {
    setLoading(true);

    let query = supabase.from('assets').select('*');
    query = applyFilters(query);

    const { data, error } = await query;

    if (error) {
      console.error('Error al cargar activos:', error.message);
    } else {
      setAssets([...(data || [])].sort(compareAssetTags));
    }
    setLoading(false);
  }, [applyFilters]);

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

  // Helper para concatenar el Estado y el Usuario Asignado
  const renderStatus = (item) => {
    const statusText = item.status || 'Disponible';
    const assignedUser = item.assigned_to ? item.assigned_to.trim() : '';

    if (assignedUser) {
      return `${statusText} - ${assignedUser}`;
    }
    return statusText;
  };

  const handleExportCSV = () => {
    try {
      setExporting(true);

      const headers = ['Etiqueta', 'Tipo', 'Marca', 'Modelo', 'SN', 'Ubicación / Área', 'Estado'];
      const rows = assets.map((item) => [
        item.asset_tag || item.asset_code || '',
        item.asset_type || '',
        item.brand || '',
        item.model || '',
        item.serial_number || '',
        getLocationLabel(item.location),
        renderStatus(item),
      ]);

      const metaLines = [
        ['Gestión de Equipos Treggo'],
        [`Generado: ${new Date().toLocaleString('es-MX')}`],
        [`Total de equipos: ${assets.length}`],
        [],
      ];

      const csvContent = [...metaLines, headers, ...rows]
        .map((row) => row.map(escapeCSV).join(','))
        .join('\r\n');

      // BOM (﻿) para que Excel detecte UTF-8 y no rompa acentos/ñ
      const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, `inventario-equipos-${todayStr()}.csv`);
    } catch (err) {
      alert('Error al exportar CSV: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = () => {
    try {
      setExporting(true);

      const doc = new jsPDF({ orientation: 'landscape' });

      doc.setFontSize(14);
      doc.text('Gestión de Equipos Treggo', 14, 15);
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`Generado: ${new Date().toLocaleString('es-MX')} — Total de equipos: ${assets.length}`, 14, 21);

      autoTable(doc, {
        startY: 26,
        head: [['Etiqueta', 'Tipo', 'Marca / Modelo', 'SN', 'Ubicación / Área', 'Estado']],
        body: assets.map((item) => [
          item.asset_tag || item.asset_code || '—',
          item.asset_type || '—',
          `${item.brand || ''} ${item.model || ''}`.trim() || '—',
          item.serial_number || '—',
          getLocationLabel(item.location),
          renderStatus(item),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235] },
      });

      doc.save(`inventario-equipos-${todayStr()}.pdf`);
    } catch (err) {
      alert('Error al exportar PDF: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Cabecera y Botones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inventario de Equipos ({assets.length})</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="btn-secondary disabled:opacity-50"
          >
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="btn-secondary disabled:opacity-50"
          >
            {exporting ? 'Exportando...' : 'Exportar PDF'}
          </button>
          <button onClick={handleCreateNew} className="btn-primary">
            + Nuevo Equipo
          </button>
        </div>
      </div>

      {/* Filtros y Buscador */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Buscar etiqueta, marca, serie, asignado..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
        />

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="input-field"
        >
          <option value="">Todos los tipos</option>
          {ASSET_TYPES.map((type) => {
            const value = typeof type === 'object' ? type.value : type;
            const label = typeof type === 'object' ? type.label : type;
            return (
              <option key={value} value={value}>
                {label}
              </option>
            );
          })}
        </select>

        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="input-field"
        >
          <option value="">Todas las ubicaciones</option>
          {LOCATIONS.map((loc) => {
            const value = typeof loc === 'object' ? loc.value : loc;
            const label = typeof loc === 'object' ? loc.label : loc;
            return (
              <option key={value} value={value}>
                {label}
              </option>
            );
          })}
        </select>
      </div>

      {/* Tabla de Equipos */}
      <div className="table-container overflow-x-auto">
        <table className="table-app w-full text-left">
          <thead>
            <tr className="border-b bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
              <th className="py-3 px-4">Etiqueta de equipo</th>
              <th className="py-3 px-4">Tipo</th>
              <th className="py-3 px-4">Marca / Modelo</th>
              <th className="py-3 px-4">SN</th>
              <th className="py-3 px-4">Ubicación / Área</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">Cargando equipos...</td>
              </tr>
            ) : assets.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">No se encontraron equipos</td>
              </tr>
            ) : (
              assets.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {/* 1. Etiqueta de equipo */}
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    {item.asset_tag || item.asset_code || '—'}
                  </td>

                  {/* 2. Tipo */}
                  <td className="py-3 px-4">{item.asset_type || '—'}</td>

                  {/* 3. Marca / Modelo */}
                  <td className="py-3 px-4">
                    {item.brand || item.model
                      ? `${item.brand || ''} ${item.model || ''}`.trim()
                      : '—'}
                  </td>

                  {/* 4. SN */}
                  <td className="py-3 px-4 font-mono text-xs text-gray-700">
                    {item.serial_number || '—'}
                  </td>

                  {/* 5. Ubicación / Área */}
                  <td className="py-3 px-4 text-gray-700">
                    {getLocationLabel(item.location)}
                  </td>

                  {/* 6. Estado (ej. Asignado - Juan Pérez) */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
                      {renderStatus(item)}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="py-3 px-4 text-right space-x-2">
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