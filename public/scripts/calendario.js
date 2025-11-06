import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "Thttps://cwlvpzossqmpuzdpjrsh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go";
const supabase = createClient(supabaseUrl, supabaseKey);

// Vista: vista_resultados
async function cargarPartidos() {
  const { data, error } = await supabase
    .from("vista_resultados")
    .select("*")
    .order("jornada")
    .order("fecha")
    .order("hora");

  const tablaPartidosBody = document.getElementById("tablaPartidos");
  tablaPartidosBody.innerHTML = "";
  if (error || !data) {
    tablaPartidosBody.innerHTML = `<tr><td colspan="7" class="text-danger">Error al cargar partidos.</td></tr>`;
    return;
  }
  data.forEach(item => {
    tablaPartidosBody.innerHTML += `
      <tr>
        <td>${item.jornada}</td>
        <td>${item.fecha}</td>
        <td>${item.hora}</td>
        <td>${item.equipo_local}</td>
        <td>${item.equipo_visitante}</td>
        <td>${item.resultado || '-'}</td>
        <td>${item.estado || '-'}</td>
      </tr>`;
  });
}
document.addEventListener("DOMContentLoaded", cargarPartidos);
