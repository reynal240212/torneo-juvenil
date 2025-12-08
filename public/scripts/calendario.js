// scripts/calendario.js
// 1. IMPORTAR el cliente de Supabase ya inicializado desde el archivo central.
import { supabase } from './supabaseClient.js';

// ** NO definir credenciales aquí **
// ** NO llamar a createClient() aquí **

function obtenerClaseEstado(estado) {
  // Personaliza según los estados que tienes en la BD
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
  // 2. USAR el cliente Supabase importado para la consulta.
  // Si 'supabase' es null o undefined aquí, el problema está en 'supabaseClient.js'
  if (!supabase) {
      console.error("El cliente Supabase no está disponible.");
      document.getElementById("tablaPartidos").innerHTML = `<tr><td colspan="7" class="text-danger">Error de inicialización del sistema.</td></tr>`;
      return;
  }
    
  const { data, error } = await supabase
    .from("vista_resultados")
    .select("*")
    .order("fecha")
    .order("hora");

  const tabla = document.getElementById("tablaPartidos");
  tabla.innerHTML = "";
  if (error || !data) {
    tabla.innerHTML = `<tr><td colspan="7" class="text-danger">Error al cargar partidos: ${error.message || 'Desconocido'}.</td></tr>`;
    return;
  }
  
  data.forEach((p) => {
    const fechaFormateada = p.fecha ? new Date(p.fecha).toLocaleDateString('es-CO') : '-';
    const resultadoHTML = (p.goles_local !== null && p.goles_visitante !== null) ? 
      `<span class="text-danger">${p.goles_local}</span> - <span class="text-primary">${p.goles_visitante}</span>` :
      `<span class="text-muted fw-normal">VS</span>`;
    const estadoClase = obtenerClaseEstado(p.estado || "");
    tabla.innerHTML += `
      <tr>
        <td class="text-center">${fechaFormateada}</td>
        <td class="text-center">${p.hora || '-'}</td>
        <td class="text-end fw-bold">${p.equipo_local}</td>
        <td class="text-start fw-bold">${p.equipo_visitante}</td>
        <td class="text-center fw-bold">${resultadoHTML}</td>
        <td class="text-center"><span class="${estadoClase} fw-bold">${p.estado}</span></td>
      </tr>
    `;
  });
}

document.addEventListener("DOMContentLoaded", cargarPartidos);