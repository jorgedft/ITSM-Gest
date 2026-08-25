import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom"; // 👈 agrega useLocation
import { Plus, Monitor, Search, RefreshCw, Trash2, Eye, Edit, FileSpreadsheet } from "lucide-react";
import { supabase } from "../../services/supabase";
import { StatusBadge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { ExportButtons } from "../../components/ui/ExportButtons";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";
import { fDate, fCurrency } from "../../utils/formatters";
import { ASSET_TYPES, ASSET_STATUS } from "../../utils/constants";
import { ImportAssetsModal } from "../../components/assets/ImportAssetsModal";

const COLS = [
  { header:"Etiqueta",   accessor: r=>r.asset_code || r.asset_tag },
  { header:"Tipo",       accessor: r=>r.category || r.asset_type },
  { header:"Marca",      accessor: r=>r.brand },
  { header:"Modelo",     accessor: r=>r.model },
  { header:"Serie",      accessor: r=>r.serial_number },
  { header:"Estado",     accessor: r=>r.status },
  { header:"Condicion",  accessor: r=>r.condition },
  { header:"Asignado a", accessor: r=>r.assignee?.full_name },
  { header:"Ubicacion",  accessor: r=>r.location },
  { header:"Precio",     accessor: r=>fCurrency(r.purchase_price) },
  { header:"F.Compra",   accessor: r=>fDate(r.purchase_date) },
  { header:"Garantia",   accessor: r=>fDate(r.warranty_until) },
  { header:"Notas",      accessor: r=>r.notes },
];

export default function AssetList() {
  const [assets,  setAssets]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filters, setFilters] = useState({ status:"", type:"" });
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const LIMIT = 20;

  // 👇 Detecta cada vez que vuelves a /assets (incluso si el componente NO se desmonta)
  const location = useLocation();

  const load = useCallback(async () => {
    setLoading(true);
    const from=(page-1)*LIMIT, to=from+LIMIT-1;
    let q = supabase.from("assets")
      .select("*, assignee:employees!assets_assigned_to_fkey(full_name,department)", {count:"exact"})
      .range(from,to).order("created_at",{ascending:false});
    if (filters.status) q=q.eq("status",filters.status);
    if (filters.type)   q=q.eq("asset_type",filters.type);
    if (search) q=q.or(`asset_code.ilike.%${search}%,asset_tag.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%,serial_number.ilike.%${search}%`);
    const {data,count}=await q;
    setAssets(data||[]);
    setTotal(count||0);
    setLoading(false);
  },[page,filters,search]);

  useEffect(()=>{load();},[load]);

  // 👇 FIX 1: Cuando cambia la ruta (volver desde /new o /edit), recarga y resetea a página 1
  useEffect(() => {
    setPage(1);
    load();
  }, [location.key]);

  // 👇 FIX 2: Si el total cambió y la página actual está fuera de rango, vuelve a la 1
  useEffect(() => {
    const pages = Math.ceil(total / LIMIT);
    if (page > pages && pages > 0) {
      setPage(1);
    }
  }, [total, page]);

  const handleDelete = async (id, tag) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar el equipo con código/etiqueta "${tag || id}"?`);
    if (!confirmDelete) return;
    try {
      const { error } = await supabase.from("assets").delete().eq("id", id);
      if (error) throw error;
      load();
    } catch (err) {
      alert(`Error al eliminar el equipo: ${err.message}`);
    }
  };

  const loadAll=async()=>{
    let q=supabase.from("assets")
      .select("*, assignee:employees!assets_assigned_to_fkey(full_name,department)")
      .order("created_at",{ascending:false});
    if (filters.status) q=q.eq("status",filters.status);
    if (filters.type)   q=q.eq("asset_type",filters.type);
    const {data}=await q;
    return data||[];
  };

  const pages=Math.ceil(total/LIMIT);

  return(
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Monitor size={24} className="text-brand-500"/>
          Inventario de Equipos
          <span className="text-sm font-normal text-gray-400">({total})</span>
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <ExportButtons
            onExcelClick={async()=>exportToExcel(await loadAll(),COLS,"Inventario_Equipos")}
            onPDFClick={async()=>exportToPDF(await loadAll(),COLS,"Inventario_Equipos","Inventario de Equipos ITAM")}
            disabled={loading}
          />
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="btn-secondary text-sm flex items-center gap-1.5"
          >
            <FileSpreadsheet size={16} className="text-emerald-600" />
            <span>Importar Excel</span>
          </button>
          <Link to="/assets/new" className="btn-primary"><Plus size={16}/> Nuevo equipo</Link>
        </div>
      </div>

      <div className="card py-3 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
            placeholder="Buscar etiqueta, marca, modelo, serie..." className="input-field pl-9 text-sm"/>
        </div>
        <select value={filters.status} onChange={e=>{setFilters(f=>({...f,status:e.target.value}));setPage(1);}} className="input-field w-auto text-sm">
          <option value="">Todos los estados</option>
          {ASSET_STATUS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={filters.type} onChange={e=>{setFilters(f=>({...f,type:e.target.value}));setPage(1);}} className="input-field w-auto text-sm">
          <option value="">Todos los tipos</option>
          {ASSET_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <button onClick={load} className="btn-secondary text-sm py-2"><RefreshCw size={14}/></button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading?<Spinner/>:assets.length===0?(
          <EmptyState icon={Monitor} title="Sin equipos" description="Registra el primer equipo de TI o importa masivamente desde un archivo Excel"
            action={
              <div className="flex gap-2">
                <button onClick={() => setIsImportModalOpen(true)} className="btn-secondary text-sm">
                  <FileSpreadsheet size={16} className="text-emerald-600" /> Importar Excel
                </button>
                <Link to="/assets/new" className="btn-primary text-sm">+ Nuevo equipo</Link>
              </div>
            }/>
        ):(
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Etiqueta","Tipo","Marca / Modelo","N Serie","Estado","Asignado a","Garantia","Acciones"].map((h,i)=>(
                      <th key={i} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assets.map(a=>(
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link to={`/assets/${a.id}`} className="font-mono font-medium text-brand-600 hover:underline">
                          {a.asset_code || a.asset_tag || "S/C"}
                        </Link>
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-600 text-xs">{a.category || a.asset_type}</td>
                      <td className="px-4 py-3 font-medium">{a.brand} {a.model}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{a.serial_number||"—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={a.status}/></td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{a.assignee?.full_name||"—"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fDate(a.warranty_until)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Link to={`/assets/${a.id}`} className="text-gray-500 hover:text-brand-600 transition-colors" title="Ver detalles">
                            <Eye size={15}/>
                          </Link>
                          <Link to={`/assets/${a.id}/edit`} className="text-gray-500 hover:text-blue-600 transition-colors" title="Editar">
                            <Edit size={15}/>
                          </Link>
                          <button
                            onClick={() => handleDelete(a.id, a.asset_code || a.asset_tag)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar equipo"
                          >
                            <Trash2 size={15}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pages>1&&(
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">{(page-1)*LIMIT+1}–{Math.min(page*LIMIT,total)} de {total}</p>
                <div className="flex gap-1">
                  <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40">‹</button>
                  <button disabled={page>=pages} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40">›</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ImportAssetsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={load}
      />
    </div>
  );
}
