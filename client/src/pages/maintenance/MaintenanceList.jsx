import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient"; // Ajusta la ruta a tu cliente
import { 
  Plus, Wrench, ShieldCheck, AlertTriangle, BookOpen, 
  Search, Trash2, X, CheckCircle, Cpu, Filter 
} from "lucide-react";

export default function MaintenanceList() {
  const [maintenances, setMaintenances] = useState([]);
  const [assets, setAssets] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado Form Mantenimiento
  const [formMaintenance, setFormMaintenance] = useState({
    asset_id: "",
    type: "Preventivo",
    technician: "",
    description: ""
  });

  // Estado Form Workflow
  const [formWorkflow, setFormWorkflow] = useState({
    title: "",
    category: "Software",
    tags: "",
    steps_description: ""
  });

  // Cargar Mantenimientos, Equipos y Workflows
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Obtener bitácora de mantenimientos
      const { data: logsData } = await supabase
        .from("maintenance_logs")
        .select("*, asset:assets(asset_code, brand, model)")
        .order("created_at", { ascending: false });

      // 2. Obtener lista de activos/equipos
      const { data: assetsData } = await supabase
        .from("assets")
        .select("id, asset_code, brand, model");

      // 3. Obtener guías/workflows de la bóveda
      const { data: wfData } = await supabase
        .from("maintenance_workflows")
        .select("*")
        .order("created_at", { ascending: false });

      setMaintenances(logsData || []);
      setAssets(assetsData || []);
      setWorkflows(wfData || []);
    } catch (err) {
      console.error("Error al cargar datos:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Guardar Mantenimiento
  const handleCreateMaintenance = async (e) => {
    e.preventDefault();
    if (!formMaintenance.asset_id || !formMaintenance.description) return;

    try {
      const { error } = await supabase
        .from("maintenance_logs")
        .insert([formMaintenance]);

      if (error) throw error;

      setFormMaintenance({ asset_id: "", type: "Preventivo", technician: "", description: "" });
      fetchData();
    } catch (err) {
      alert("Error al guardar mantenimiento: " + err.message);
    }
  };

  // Guardar Workflow / Guía
  const handleCreateWorkflow = async (e) => {
    e.preventDefault();
    if (!formWorkflow.title || !formWorkflow.steps_description) return;

    const tagsArray = formWorkflow.tags.split(",").map(t => t.trim()).filter(Boolean);

    try {
      const { error } = await supabase
        .from("maintenance_workflows")
        .insert([{
          title: formWorkflow.title,
          category: formWorkflow.category,
          tags: tagsArray,
          steps_description: formWorkflow.steps_description
        }]);

      if (error) throw error;

      setFormWorkflow({ title: "", category: "Software", tags: "", steps_description: "" });
      fetchData();
    } catch (err) {
      alert("Error al guardar workflow: " + err.message);
    }
  };

  // Filtrado de mantenimientos
  const filteredMaintenances = maintenances.filter(m => 
    m.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.asset?.asset_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      
      {/* Header & Acciones */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-sky-400 flex items-center gap-2">
            <Wrench className="w-6 h-6" /> Gestor de Mantenimiento & Servicios TI
          </h1>
          <p className="text-slate-400 text-sm">Registro de intervenciones, métricas y bóveda de procedimientos.</p>
        </div>
        <button
          onClick={() => setShowWorkflowModal(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium shadow transition-all"
        >
          <BookOpen className="w-4 h-4" /> Bóveda de Workflows ({workflows.length})
        </button>
      </div>

      {/* Tarjetas del Dashboard / Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Intervenciones</span>
          <div className="text-2xl font-bold text-slate-100">{maintenances.length}</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-semibold uppercase">Mantenimientos Preventivos</span>
          <div className="text-2xl font-bold text-sky-400">
            {maintenances.filter(m => m.type === "Preventivo").length}
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-semibold uppercase">Mantenimientos Correctivos</span>
          <div className="text-2xl font-bold text-amber-400">
            {maintenances.filter(m => m.type === "Correctivo").length}
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl">
          <span className="text-xs text-purple-400 font-semibold uppercase">Guías en Bóveda</span>
          <div className="text-2xl font-bold text-purple-300">{workflows.length}</div>
        </div>
      </div>

      {/* Grid Principal: Formulario + Tabla */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulario de Registro */}
        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl h-fit">
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-sky-400" /> Registrar Nuevo Mantenimiento
          </h2>
          <form onSubmit={handleCreateMaintenance} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Equipo / Activo (*)</label>
              <select
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:border-sky-500 outline-none"
                value={formMaintenance.asset_id}
                onChange={(e) => setFormMaintenance({ ...formMaintenance, asset_id: e.target.value })}
              >
                <option value="">-- Seleccionar Equipo --</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.asset_code} - {a.brand} {a.model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tipo de Servicio</label>
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:border-sky-500 outline-none"
                value={formMaintenance.type}
                onChange={(e) => setFormMaintenance({ ...formMaintenance, type: e.target.value })}
              >
                <option value="Preventivo">Preventivo</option>
                <option value="Correctivo">Correctivo</option>
                <option value="Actualización">Actualización</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Técnico / Responsable</label>
              <input
                type="text"
                placeholder="Ej. Daniel"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:border-sky-500 outline-none"
                value={formMaintenance.technician}
                onChange={(e) => setFormMaintenance({ ...formMaintenance, technician: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Descripción del Trabajo (*)</label>
              <textarea
                required
                rows={3}
                placeholder="Detalla las tareas realizadas..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:border-sky-500 outline-none"
                value={formMaintenance.description}
                onChange={(e) => setFormMaintenance({ ...formMaintenance, description: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-medium py-2.5 rounded-lg transition-all"
            >
              Guardar Mantenimiento
            </button>
          </form>
        </div>

        {/* Tabla de Registros */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 p-5 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-200">Historial de Intervenciones</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por equipo o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-200 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 uppercase text-xs">
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3">Equipo</th>
                  <th className="py-3 px-3">Tipo</th>
                  <th className="py-3 px-3">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 text-slate-300">
                {filteredMaintenances.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No hay registros de mantenimiento almacenados.
                    </td>
                  </tr>
                ) : (
                  filteredMaintenances.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-750">
                      <td className="py-3 px-3 whitespace-nowrap text-slate-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-200">
                        {item.asset?.asset_code || "Sin activo"}<br />
                        <span className="text-xs text-slate-400">{item.asset?.brand} {item.asset?.model}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.type === "Preventivo" ? "bg-sky-950 text-sky-400 border border-sky-800" :
                          item.type === "Correctivo" ? "bg-amber-950 text-amber-400 border border-amber-800" :
                          "bg-purple-950 text-purple-400 border border-purple-800"
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 max-w-xs truncate">
                        {item.description}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Bóveda de Workflows / Guías */}
      {showWorkflowModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
              <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                <BookOpen className="w-6 h-6" /> Bóveda de Guías & Workflows
              </h3>
              <button 
                onClick={() => setShowWorkflowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Formulario Crear Workflow */}
              <form onSubmit={handleCreateWorkflow} className="space-y-3 bg-slate-900/60 p-4 border border-slate-700/60 rounded-lg">
                <h4 className="font-semibold text-purple-300 text-sm">Registrar Nuevo Procedimiento</h4>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Título de la Guía</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Configurar VPN Tailscale"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 outline-none"
                    value={formWorkflow.title}
                    onChange={(e) => setFormWorkflow({ ...formWorkflow, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Categoría</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 outline-none"
                    value={formWorkflow.category}
                    onChange={(e) => setFormWorkflow({ ...formWorkflow, category: e.target.value })}
                  >
                    <option value="Software">Software</option>
                    <option value="Redes">Redes / VPN</option>
                    <option value="Sistema Operativo">Sistema Operativo</option>
                    <option value="Seguridad">Seguridad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Etiquetas (separadas por coma)</label>
                  <input
                    type="text"
                    placeholder="Linux, VPN, Tailscale"
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 outline-none"
                    value={formWorkflow.tags}
                    onChange={(e) => setFormWorkflow({ ...formWorkflow, tags: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Pasos / Instrucciones</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Paso 1: Ejecutar script..."
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 outline-none"
                    value={formWorkflow.steps_description}
                    onChange={(e) => setFormWorkflow({ ...formWorkflow, steps_description: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold py-2 rounded transition-all"
                >
                  Guardar Guía
                </button>
              </form>

              {/* Lista de Guías en la Bóveda */}
              <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2">
                <h4 className="font-semibold text-slate-300 text-sm">Procedimientos Almacenados</h4>
                {workflows.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No hay guías registradas todavía.</p>
                ) : (
                  workflows.map((wf) => (
                    <div key={wf.id} className="bg-slate-900 p-3 rounded-lg border border-slate-700 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-sky-400 text-xs">{wf.title}</span>
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-700">
                          {wf.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 whitespace-pre-line bg-slate-950 p-2 rounded border border-slate-800">
                        {wf.steps_description}
                      </p>
                      {wf.tags && wf.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {wf.tags.map((t, idx) => (
                            <span key={idx} className="bg-purple-950 text-purple-300 text-[10px] px-1.5 py-0.5 rounded border border-purple-800">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}