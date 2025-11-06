import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://cwlvpzossqmpuzdpjrsh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go";
const supabase = createClient(supabaseUrl, supabaseKey);

async function cargarGoleadores() {
  const { data, error } = await supabase
    .from("vista_goleadores")
    .select("*")
    .order("goles", { ascending: false });

  const tbody = document.querySelector("#tablaGoleadores tbody");
  tbody.innerHTML = "";
  if (error || !data) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-danger">Error al cargar goleadores.</td></tr>`;
    return;
  }
  data.forEach((p, idx) => {
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
