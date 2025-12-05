// Archivo: public/scripts/goleadores.js

// Importar la instancia de supabase desde el archivo centralizado
import { supabase } from "./supabaseClient.js";

async function cargarGoleadores() {
  const { data, error } = await supabase
    .from("vista_goleadores")
    .select("*")
    .order("goles", { ascending: false });

  // Renderiza top 3 en cards arriba
  const topDiv = document.getElementById('topGoleadores');
  topDiv.innerHTML = "";
  if (data && data.length > 0) {
    data.slice(0, 3).forEach((j, idx) => {
      const medalla = ["🥇","🥈","🥉"][idx];
      topDiv.innerHTML += `
        <div class="col-lg-4 col-md-4 col-12 mb-2">
          <div class="card shadow-sm border-0 h-100" style="background:var(--gradient-card,#e3f6fe);">
            <div class="card-body text-center px-1 py-3">
              <span style="font-size:2.6rem;">${medalla}</span>
              <h5 class="fw-bold mb-0">${j.jugador}</h5>
              <div class="text-muted small mt-1">${j.equipo}</div>
              <div class="display-5 fw-bold text-info mt-2 mb-0">${j.goles}</div>
              <div class="mt-2 text-uppercase text-secondary" style="letter-spacing:1px;">Goles</div>
            </div>
          </div>
        </div>
      `;
    });
  } else {
    topDiv.innerHTML = `<div class="col text-center text-muted">No hay datos de goleadores.</div>`;
  }

  // Renderiza la tabla
  const tbody = document.getElementById("tablaGoleadores");
  tbody.innerHTML = "";

  if (error || !data) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-danger">Error al cargar goleadores.</td></tr>`;
    return;
  }

  // Filtrar jugadores con goles > 0
  const goleadores = data.filter(p => p.goles > 0);

  if (goleadores.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-muted">No hay jugadores con goles registrados.</td></tr>`;
    return;
  }

  goleadores.forEach((p, idx) => {
    tbody.innerHTML += `
      <tr>
        <td>${idx + 1}</td>
        <td>${p.jugador}</td>
        <td>${p.equipo}</td>
        <td class="fw-bold">${p.goles}</td>
      </tr>
    `;
  });
}
document.addEventListener("DOMContentLoaded", cargarGoleadores);