import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://cwlvpzossqmpuzdpjrsh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go";
const supabase = createClient(supabaseUrl, supabaseKey);

// Referencias a los elementos del DOM
const equipoSelect = document.getElementById("equipoSelect");
const plantillaContainer = document.getElementById("plantillaContainer");
const placeholderImage = "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png";

/**
 * Carga la lista de equipos desde la tabla "equipos".
 * Guarda el ID del equipo en el 'value' y el nombre en el texto visible.
 */
async function cargarEquipos() {
  if (!equipoSelect) return;

  // CAMBIO CLAVE: Ahora seleccionamos tanto el id como el nombre del equipo.
  // ¡Asegúrate de que tus columnas se llamen 'id_equipo' y 'nombre_equipo'!
  const { data: equipos, error } = await supabase
    .from("equipos")
    .select("id_equipo, nombre_equipo")
    .order("nombre_equipo");

  if (error) {
    console.error("Error al cargar equipos:", error.message);
    equipoSelect.innerHTML = `<option value="">Error al cargar</option>`;
    plantillaContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger">No se pudieron cargar los equipos. Revisa la consola y las políticas RLS de la tabla 'equipos'.</div></div>`;
    return;
  }
  
  equipoSelect.innerHTML = `<option value="">-- Selecciona un equipo --</option>`;
  equipos.forEach(equipo => {
    const option = document.createElement('option');
    // CAMBIO CLAVE: El valor es el ID, el texto es el NOMBRE.
    option.value = equipo.id_equipo; 
    option.textContent = equipo.nombre_equipo;
    equipoSelect.appendChild(option);
  });
}

/**
 * Muestra la plantilla de un equipo específico usando su ID.
 * @param {string} equipoId El ID del equipo a mostrar.
 */
async function mostrarPlantilla(equipoId) {
  if (!plantillaContainer) return;
  
  // Si no se selecciona un ID (ej: la opción "-- Selecciona..."), limpiamos.
  if (!equipoId) {
    plantillaContainer.innerHTML = `<div class="col-12 text-center text-muted"><p class="fs-4">Por favor, selecciona un equipo para ver su plantilla.</p></div>`;
    return;
  }

  plantillaContainer.innerHTML = `<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2">Cargando plantilla...</p></div>`;
  
  // CAMBIO CLAVE: La consulta ahora filtra directamente por 'id_equipo' en la tabla 'jugadores'.
  // Esta es la forma más eficiente y segura de hacerlo.
  const { data: jugadores, error } = await supabase
    .from("jugadores")
    .select("*") // Seleccionamos todas las columnas del jugador
    .eq("id_equipo", equipoId) // Filtramos donde el id_equipo coincida
    .order("nombres"); // Ordenamos por nombre

  if (error) {
    plantillaContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger">Error al cargar la plantilla: ${error.message}</div></div>`;
    return;
  }

  if (!jugadores || jugadores.length === 0) {
    plantillaContainer.innerHTML = `<div class="col-12"><div class="alert alert-info">Este equipo aún no tiene jugadores registrados.</div></div>`;
    return;
  }

  plantillaContainer.innerHTML = ""; // Limpiamos

  jugadores.forEach(jugador => {
    const fotoJugador = jugador.foto_url || placeholderImage;
    const nombreCompleto = `${jugador.nombres} ${jugador.apellidos}`;
    
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
      // Ahora e.target.value contendrá el ID del equipo, no el nombre.
      const equipoIdSeleccionado = e.target.value;
      mostrarPlantilla(equipoIdSeleccionado);
    });
  } else {
    console.error("El elemento con id 'equipoSelect' no fue encontrado.");
  }
});