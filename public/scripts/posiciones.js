import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://cwlvpzossqmpuzdpjrsh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go";
const supabase = createClient(supabaseUrl, supabaseKey);

// Vista: vista_posiciones
async function cargarPosiciones() {
  const { data, error } = await supabase
    .from("vista_posiciones")
    .select("*")
    .order("puntos", { ascending: false })
    .order("diferencia_goles", { ascending: false })
    .order("goles_favor", { ascending: false });
  const tabla = document.getElementById("tablaPosiciones");
  tabla.innerHTML = "";
  if (error || !data) {
    tabla.innerHTML = `<tr><td colspan="10" class="text-danger">Error al cargar posiciones.</td></tr>`;
    return;
  }
  data.forEach((item, idx) => {
    tabla.innerHTML += `
      <tr>
        <td>${idx + 1}</td>
        <td>${item.equipo}</td>
        <td>${item.pj}</td>
        <td>${item.pg}</td>
        <td>${item.pe}</td>
        <td>${item.pp}</td>
        <td>${item.goles_favor}</td>
        <td>${item.goles_contra}</td>
        <td>${item.diferencia_goles}</td>
        <td>${item.puntos}</td>
      </tr>`;
  });
}
document.addEventListener("DOMContentLoaded", cargarPosiciones);
