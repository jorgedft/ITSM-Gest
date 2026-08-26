import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Plus, FileSpreadsheet, FileText } from 'lucide-react';
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

export default function PhoneList() {
  const navigate = useNavigate();
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchPhones();
  }, []);

  const fetchPhones = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('phones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhones(data || []);
    } catch (err) {
      console.error('Error al cargar la telefonía:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getEsimText = (esim) => {
    if (esim === true) return 'eSIM';
    if (esim === false) return 'Física';
    return '-';
  };

  const handleExportCSV = () => {
    try {
      setExporting(true);
      const headers = [
        'Dispositivo',
        'Número / SIM',
        'IMEI',
        'Asignado a',
        'Dpto.',
        'Plan Contrato',
        'Tipo SIM',
        'Inicio Serv.',
        'Fin Serv.',
      ];
      const rows = phones.map((phone) => [
        `${phone.brand || ''} ${phone.model || ''}`.trim() || 'Sin especificar',
        phone.phone_number || 'Sin Línea',
        phone.imei || '-',
        phone.assigned_to || 'Sin asignar',
        phone.department || '-',
        phone.contract_plan || '-',
        getEsimText(phone.esim),
        phone.service_start_date || '-',
        phone.service_end_date || '-',
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.map(escapeCSV).join(','))
        .join('\r\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, `telefonia-${todayStr()}.csv`);
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
      doc.text('Control de Telefonía', 14, 15);
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`Generado: ${new Date().toLocaleString('es-MX')} — ${phones.length} dispositivo(s)`, 14, 21);

      autoTable(doc, {
        startY: 26,
        head: [['Dispositivo', 'Número / SIM', 'IMEI', 'Asignado a', 'Dpto.', 'Plan', 'eSIM', 'Inicio', 'Fin']],
        body: phones.map((phone) => [
          `${phone.brand || ''} ${phone.model || ''}`.trim() || '-',
          phone.phone_number || 'Sin Línea',
          phone.imei || '-',
          phone.assigned_to || 'Sin asignar',
          phone.department || '-',
          phone.contract_plan || '-',
          getEsimText(phone.esim),
          phone.service_start_date || '-',
          phone.service_end_date || '-',
        ]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [37, 99, 235] },
      });

      doc.save(`telefonia-${todayStr()}.pdf`);
    } catch (err) {
      alert('Error al exportar PDF: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control de Telefonía</h1>
          <p className="text-sm text-gray-500">Gestión de dispositivos móviles, líneas corporativas y SIM cards.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportCSV}
            disabled={exporting || loading || phones.length === 0}
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <FileSpreadsheet size={16} /> Exportar CSV
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting || loading || phones.length === 0}
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <FileText size={16} /> Exportar PDF
          </button>
          <button
            onClick={() => navigate('/phones/new')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Nuevo Teléfono
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando inventario de teléfonos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">
                  <th className="py-3 px-4">Dispositivo</th>
                  <th className="py-3 px-4">Número / SIM</th>
                  <th className="py-3 px-4">IMEI</th>
                  <th className="py-3 px-4">Asignado a</th>
                  <th className="py-3 px-4">Dpto.</th>
                  <th className="py-3 px-4">Plan Contrato</th>
                  <th className="py-3 px-4">eSIM</th>
                  <th className="py-3 px-4">Inicio Serv.</th>
                  <th className="py-3 px-4">Fin Serv.</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm whitespace-nowrap">
                {phones.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-gray-400">
                      No hay teléfonos registrados.
                    </td>
                  </tr>
                ) : (
                  phones.map((phone) => {
                    const deviceName = `${phone.brand || ''} ${phone.model || ''}`.trim();
                    return (
                      <tr key={phone.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold text-gray-800">
                          {deviceName || <span className="text-gray-400 italic font-normal">Sin especificar</span>}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-blue-600">
                          {phone.phone_number || <span className="text-gray-400 font-sans">Sin Línea</span>}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-600">
                          {phone.imei || <span className="text-gray-400 font-sans">-</span>}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {phone.assigned_to || <span className="text-gray-400 italic">Sin asignar</span>}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {phone.department || <span className="text-gray-400">-</span>}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {phone.contract_plan || <span className="text-gray-400">-</span>}
                        </td>
                        <td className="py-3 px-4">
                          {phone.esim === true && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                              eSIM
                            </span>
                          )}
                          {phone.esim === false && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              Física
                            </span>
                          )}
                          {phone.esim === null && <span className="text-gray-400">-</span>}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-600">
                          {phone.service_start_date || <span className="text-gray-400">-</span>}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-600">
                          {phone.service_end_date || <span className="text-gray-400">-</span>}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}