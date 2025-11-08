// Archivo: scripts/jugadores.js

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://cwlvpzossqmpuzdpjrsh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go";
const supabase = createClient(supabaseUrl, supabaseKey);

// Referencias a los elementos del DOM
const equipoSelect = document.getElementById("equipoSelect");
const plantillaContainer = document.getElementById("plantillaContainer");
const playerModal = document.getElementById('playerModal'); // Referencia al modal
const placeholderImage = "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png";

// Usaremos un Map para guardar los datos de los jugadores cargados
// La clave será el ID del jugador, y el valor será el objeto completo del jugador.
const jugadoresMap = new Map();

/**
 * Carga la lista de equipos en el selector.
 */
async function cargarEquipos() {
  if (!equipoSelect) return;
  const { data: equipos, error } = await supabase
    .from("equipos")
    .select("id_equipo, nombre_equipo")
    .order("nombre_equipo");

  if (error) {
    console.error("Error al cargar equipos:", error.message);
    equipoSelect.innerHTML = `<option value="">Error al cargar</option>`;
    return;
  }
  
  equipoSelect.innerHTML = `<option value="">-- Selecciona un equipo --</option>`;
  equipos.forEach(equipo => {
    const option = document.createElement('option');
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
  
  if (!equipoId) {
    plantillaContainer.innerHTML = `<div class="col-12 text-center text-muted"><p class="fs-4">Por favor, selecciona un equipo para ver su plantilla.</p></div>`;
    return;
  }

  plantillaContainer.innerHTML = `<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Cargando plantilla...</p></div>`;
  
  // Hacemos un JOIN para traer también el nombre del equipo.
  // ¡Asegúrate de tener columnas para las tarjetas en tu tabla de jugadores!
  const { data: jugadores, error } = await supabase
    .from("jugadores")
    .select(`*, equipos(nombre_equipo)`) // Traemos todo del jugador Y el nombre del equipo relacionado
    .eq("id_equipo", equipoId)
    .order("nombres");

  if (error) {
    plantillaContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger">Error: ${error.message}</div></div>`;
    return;
  }

  if (!jugadores || jugadores.length === 0) {
    plantillaContainer.innerHTML = `<div class="col-12"><div class="alert alert-info">Este equipo aún no tiene jugadores registrados.</div></div>`;
    return;
  }

  plantillaContainer.innerHTML = "";
  jugadoresMap.clear(); // Limpiamos el mapa antes de llenarlo de nuevo

  jugadores.forEach(jugador => {
    // Guardamos el jugador en el mapa para poder acceder a sus datos después
    jugadoresMap.set(jugador.id_jugador, jugador);

    const fotoJugador = jugador.foto_url || placeholderImage;
    const nombreCompleto = `${jugador.nombres} ${jugador.apellidos}`;
    
    // ===== PARTE CRUCIAL: AÑADIMOS LOS ATRIBUTOS PARA ABRIR EL MODAL =====
    const cardHTML = `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card player-card h-100" 
             data-bs-toggle="modal" 
             data-bs-target="#playerModal" 
             data-player-id="${jugador.id_jugador}">
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
    equipoSelect.addEventListener("change", (e) => mostrarPlantilla(e.target.value));
  }

  // Event listener para el modal. Se dispara JUSTO ANTES de que el modal se muestre.
  if (playerModal) {
    playerModal.addEventListener('show.bs.modal', function (event) {
      const card = event.relatedTarget; // Obtenemos la carta en la que se hizo clic
      const playerId = parseInt(card.dataset.playerId, 10); // Extraemos el ID
      const jugador = jugadoresMap.get(playerId); // Buscamos los datos del jugador

      if (!jugador) {
        console.error("No se encontró el jugador con ID:", playerId);
        return;
      }

      // Referencias a los elementos dentro del modal
      const modalTitle = playerModal.querySelector('#modalPlayerName');
      const modalBody = playerModal.querySelector('#modalPlayerDetails');

      // Rellenamos el modal con los datos del jugador
      modalTitle.textContent = `${jugador.nombres} ${jugador.apellidos}`;
      
      modalBody.innerHTML = `
        <ul class="list-group list-group-flush">
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <strong>Equipo:</strong>
            <span>${jugador.equipos.nombre_equipo || 'No asignado'}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <strong>Posición:</strong>
            <span>${jugador.posicion || 'No definida'}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <strong>Número de Camiseta:</strong>
            <span class="badge bg-primary rounded-pill fs-6">${jugador.numero_camiseta || 'S/N'}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            Tarjetas Amarillas:
            <span class="badge bg-warning rounded-pill fs-6 text-dark">${jugador.T.A || 0}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            Tarjetas Rojas:
            <span class="badge bg-danger rounded-pill fs-6">${jugador.T.R || 0}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            Tarjetas Azules:
            <span class="badge bg-info rounded-pill fs-6 text-dark">${jugador.T.AZ || 0}</span>
          </li>
        </ul>
      `;
    });
  }
});