import { supabase } from "./supabaseClient.js";

async function cargarPartidos() {
  const { data, error } = await supabase
    .from("vista_resultados")
    .select("*")
    .order("jornada")
    .order("fecha")
    .order("hora");
  const tablaPartidosBody = document.getElementById("tablaPartidos");
  tablaPartidosBody.innerHTML = "";
  if (error || !data) {
    tablaPartidosBody.innerHTML = 
      `<tr><td colspan="7">No se pudieron cargar los partidos</td></tr>`;
    return;
  }
  data.forEach(partido => {
    const fechaObj = new Date(partido.fecha);
    const fechaFormateada = fechaObj.toLocaleDateString("es-CO");
    const horaFormateada = partido.hora || "Hora Pendiente";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${partido.jornada ?? ""}</td>
      <td>${fechaFormateada}</td>
      <td>${horaFormateada}</td>
      <td class="fw-bold text-end">${partido.equipo_local}</td>
      <td class="fw-bold text-start">${partido.equipo_visitante}</td>
      <td class="fs-6 fw-bold">${partido.goles_local ?? ""} - ${partido.goles_visitante ?? ""}</td>
      <td><span class="badge match-status ${partido.estado === "FINALIZADO" ? "badge-jugado" : "badge-pendiente"}">${partido.estado}</span></td>`;
    tablaPartidosBody.appendChild(tr);
  });
}
document.addEventListener("DOMContentLoaded", cargarPartidos);
