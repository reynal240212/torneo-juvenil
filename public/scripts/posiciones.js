// Archivo: public/scripts/posiciones.js

// 🟢 CORREGIDO: Importar la instancia de supabase desde el archivo centralizado
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
    tabla.innerHTML = `<tr><td colspan="10" class="text-danger">Error al cargar posiciones.</td></tr>`;
    return;
  }
  
  data.forEach((p, idx) => {
    tabla.innerHTML += `
      <tr>
        <td>${idx + 1}</td>
        <td>${p.nombre_equipo}</td>
        <td>${p.partidos_jugados}</td>
        <td>${p.partidos_ganados}</td>
        <td>${p.partidos_empatados}</td>
        <td>${p.partidos_perdidos}</td>
        <td>${p.goles_favor}</td>
        <td>${p.goles_contra}</td>
        <td>${p.diferencia_goles}</td>
        <td>${p.puntos}</td>
      </tr>`;
  });
}
document.addEventListener("DOMContentLoaded", cargarPosiciones);