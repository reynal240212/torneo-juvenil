// scripts/calendario.js

// Supabase llega como global desde el HTML:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
const { createClient } = window.supabase;

// 🚨 CREDENCIALES - ANON KEY PÚBLICA
const SUPABASE_URL = "https://cwlvpzossqmpuzdpjrsh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go";

// Crear cliente único
let supabaseClient = null;
try {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  console.error("Error al crear el cliente Supabase:", e);
}

function obtenerClaseEstado(estado) {
  if (!estado) return "badge bg-secondary";
  switch (estado.toUpperCase()) {
    case "FINALIZADO":
      return "badge bg-success text-white";
    case "OTORGADO":
      return "badge bg-warning text-dark";
    case "PROGRAMADO":
      return "badge bg-info text-dark";
    case "EN JUEGO":
      return "badge bg-primary text-white";
    case "CANCELADO":
      return "badge bg-danger text-white";
    default:
      return "badge bg-secondary";
  }
}

async function cargarPartidos() {
  const tabla = document.getElementById("tablaPartidos");

  if (!supabaseClient) {
    if (tabla) {
      tabla.innerHTML = `<tr><td colspan="7" class="text-danger">Error: Cliente Supabase no inicializado.</td></tr>`;
    }
    return;
  }

  const { data, error } = await supabaseClient
    .from("vista_resultados")
    .select("*")
    .order("fecha")
    .order("hora");

  if (!tabla) return;

  tabla.innerHTML = "";

  if (error || !data) {
    tabla.innerHTML = `<tr><td colspan="7" class="text-danger">Error al cargar partidos: ${error?.message || "Desconocido"}.</td></tr>`;
    return;
  }

  data.forEach((p) => {
    const fechaFormateada = p.fecha
      ? new Date(p.fecha).toLocaleDateString("es-CO")
      : "-";

    const resultadoHTML =
      p.goles_local !== null && p.goles_visitante !== null
        ? `<span class="text-danger">${p.goles_local}</span> - <span class="text-primary">${p.goles_visitante}</span>`
        : `<span class="text-muted fw-normal">VS</span>`;

    const estadoClase = obtenerClaseEstado(p.estado || "");

    tabla.innerHTML += `
      <tr>
        <td class="text-center">${fechaFormateada}</td>
        <td class="text-center">${p.hora || "-"}</td>
        <td class="text-end fw-bold">${p.equipo_local}</td>
        <td class="text-start fw-bold">${p.equipo_visitante}</td>
        <td class="text-center fw-bold">${resultadoHTML}</td>
        <td class="text-center">
          <span class="${estadoClase} fw-bold">${p.estado || "-"}</span>
        </td>
      </tr>
    `;
  });
}

document.addEventListener("DOMContentLoaded", cargarPartidos);
