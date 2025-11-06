import { supabase } from "./supabaseClient.js";

export async function cargarJugadores(filtro, valor) {
  let query = supabase.from("jugadores").select("*").order("id_jugador");
  if (filtro && valor) {
    query = query.ilike(filtro, `%${valor}%`);
  }
  const { data, error } = await query;
  const cuerpo = document.querySelector("#tablaJugadores tbody");
  cuerpo.innerHTML = "";
  if (error) {
    alert("Error al cargar jugadores: " + error.message);
    return;
  }
  data.forEach(j => {
    cuerpo.innerHTML += `
      <tr>
        <td>${j.id_jugador}</td>
        <td>${j.nombres}</td>
        <td>${j.apellidos}</td>
        <td>${j.tipo_id ?? ""}</td>
        <td>${j.numero_id ?? ""}</td>
        <td>${j.numero_camiseta ?? ""}</td>
        <td>${j.posicion ?? ""}</td>
        <td><span class="badge ${j.estado === "Activo" ? "bg-success" : "bg-danger"}">${j.estado}</span></td>
      </tr>`;
  });
}
document.addEventListener("DOMContentLoaded", () => cargarJugadores());
document.getElementById("busqueda-rapida-jugadores").addEventListener("submit", function(e) {
  e.preventDefault();
  const filtro = document.getElementById("selectFiltroJugador").value;
  const valor = document.getElementById("inputFiltroJugador").value.trim();
  cargarJugadores(filtro, valor);
});
