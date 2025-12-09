// scripts/posiciones.js

// Supabase llega como global desde el CDN en el HTML
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
const { createClient } = window.supabase;

const supabaseUrl = "https://cwlvpzossqmpuzdpjrsh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go";

// Crear cliente único
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Vista: vista_posiciones
async function cargarPosiciones() {
  const tabla = document.getElementById("tablaPosiciones");
  if (!tabla) return;

  const { data, error } = await supabaseClient
    .from("vista_posiciones")
    .select("*")
    .order("puntos", { ascending: false })
    .order("diferencia_goles", { ascending: false })
    .order("goles_favor", { ascending: false });

  tabla.innerHTML = "";

  if (error || !data) {
    tabla.innerHTML = `<tr><td colspan="10" class="text-danger">Error al cargar posiciones.</td></tr>`;
    console.error("Error cargarPosiciones:", error);
    return;
  }

  data.forEach((p, idx) => {
    tabla.innerHTML += `
      <tr>
        <td>${idx + 1}</td>
        <td>${p.nombre_equipo}</td>
        <td>${p.partidos_jugados}</td>
        <td>${p.partidos_ganados}</td>
        <td>${p.partidos_empatados}</td>
        <td>${p.partidos_perdidos}</td>
        <td>${p.goles_favor}</td>
        <td>${p.goles_contra}</td>
        <td>${p.diferencia_goles}</td>
        <td>${p.puntos}</td>
      </tr>`;
  });
}

document.addEventListener("DOMContentLoaded", cargarPosiciones);
