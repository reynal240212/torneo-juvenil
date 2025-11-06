import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Coloca tu URL y ANON KEY aquí
const supabaseUrl = "TU_URL_SUPABASE";
const supabaseKey = "TU_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseKey);

// Para la tabla de partidos en index.html (usando vista_resultados)
async function cargarPartidos() {
  try {
    const { data: partidos, error } = await supabase
      .from("vista_resultados")
      .select("*")
      .order("jornada")
      .order("fecha")
      .order("hora");

    // ✅ El ID de la tabla en index.html debe ser 'tablaPartidos'
    const tabla = document.getElementById("tablaPartidos"); 
    if (!tabla) {
        console.warn('Advertencia: No se encontró el elemento con ID "tablaPartidos" en esta página.');
        return; 
    }
    
    tabla.innerHTML = ""; // Limpiar tabla

    partidos.forEach(p => {
      const fila = document.createElement("tr");

      // Formatear la fecha a DD/MM/YYYY
      const fechaObj = new Date(p.fecha);
      const fechaFormateada = fechaObj.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });

      // Resultado
      const resultadoHTML = (p.goles_local !== null && p.goles_visitante !== null) ? 
          `<span class="text-danger">${p.goles_local}</span> - <span class="text-primary">${p.goles_visitante}</span>` :
          `<span class="text-muted fw-normal">VS</span>`;

      // Clase del badge
      const estadoClase = p.estado === 'FINALIZADO' ? 'text-success' : 'text-warning';

      fila.innerHTML = `
        <td class="text-center">${p.jornada || 'N/A'}</td>
        <td class="text-center">${fechaFormateada}</td>
        <td class="text-center">${p.hora}</td>
        <td class="text-end fw-bold">${p.equipo_local}</td>
        <td class="text-start fw-bold">${p.equipo_visitante}</td>
        <td class="text-center fw-bold">${resultadoHTML}</td>
        <td class="text-center"><span class="${estadoClase} fw-bold">${p.estado}</span></td>
      `;
      tabla.appendChild(fila);
    });
  } catch (error) {
    console.error("Error al cargar partidos en index:", error);
    const tabla = document.getElementById("tablaPartidos");
    if (tabla) {
      tabla.innerHTML = `<tr><td colspan="7" class="text-danger p-3">No se pudieron cargar los partidos.</td></tr>`;
    }
  }
}

// También cargamos las posiciones en el index (usando vista_posiciones)
async function cargarPosicionesIndex() {
  try {
    const { data: posiciones, error } = await supabase
      .from("vista_posiciones")
      .select("*")
      .order("puntos", { ascending: false })
      .order("diferencia_goles", { ascending: false })
      .order("goles_favor", { ascending: false });

    const tabla = document.getElementById("tablaPosiciones");
    if (!tabla) return;
    tabla.innerHTML = ""; 

    posiciones.forEach((p, index) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${index + 1}</td>
        <td class="text-start fw-bold">${p.equipo}</td>
        <td>${p.pj}</td>
        <td>${p.pg}</td>
        <td>${p.pe}</td>
        <td>${p.pp}</td>
        <td>${p.goles_favor}</td>
        <td>${p.goles_contra}</td>
        <td>${p.diferencia_goles}</td>
        <td class="fw-bold">${p.puntos}</td>
      `;
      tabla.appendChild(fila);
    });
  } catch (error) {
    console.error("Error al cargar posiciones en index:", error);
    const tabla = document.getElementById("tablaPosiciones");
    if(tabla) tabla.innerHTML = `<tr><td colspan="10" class="text-danger p-3">No se pudieron cargar las posiciones.</td></tr>`;
  }
}

document.addEventListener("DOMContentLoaded", cargarPartidos);
document.addEventListener("DOMContentLoaded", cargarPosicionesIndex);
