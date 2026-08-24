import { useState } from 'react';
import { X, Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../../services/supabase';

export function ImportAssetsModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  // 1. Leer y parsear el archivo Excel
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target.result;
        const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convertir la hoja a JSON
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawJson.length === 0) {
          setErrorMsg('El archivo de Excel está vacío.');
          setParsedData([]);
          return;
        }

        // Mapear campos flexibles para coincidir con la tabla 'assets' en Supabase
        const formattedData = rawJson.map((row) => ({
          asset_code: String(row.asset_code || row.asset_tag || row.Etiqueta || row.Codigo || '').trim(),
          asset_tag: String(row.asset_tag || row.asset_code || row.Etiqueta || row.Codigo || '').trim(),
          asset_type: String(row.asset_type || row.category || row.Tipo || row.Categoria || 'General').trim(),
          category: String(row.category || row.asset_type || row.Categoria || row.Tipo || 'General').trim(),
          brand: String(row.brand || row.Marca || '').trim(),
          model: String(row.model || row.Modelo || '').trim(),
          serial_number: String(row.serial_number || row.Serie || row.NSerie || '').trim(),
          status: String(row.status || row.Estado || 'disponible').toLowerCase().trim(),
          condition: String(row.condition || row.Condicion || 'Bueno').trim(),
          location: String(row.location || row.Ubicacion || '').trim(),
          purchase_price: row.purchase_price || row.Precio ? parseFloat(row.purchase_price || row.Precio) : null,
          purchase_date: row.purchase_date || row.FechaCompra
            ? new Date(row.purchase_date || row.FechaCompra).toISOString().split('T')[0]
            : null,
          warranty_until: row.warranty_until || row.Garantia
            ? new Date(row.warranty_until || row.Garantia).toISOString().split('T')[0]
            : null,
          notes: String(row.notes || row.Notas || '').trim(),
        }));

        setParsedData(formattedData);
      } catch (err) {
        console.error('Error al procesar el archivo Excel:', err);
        setErrorMsg('Formato no válido. Sube un archivo .xlsx o .xls bien estructurado.');
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  // 2. Insertar registros masivos en Supabase
  const handleUpload = async () => {
    if (parsedData.length === 0) {
      setErrorMsg('No hay datos válidos para importar.');
      return;
    }

    // Validar que al menos exista la etiqueta o marca/modelo para cada activo
    const invalidRows = parsedData.filter((item) => !item.asset_tag && !item.brand);
    if (invalidRows.length > 0) {
      setErrorMsg(`Hay ${invalidRows.length} fila(s) a las que les falta 'asset_tag' o 'brand'.`);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.from('assets').insert(parsedData).select();

      if (error) throw error;

      setSuccessMsg(`¡Se importaron ${data.length} activos correctamente!`);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Error en Supabase bulk insert:', err);
      setErrorMsg(err.message || 'Error al insertar los registros en la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setErrorMsg(null);
    setSuccessMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="text-emerald-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">Importar Activos desde Excel</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-200">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Zona Drag & Drop */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors bg-gray-50/50">
            <input
              type="file"
              accept=".xlsx, .xls"
              id="excel-file-input"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="excel-file-input"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="text-blue-600" size={32} />
              <span className="text-sm font-medium text-gray-700">
                {file ? file.name : 'Haz clic para seleccionar o arrastra tu archivo Excel'}
              </span>
              <span className="text-xs text-gray-400">Soporta formatos .xlsx y .xls</span>
            </label>
          </div>

          {/* Vista previa rápida */}
          {parsedData.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-gray-600 uppercase">
                <span>Vista Previa ({parsedData.length} registros detectados)</span>
              </div>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100 text-xs bg-white">
                {parsedData.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="p-2 flex justify-between items-center">
                    <div>
                      <span className="font-mono text-blue-600 font-bold mr-2">
                        {item.asset_tag || 'SIN CÓDIGO'}
                      </span>
                      <span className="text-gray-900 font-medium">{item.brand} {item.model}</span>
                    </div>
                    <span className="text-gray-500 capitalize">{item.asset_type}</span>
                  </div>
                ))}
                {parsedData.length > 5 && (
                  <div className="p-2 text-center text-gray-400 italic">
                    ...y {parsedData.length - 5} filas más
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={loading || parsedData.length === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Importando...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet size={16} />
                  <span>Cargar {parsedData.length > 0 ? `${parsedData.length} Equipos` : ''}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}