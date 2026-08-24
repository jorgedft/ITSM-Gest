export const fDate = (date) => {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

export const fDateTime = (date) => {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

export const fRelative = (date) => {
  if (!date) return "—";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "hace un momento";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days} dia${days > 1 ? "s" : ""}`;
};

export const fCurrency = (amount, currency = "MXN") => {
  if (amount == null) return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
  }).format(amount);
};

export const fStatus = {
  available:       { label: "Disponible",    css: "bg-green-100 text-green-800"   },
  assigned:        { label: "Asignado",      css: "bg-blue-100 text-blue-800"     },
  maintenance:     { label: "Mantenimiento", css: "bg-yellow-100 text-yellow-800" },
  retired:         { label: "Baja",          css: "bg-gray-100 text-gray-600"     },
  stolen:          { label: "Robado",        css: "bg-red-100 text-red-800"       },
  open:            { label: "Abierto",       css: "bg-blue-100 text-blue-800"     },
  in_progress:     { label: "En progreso",   css: "bg-yellow-100 text-yellow-800" },
  waiting:         { label: "En espera",     css: "bg-orange-100 text-orange-800" },
  resolved:        { label: "Resuelto",      css: "bg-green-100 text-green-800"   },
  closed:          { label: "Cerrado",       css: "bg-gray-100 text-gray-600"     },
  active:          { label: "Activo",        css: "bg-green-100 text-green-800"   },
  expired:         { label: "Expirado",      css: "bg-red-100 text-red-800"       },
  cancelled:       { label: "Cancelado",     css: "bg-gray-100 text-gray-600"     },
  pending_renewal: { label: "Por renovar",   css: "bg-yellow-100 text-yellow-800" },
};

export const fPriority = {
  low:      { label: "Baja",    css: "bg-green-100 text-green-800"   },
  medium:   { label: "Media",   css: "bg-blue-100 text-blue-800"     },
  high:     { label: "Alta",    css: "bg-orange-100 text-orange-800" },
  critical: { label: "Critica", css: "bg-red-100 text-red-800"       },
};