// script.js (Para la tabla de partidos en index.html)

async function cargarPartidos() {
  try {
    const response = await fetch("http://localhost:3000/api/partidos");
    const partidos = await response.json();

    // ✅ CORREGIDO: El ID de la tabla en index.html es 'partidos'
    const tabla = document.getElementById("partidos"); 
    if (!tabla) {
        console.warn('Advertencia: No se encontró el elemento con ID "partidos" en esta página.');
        return; 
    }
    
    tabla.innerHTML = ""; // Limpiar tabla

    partidos.forEach(p => {
      const fila = document.createElement("tr");

      // Formatear la fecha a DD/MM/YYYY
      const fechaObj = new Date(p.fecha);
      const fechaFormateada = fechaObj.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });

      // Resultado: Muestra goles si están definidos, si no, muestra "VS"
      // ✅ CLAVE CORREGIDA: Usamos goles_local y goles_visitante
      const resultadoHTML = (p.goles_local !== null && p.goles_visitante !== null) ? 
          `<span class="text-danger">${p.goles_local}</span> - <span class="text-primary">${p.goles_visitante}</span>` :
          `<span class="text-muted fw-normal">VS</span>`;

      // Clase del badge (usamos un estilo simple aquí, puedes personalizarlo con CSS)
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
    const tabla = document.getElementById("partidos");
    if (tabla) {
      tabla.innerHTML = `<tr><td colspan="7" class="text-danger p-3">No se pudieron cargar los partidos.</td></tr>`;
    }
  }
}

// Cargar partidos al iniciar la página
document.addEventListener("DOMContentLoaded", cargarPartidos);

// También cargamos las posiciones en el index (si aplica)
// Ya que index.html tiene <tbody id="tablaPosiciones">
async function cargarPosicionesIndex() {
  try {
   const response = await fetch("http://localhost:3000/api/posiciones");
   if (!response.ok) throw new Error("Error al cargar posiciones");
   const posiciones = await response.json();

   const tabla = document.getElementById("tablaPosiciones");
   if (!tabla) return;
   tabla.innerHTML = ""; 

    posiciones.forEach((p, index) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${index + 1}</td>
        <td class="text-start fw-bold">${p.nombre_equipo}</td>
        <td>${p.partidos_jugados}</td>
        <td>${p.partidos_ganados}</td>
        <td>${p.partidos_empatados}</td>
        <td>${p.partidos_perdidos}</td>
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
document.addEventListener("DOMContentLoaded", cargarPosicionesIndex);