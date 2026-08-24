import { Link } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-50 rounded-2xl mb-6">
          <AlertTriangle size={40} className="text-brand-500" />
        </div>
        <h1 className="text-6xl font-bold text-brand-500 mb-2">404</h1>
        <p className="text-xl text-gray-600 mb-2">Pagina no encontrada</p>
        <p className="text-gray-400 text-sm mb-8">La ruta que buscas no existe en el sistema.</p>
        <Link to="/dashboard" className="btn-primary inline-flex">
          <Home size={16} /> Ir al Dashboard
        </Link>
      </div>
    </div>
  );
}