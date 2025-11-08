import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://cwlvpzossqmpuzdpjrsh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go";
const supabase = createClient(supabaseUrl, supabaseKey);

const equipoSelect = document.getElementById("equipoSelect");
const plantillaContainer = document.getElementById("plantillaContainer");
// URL de la imagen predeterminada para jugadores sin foto
const placeholderImage = "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png";

/**
 * Carga la lista de equipos únicos en el selector.
 */
async function cargarEquipos() {
  const { data, error } = await supabase
    .from("jugadores")
    .select("equipo");

  if (error) {
    console.error("Error al cargar equipos:", error);
    equipoSelect.innerHTML = `<option value="">Error al cargar</option>`;
    return;
  }

  // Obtenemos una lista de equipos únicos usando Set
  const equiposUnicos = [...new Set(data.map(item => item.equipo))].sort();
  
  equipoSelect.innerHTML = `<option value="">-- Selecciona un equipo --</option>`; // Opción por defecto
  equiposUnicos.forEach(equipo => {
    equipoSelect.innerHTML += `<option value="${equipo}">${equipo}</option>`;
  });
}

/**
 * Muestra la plantilla de un equipo específico en formato de cartas.
 * @param {string} nombreEquipo El nombre del equipo a mostrar.
 */
async function mostrarPlantilla(nombreEquipo) {
  if (!nombreEquipo) {
    plantillaContainer.innerHTML = `
      <div class="col-12 text-center text-muted">
        <p class="fs-4">Por favor, selecciona un equipo para ver su plantilla.</p>
      </div>`;
    return;
  }

  // Muestra un mensaje de "cargando..."
  plantillaContainer.innerHTML = `
    <div class="col-12 text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Cargando plantilla de ${nombreEquipo}...</p>
    </div>`;
  
  const { data: jugadores, error } = await supabase
    .from("jugadores")
    .select("*")
    .eq("equipo", nombreEquipo) // Filtramos por el nombre exacto del equipo
    .order("nombre"); // Ordenamos por nombre

  if (error) {
    plantillaContainer.innerHTML = `<div class="alert alert-danger">Error al cargar la plantilla: ${error.message}</div>`;
    return;
  }

  if (!jugadores || jugadores.length === 0) {
    plantillaContainer.innerHTML = `<div class="alert alert-info">No se encontraron jugadores para ${nombreEquipo}.</div>`;
    return;
  }

  // Limpiamos el contenedor antes de añadir las nuevas cartas
  plantillaContainer.innerHTML = "";

  // Creamos una carta por cada jugador
  jugadores.forEach(jugador => {
    // Si tu tabla tiene una columna para la URL de la foto (ej: 'foto_url'), úsala.
    // Si no, usa siempre la predeterminada.
    const fotoJugador = jugador.foto_url || placeholderImage;

    const cardHTML = `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card player-card h-100">
          <img src="${fotoJugador}" class="card-img-top" alt="Foto de ${jugador.nombre}">
          <div class="card-body">
            <h5 class="card-title fw-bold">${jugador.nombre}</h5>
            <p class="card-text player-position">${jugador.posicion || 'Posición no definida'}</p>
            <span class="player-age">${jugador.edad || '?'} años</span>
          </div>
        </div>
      </div>
    `;
    plantillaContainer.innerHTML += cardHTML;
  });
}

// --- EVENT LISTENERS ---

// Al cargar la página, llenamos el selector de equipos.
document.addEventListener("DOMContentLoaded", () => {
  cargarEquipos();
});

// Cuando el usuario cambia el equipo en el selector, mostramos su plantilla.
equipoSelect.addEventListener("change", (e) => {
  const equipoSeleccionado = e.target.value;
  mostrarPlantilla(equipoSeleccionado);
});