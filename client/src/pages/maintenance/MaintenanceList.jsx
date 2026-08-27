import { useState, useEffect, useCallback } from "react";
import { 
  Wrench, BookOpen, Plus, Search, Trash2, Edit, 
  FileText, CheckCircle2, ChevronRight, X, RefreshCw 
} from "lucide-react";
import { supabase } from "../../services/supabase";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { fDate } from "../../utils/formatters";

export default function MaintenanceList() {
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Estados del Modal de Workflows/Procedimientos
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const [workflowSearch, setWorkflowSearch] = useState("");

  // Formulario de Guía
  const [wfForm, setWfForm] = useState({
    title: "",
    category: "Software",
    steps: "",
    tags: ""
  });

  // Cargar Mantenimientos
// Cargar Mantenimientos
const loadMaintenances = useCallback(async () => {
  setLoading(true);
  try {
    const { data, error } = await supabase
      .from("maintenance_logs") // <-- CAMBIADO: maintenance_logs en lugar de maintenances
      .select("*, asset:assets(asset_code, brand, model)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    setMaintenances(data || []);
  } catch (err) {
    console.error("Error al cargar mantenimientos:", err.message);
  } finally {
    setLoading(false);
  }
}, []);

  // Cargar Procedimientos
  const loadWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from("maintenance_workflows")
        .select("*")
        .order("title", { ascending: true });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (err) {
      console.error("Error al cargar procedimientos:", err.message);
    }
  };

  useEffect(() => {
    loadMaintenances();
  }, [loadMaintenances]);

  // Abrir Modal de Guías
  const handleOpenWorkflows = () => {
    loadWorkflows();
    setIsWorkflowModalOpen(true);
    setSelectedWorkflow(null);
    setIsCreatingWorkflow(false);
  };

  // Guardar Nuevo Procedimiento
  const handleSaveWorkflow = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("maintenance_workflows").insert([wfForm]);
      if (error) throw error;

      setWfForm({ title: "", category: "Software", steps: "", tags: "" });
      setIsCreatingWorkflow(false);
      loadWorkflows();
    } catch (err) {
      alert(`Error al guardar procedimiento: ${err.message}`);
    }
  };

  // Eliminar Procedimiento
  const handleDeleteWorkflow = async (id, title) => {
    if (!window.confirm(`¿Eliminar la guía "${title}"?`)) return;
    try {
      const { error } = await supabase.from("maintenance_workflows").delete().eq("id", id);
      if (error) throw error;
      if (selectedWorkflow?.id === id) setSelectedWorkflow(null);
      loadWorkflows();
    } catch (err) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  const filteredWorkflows = workflows.filter(
    (w) =>
      w.title.toLowerCase().includes(workflowSearch.toLowerCase()) ||
      (w.tags && w.tags.toLowerCase().includes(workflowSearch.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wrench size={24} className="text-brand-500" />
            Bitácora de Mantenimientos
          </h1>
          <p className="text-xs text-gray-500">Historial de intervenciones preventivas y correctivas en equipos</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenWorkflows}
            className="btn-secondary flex items-center gap-2 border-brand-500 text-brand-600 hover:bg-brand-50"
          >
            <BookOpen size={16} /> Guías y Flujos de Instalación
          </button>
        </div>
      </div>

      {/* Tabla Principal de Mantenimientos */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <Spinner />
        ) : maintenances.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="Sin registros de mantenimiento"
            description="Consulta las guías de instalación o registra mantenimientos realizados."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Fecha</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Equipo</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {maintenances.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-xs whitespace-nowrap">{fDate(m.created_at)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {m.asset ? `${m.asset.brand} ${m.asset.model} (${m.asset.asset_code})` : "Equipo N/A"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                        {m.type || "Preventivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{m.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL BÓVEDA DE GUÍAS / PROCEDIMIENTOS DE INSTALACIÓN */}
      {isWorkflowModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
            
            {/* Header del Modal */}
            <div className="px-6 py-4 bg-gray-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BookOpen size={20} className="text-brand-400" />
                <h3 className="font-bold text-lg">Guías de Instalación y Flujos de Trabajo</h3>
              </div>
              <button
                onClick={() => setIsWorkflowModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cuerpo del Modal con Panel Dividido */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Panel Izquierdo: Lista de Flujos */}
              <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
                <div className="p-3 border-b border-gray-200 space-y-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar guía (ej: Contpaqi)..."
                      value={workflowSearch}
                      onChange={(e) => setWorkflowSearch(e.target.value)}
                      className="input-field pl-8 text-xs w-full bg-white"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setIsCreatingWorkflow(true);
                      setSelectedWorkflow(null);
                    }}
                    className="btn-primary w-full text-xs py-1.5 flex items-center justify-center gap-1"
                  >
                    <Plus size={14} /> Nueva Guía / Flujo
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                  {filteredWorkflows.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400">No se encontraron guías</div>
                  ) : (
                    filteredWorkflows.map((wf) => (
                      <button
                        key={wf.id}
                        onClick={() => {
                          setSelectedWorkflow(wf);
                          setIsCreatingWorkflow(false);
                        }}
                        className={`w-full text-left p-3 transition-colors flex items-center justify-between ${
                          selectedWorkflow?.id === wf.id ? "bg-brand-50 border-l-4 border-brand-500" : "hover:bg-gray-100"
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-xs text-gray-900">{wf.title}</p>
                          <span className="text-[10px] text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded mt-1 inline-block">
                            {wf.category}
                          </span>
                        </div>
                        <ChevronRight size={14} className="text-gray-400" />
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Panel Derecho: Detalle de Guía o Formulario de Creación */}
              <div className="w-2/3 p-6 overflow-y-auto bg-white flex flex-col">
                {isCreatingWorkflow ? (
                  <form onSubmit={handleSaveWorkflow} className="space-y-4">
                    <h4 className="font-bold text-gray-900 text-base flex items-center gap-2 border-b pb-2">
                      <Plus size={18} className="text-brand-500" /> Registrar Nuevo Flujo
                    </h4>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Título del Procedimiento *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Instalación Completa Contpaqi Contabilidad Server"
                        value={wfForm.title}
                        onChange={(e) => setWfForm({ ...wfForm, title: e.target.value })}
                        className="input-field text-sm w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Categoría</label>
                        <select
                          value={wfForm.category}
                          onChange={(e) => setWfForm({ ...wfForm, category: e.target.value })}
                          className="input-field text-sm w-full"
                        >
                          <option value="Software">Software ERP / Ofimática</option>
                          <option value="Sistema Operativo">Sistema Operativo / Formateo</option>
                          <option value="Redes">Redes / Periféricos</option>
                          <option value="Seguridad">Seguridad / Antivirus</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Etiquetas (palabras clave)</label>
                        <input
                          type="text"
                          placeholder="contpaqi, sql, servidor"
                          value={wfForm.tags}
                          onChange={(e) => setWfForm({ ...wfForm, tags: e.target.value })}
                          className="input-field text-sm w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Paso a Paso del Flujo (Detalla carpetas, ejecutables, licencias, etc.) *
                      </label>
                      <textarea
                        required
                        rows={10}
                        placeholder={`1. Descargar el ejecutable desde la ruta servidor/instaladores\n2. Ejecutar como Administrador e instalar el Servidor BDD\n3. Clave de licencia: XXXX-XXXX\n4. Configurar puerto 1433 en Firewall...`}
                        value={wfForm.steps}
                        onChange={(e) => setWfForm({ ...wfForm, steps: e.target.value })}
                        className="input-field text-sm font-mono w-full"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <button
                        type="button"
                        onClick={() => setIsCreatingWorkflow(false)}
                        className="btn-secondary text-xs"
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="btn-primary text-xs">
                        Guardar Flujo
                      </button>
                    </div>
                  </form>
                ) : selectedWorkflow ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start border-b pb-3">
                      <div>
                        <span className="text-xs bg-brand-100 text-brand-700 font-semibold px-2 py-0.5 rounded-full">
                          {selectedWorkflow.category}
                        </span>
                        <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedWorkflow.title}</h2>
                        {selectedWorkflow.tags && (
                          <p className="text-xs text-gray-400 mt-0.5">Etiquetas: {selectedWorkflow.tags}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteWorkflow(selectedWorkflow.id, selectedWorkflow.title)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Eliminar guía"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Render de Pasos */}
                    <div className="bg-gray-50 border rounded-lg p-4 font-mono text-xs whitespace-pre-wrap leading-relaxed text-gray-800">
                      {selectedWorkflow.steps}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                    <BookOpen size={48} className="mb-2 text-gray-300" />
                    <p className="text-sm">Selecciona un procedimiento del panel izquierdo para consultar el paso a paso.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}