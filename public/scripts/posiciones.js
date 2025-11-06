// script/posiciones.js
async function cargarPosiciones() {
  try {
   const response = await fetch("http://localhost:3000/api/posiciones");
   const posiciones = await response.json();


    const tabla = document.getElementById("tablaPosiciones");
    tabla.innerHTML = ""; // limpiar tabla

    posiciones.forEach((p, index) => {
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
        <td>${p.puntos}</td>
      `;
      tabla.appendChild(fila);
    });
  } catch (error) {
    console.error("Error al cargar posiciones:", error);
    const tabla = document.getElementById("tablaPosiciones");
    tabla.innerHTML = `<tr><td colspan="10">No se pudieron cargar las posiciones</td></tr>`;
  }
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", cargarPosiciones);
