// scripts/indexData.js

// Supabase global desde el CDN UMD
const { createClient } = window.supabase;

// Configuración del proyecto
const supabaseUrl = "https://cwlvpzossqmpuzdpjrsh.supabase.co";
const supabaseKey  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go";

const supabaseClient = createClient(supabaseUrl, supabaseKey);

// ---------------- Partidos (vista_resultados) ----------------
async function cargarPartidos() {
  try {
    const { data: partidos, error } = await supabaseClient
      .from("vista_resultados")
      .select("*")
      .order("jornada")
      .order("fecha")
      .order("hora");

    const tabla = document.getElementById("tablaPartidos");
    if (!tabla) {
      console.warn('No se encontró el elemento con ID "tablaPartidos".');
      return;
    }

    tabla.innerHTML = "";

    if (error || !partidos) {
      tabla.innerHTML = `<tr><td colspan="7" class="text-danger p-3">No se pudieron cargar los partidos.</td></tr>`;
      console.error("Error al cargar partidos en index:", error);
      return;
    }

    partidos.forEach((p) => {
      const fila = document.createElement("tr");

      const fechaObj = p.fecha ? new Date(p.fecha) : null;
      const fechaFormateada = fechaObj
        ? fechaObj.toLocaleDateString("es-CO", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
        : "N/A";

      const resultadoHTML =
        p.goles_local !== null && p.goles_visitante !== null
          ? `<span class="text-danger">${p.goles_local}</span> - <span class="text-primary">${p.goles_visitante}</span>`
          : `<span class="text-muted fw-normal">VS</span>`;

      const estadoClase = p.estado === "FINALIZADO" ? "text-success" : "text-warning";

      fila.innerHTML = `
        <td class="text-center">${p.jornada || "N/A"}</td>
        <td class="text-center">${fechaFormateada}</td>
        <td class="text-center">${p.hora || "-"}</td>
        <td class="text-end fw-bold">${p.equipo_local}</td>
        <td class="text-start fw-bold">${p.equipo_visitante}</td>
        <td class="text-center fw-bold">${resultadoHTML}</td>
        <td class="text-center">
          <span class="${estadoClase} fw-bold">${p.estado || "-"}</span>
        </td>
      `;
      tabla.appendChild(fila);
    });
  } catch (error) {
    console.error("Error al cargar partidos en index (catch):", error);
    const tabla = document.getElementById("tablaPartidos");
    if (tabla) {
      tabla.innerHTML = `<tr><td colspan="7" class="text-danger p-3">No se pudieron cargar los partidos.</td></tr>`;
    }
  }
}

// ---------------- Posiciones (vista_posiciones) ----------------
async function cargarPosicionesIndex() {
  try {
    const { data: posiciones, error } = await supabaseClient
      .from("vista_posiciones")
      .select("*")
      .order("puntos", { ascending: false })
      .order("diferencia_goles", { ascending: false })
      .order("goles_favor", { ascending: false });

    const tabla = document.getElementById("tablaPosiciones");
    if (!tabla) return;

    tabla.innerHTML = "";

    if (error || !posiciones) {
      tabla.innerHTML = `<tr><td colspan="10" class="text-danger p-3">No se pudieron cargar las posiciones.</td></tr>`;
      console.error("Error al cargar posiciones en index:", error);
      return;
    }

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
    console.error("Error al cargar posiciones en index (catch):", error);
    const tabla = document.getElementById("tablaPosiciones");
    if (tabla) {
      tabla.innerHTML = `<tr><td colspan="10" class="text-danger p-3">No se pudieron cargar las posiciones.</td></tr>`;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarPartidos();
  cargarPosicionesIndex();
});
