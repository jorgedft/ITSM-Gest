import { FileSpreadsheet, FileText } from "lucide-react";
export function ExportButtons({ onExcelClick, onPDFClick, disabled = false }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onExcelClick} disabled={disabled}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        <FileSpreadsheet size={15} /> Excel
      </button>
      <button onClick={onPDFClick} disabled={disabled}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        <FileText size={15} /> PDF
      </button>
    </div>
  );
}