import { supabase } from "./supabaseClient.js";

async function cargarGoleadores() {
  const { data, error } = await supabase
    .from("vista_goleadores")
    .select("*")
    .order("goles", { ascending: false });
  const tbody = document.querySelector("#tablaGoleadores tbody");
  tbody.innerHTML = "";
  if (error) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-danger">No se pudieron cargar los datos.</td></tr>`;
    return;
  }
  data.forEach((jugador, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="badge-rank">${index + 1}</span></td>
      <td>${jugador.jugador}</td>
      <td>${jugador.goles}</td>`;
    tbody.appendChild(tr);
  });
}
document.addEventListener("DOMContentLoaded", cargarGoleadores);
