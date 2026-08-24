const SM = {
  available:"bg-green-100 text-green-800",assigned:"bg-blue-100 text-blue-800",
  maintenance:"bg-yellow-100 text-yellow-800",retired:"bg-gray-100 text-gray-600",
  stolen:"bg-red-100 text-red-800",open:"bg-blue-100 text-blue-800",
  in_progress:"bg-yellow-100 text-yellow-800",waiting:"bg-orange-100 text-orange-800",
  resolved:"bg-green-100 text-green-800",closed:"bg-gray-100 text-gray-600",
  active:"bg-green-100 text-green-800",expired:"bg-red-100 text-red-800",
  cancelled:"bg-gray-100 text-gray-600",pending_renewal:"bg-yellow-100 text-yellow-800",
  reserved:"bg-purple-100 text-purple-800",deprecated:"bg-gray-100 text-gray-500",
};
const SL = {
  available:"Disponible",assigned:"Asignado",maintenance:"Mantenimiento",
  retired:"Baja",stolen:"Robado",open:"Abierto",in_progress:"En progreso",
  waiting:"En espera",resolved:"Resuelto",closed:"Cerrado",active:"Activo",
  expired:"Expirado",cancelled:"Cancelado",pending_renewal:"Por renovar",
  reserved:"Reservado",deprecated:"Deprecado",
};
const PM = {
  low:"bg-green-100 text-green-800",medium:"bg-blue-100 text-blue-800",
  high:"bg-orange-100 text-orange-800",critical:"bg-red-100 text-red-800",
};
const PL = { low:"Baja",medium:"Media",high:"Alta",critical:"Critica" };

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${SM[status]??"bg-gray-100 text-gray-600"}`}>
      {SL[status]??status??"—"}
    </span>
  );
}
export function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PM[priority]??"bg-gray-100 text-gray-600"}`}>
      {PL[priority]??priority??"—"}
    </span>
  );
}