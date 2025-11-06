document.addEventListener('DOMContentLoaded', () => {
  const tablaPartidosBody = document.getElementById('tablaPartidos');
  if (!tablaPartidosBody) {
    console.error('Error fatal: No se encontró el elemento con ID "tablaPartidos". Verifique el HTML.');
    return;
  }

  async function cargarPartidos() {
    try {
      const response = await fetch("http://localhost:3000/api/partidos");
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const partidos = await response.json();
      tablaPartidosBody.innerHTML = '';

      partidos.forEach(partido => {
        const tr = document.createElement('tr');
        const fechaObj = new Date(partido.fecha);
        const fechaFormateada = fechaObj.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });

        // Hora formateada con validaciones
        let horaFormateada;
        if (partido.hora && partido.hora !== '[null]') {
          const [horas, minutos] = partido.hora.split(':');
          const horaParaFormatear = new Date(fechaObj.getFullYear(), fechaObj.getMonth(), fechaObj.getDate(), horas, minutos);
          horaFormateada = horaParaFormatear.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true });
        } else {
          horaFormateada = fechaObj.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true });
          if (fechaObj.getHours() === 0 && fechaObj.getMinutes() === 0 && fechaObj.getSeconds() === 0) {
            horaFormateada = 'Hora Pendiente';
          }
        }

        // Estado y colores de badge según paleta
        const estadoClase = partido.estado === 'FINALIZADO' ? 'badge-jugado' : 'badge-pendiente';
        const estadoColor = partido.estado === 'FINALIZADO' ? 'color:#00B7DF;' : 'color:#002B3C;';

        // Resultado deportivo visual y cromático
        let resultadoHTML;
        if (partido.goles_local !== null && partido.goles_visitante !== null) {
          resultadoHTML =
            `<span class="score-number" style="background:#0082C9;color:white;">${partido.goles_local}</span>
             <span style="color:#002B3C;font-weight:800;">-</span>
             <span class="score-number" style="background:#00B7DF;color:#002B3C;">${partido.goles_visitante}</span>`;
        } else {
          resultadoHTML = `<span class="score-vs" style="background:#D5F6FC;color:#0082C9;">VS</span>`;
        }

        tr.innerHTML = `
          <td>${partido.jornada || 'N/A'}</td>
          <td>${fechaFormateada}</td>
          <td>${horaFormateada}</td>
          <td class="fw-bold text-end" style="color:#002B3C;">${partido.equipo_local}</td>
          <td class="fw-bold text-start" style="color:#002B3C;">${partido.equipo_visitante}</td>
          <td class="fs-6 fw-bold">${resultadoHTML}</td>
          <td>
            <span class="badge match-status ${estadoClase}" style="${estadoColor}">
              ${partido.estado}
            </span>
          </td>
        `;

        tablaPartidosBody.appendChild(tr);
      });
    } catch (error) {
      console.error('Error al cargar los partidos:', error);
      tablaPartidosBody.innerHTML = `
        <tr>
          <td colspan="7" style="color:#0082C9; background:#D5F6FC; text-align:center;" class="p-3">
            Error: No se pudieron cargar los datos. Verifica que el servidor esté funcionando.
          </td>
        </tr>`;
    }
  }

  cargarPartidos();

  // Funcionalidad Exportar a PDF
  document.getElementById("descargarPDF").addEventListener("click", function () {
    var tabla = document.getElementById("tablaPartidos");
    var doc = new window.jspdf.jsPDF();

    // Cabeceras
    var cabeceras = [];
    tabla.parentElement.querySelectorAll("thead th").forEach(th => {
      cabeceras.push(th.innerText);
    });

    // Filas de la tabla
    var filas = [];
    tabla.querySelectorAll("tr").forEach(tr => {
      let fila = [];
      tr.querySelectorAll("td").forEach(td => {
        // Convierte los resultados embebidos con HTML en texto plano
        fila.push(td.textContent.trim());
      });
      if (fila.length) filas.push(fila);
    });

    doc.autoTable({
      head: [cabeceras],
      body: filas,
      theme: 'striped',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [25, 118, 210] },
      margin: { top: 20 }
    });

    doc.save("calendario_torneo.pdf");
  });

});
