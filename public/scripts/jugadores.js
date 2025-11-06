import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://cwlvpzossqmpuzdpjrsh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go";
const supabase = createClient(supabaseUrl, supabaseKey);

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
        <td>${j.nombre}</td>
        <td>${j.equipo}</td>
        <td>${j.posicion}</td>
        <td>${j.edad}</td>
      </tr>`;
  });
}
document.addEventListener("DOMContentLoaded", () => {
  cargarJugadores();
});

document.getElementById("filtroForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const filtro = document.getElementById("filtroSelect").value;
  const valor = document.getElementById("filtroInput").value.trim();
  cargarJugadores(filtro, valor);
});

document.getElementById("resetButton").addEventListener("click", function () {
  document.getElementById("filtroInput").value = "";
  cargarJugadores();
}); 
