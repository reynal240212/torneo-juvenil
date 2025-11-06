import { supabase } from "./supabaseClient.js";

async function cargarPosiciones() {
  const { data, error } = await supabase
    .from("vista_posiciones")
    .select("*")
    .order("puntos", { ascending: false })
    .order("diferencia_goles", { ascending: false })
    .order("goles_favor", { ascending: false });
  const tabla = document.getElementById("tablaPosiciones");
  tabla.innerHTML = "";
  if (error || !data) {
    tabla.innerHTML = `<tr><td colspan="10">No se pudieron cargar las posiciones</td></tr>`;
    return;
  }
  data.forEach((p, index) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${index + 1}</td>
      <td>${p.nombre_equipo}</td>
      <td>${p.partidos_jugados}</td>
      <td>${p.partidos_ganados}</td>
      <td>${p.partidos_empatados}</td>
      <td>${p.partidos_perdidos}</td>
      <td>${p.goles_favor}</td>
      <td>${p.goles_contra}</td>
      <td>${p.diferencia_goles}</td>
      <td>${p.puntos}</td>`;
    tabla.appendChild(fila);
  });
}
document.addEventListener("DOMContentLoaded", cargarPosiciones);
