const API_URL = "http://localhost:3000/api/jugadores";

// Función para cargar y pintar la tabla de jugadores
export async function cargarJugadores(filtro = "", valor = "") {
  let url = API_URL;
  if (filtro && valor) url += `?filtro=${filtro}&valor=${encodeURIComponent(valor)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const cuerpo = document.querySelector("#tablaJugadores tbody");
    cuerpo.innerHTML = "";
    data.forEach(j => {
      cuerpo.innerHTML += `<tr>
        <td>${j.id_jugador}</td>
        <td>${j.nombres}</td>
        <td>${j.apellidos}</td>
        <td>${j.tipo_id || ""}</td>
        <td>${j.numero_id || ""}</td>
        <td>${j.numero_camise || ""}</td>
        <td>${j.posicion || ""}</td>
        <td>
          <span class="badge ${j.estado === 'Activo' ? 'bg-success' : 'bg-danger'}">${j.estado}</span>
        </td>
        <td>
          <!-- Botones para editar/eliminar aquí si deseas -->
          <button class="btn btn-warning btn-sm"><i class="bi bi-pencil-fill"></i></button>
        </td>
      </tr>`;
    });
  } catch (error) {
    alert("Error al cargar jugadores: " + error.message);
    console.error(error);
  }
}

// Lógica del filtro avanzado
document.addEventListener("DOMContentLoaded", () => {
  cargarJugadores();

  document.getElementById("busqueda-rapida-jugadores").addEventListener("submit", function(e){
    e.preventDefault();
    const filtro = document.getElementById("selectFiltroJugador").value;
    const valor = document.getElementById("inputFiltroJugador").value.trim();
    cargarJugadores(filtro, valor);
  });
});
