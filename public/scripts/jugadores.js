import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://cwlvpzossqmpuzdpjrsh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go";
const supabase = createClient(supabaseUrl, supabaseKey);

// Referencias a los elementos del DOM
const equipoSelect = document.getElementById("equipoSelect");
const plantillaContainer = document.getElementById("plantillaContainer");
const placeholderImage = "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png";

/**
 * Carga la lista de equipos únicos desde la tabla "equipos".
 * ¡Asegúrate de que tu tabla se llame "equipos" y la columna del nombre "nombre_equipo"!
 * Si se llaman diferente, ajústalo en la línea .from("equipos").select("nombre_equipo")
 */
async function cargarEquipos() {
  if (!equipoSelect) return;

  // CAMBIO: Ahora consultamos la tabla "equipos"
  const { data: equipos, error } = await supabase
    .from("equipos")
    .select("nombre_equipo") // Asumo que la columna se llama 'nombre_equipo'
    .order("nombre_equipo");

  if (error) {
    console.error("Error al cargar equipos:", error.message);
    equipoSelect.innerHTML = `<option value="">Error al cargar</option>`;
    plantillaContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger">No se pudieron cargar los equipos. <strong>Causa probable:</strong> Falta la política de RLS en la tabla 'equipos' o el nombre de la tabla/columna es incorrecto.</div></div>`;
    return;
  }
  
  equipoSelect.innerHTML = `<option value="">-- Selecciona un equipo --</option>`;
  equipos.forEach(equipo => {
    // CAMBIO: Usamos la columna del nombre del equipo
    const option = document.createElement('option');
    option.value = equipo.nombre_equipo; 
    option.textContent = equipo.nombre_equipo;
    equipoSelect.appendChild(option);
  });
}

/**
 * Muestra la plantilla de un equipo específico.
 * @param {string} nombreEquipo El nombre del equipo a mostrar.
 */
async function mostrarPlantilla(nombreEquipo) {
  if (!plantillaContainer) return;
  
  if (!nombreEquipo) {
    plantillaContainer.innerHTML = `<div class="col-12 text-center text-muted"><p class="fs-4">Por favor, selecciona un equipo para ver su plantilla.</p></div>`;
    return;
  }

  plantillaContainer.innerHTML = `<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Cargando plantilla de ${nombreEquipo}...</p></div>`;
  
  // CAMBIO: Hacemos una consulta relacional.
  // 1. Seleccionamos todo de "jugadores" (*) y de la tabla relacionada "equipos" traemos "nombre_equipo".
  // 2. Filtramos donde el "nombre_equipo" de la tabla "equipos" sea igual al que seleccionamos.
  const { data: jugadores, error } = await supabase
    .from("jugadores")
    .select(`
      *, 
      equipos (nombre_equipo)
    `)
    .eq("equipos.nombre_equipo", nombreEquipo)
    .order("nombres");

  if (error) {
    plantillaContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger">Error al cargar la plantilla: ${error.message}</div></div>`;
    return;
  }

  if (!jugadores || jugadores.length === 0) {
    plantillaContainer.innerHTML = `<div class="col-12"><div class="alert alert-info">No se encontraron jugadores para ${nombreEquipo}.</div></div>`;
    return;
  }

  plantillaContainer.innerHTML = ""; // Limpiamos

  jugadores.forEach(jugador => {
    const fotoJugador = jugador.foto_url || placeholderImage; // Asumiendo que podrías tener una columna 'foto_url'
    
    // CAMBIO: Usamos "nombres" y "apellidos" en lugar de "nombre".
    const nombreCompleto = `${jugador.nombres} ${jugador.apellidos}`;
    
    // NOTA: Tu tabla no tiene una columna 'edad'. La he quitado de la tarjeta.
    // Si la necesitas, deberás añadirla a tu tabla en Supabase.
    const cardHTML = `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card player-card h-100">
          <img src="${fotoJugador}" class="card-img-top" alt="Foto de ${nombreCompleto}">
          <div class="card-body d-flex flex-column text-center">
            <h5 class="card-title fw-bold">${nombreCompleto}</h5>
            <p class="card-text player-position text-muted mb-2">${jugador.posicion || 'Posición no definida'}</p>
            <div class="mt-auto">
              <span class="player-age">#${jugador.numero_camiseta || '?'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    plantillaContainer.innerHTML += cardHTML;
  });
}

// --- EVENT LISTENERS ---
document.addEventListener("DOMContentLoaded", () => {
  if (equipoSelect) {
    cargarEquipos();
    
    equipoSelect.addEventListener("change", (e) => {
      mostrarPlantilla(e.target.value);
    });
  } else {
    console.error("El elemento con id 'equipoSelect' no fue encontrado.");
  }
});