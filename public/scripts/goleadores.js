// /public/scripts/goleadores.js

async function cargarGoleadores() {
    try {
        const response = await fetch('http://localhost:3000/api/goleadores'); 
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json(); 

        // --- Render tabla inferior ---
        const tbody = document.querySelector('#tablaGoleadores tbody');
        tbody.innerHTML = '';
        data.forEach((jugador, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="badge-rank">${index + 1}</span></td>
                <td>${jugador.jugador}</td>

                <td>${jugador.goles}</td>
            `;
            tbody.appendChild(tr);
        });

        // --- Render top 3 cartas ---
        const top3 = data.slice(0, 3);
        const lista = document.getElementById('jugadores-list');
        if(lista){
            lista.innerHTML = top3.map(jugador => `
                <div class="jugador-card">
                    <img src="${jugador.avatar || 'images/avatar1.jpg'}" alt="Avatar Jugador" class="jugador-avatar">
                    <div class="jugador-nombre">${jugador.jugador}</div>
                    <div class="jugador-equipo"><i class="fas fa-shield-alt"></i> ${jugador.equipo}</div>
                    <span class="badge-goles"><i class="fas fa-futbol"></i> ${jugador.goles} goles</span>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error al cargar los goleadores:', error);
        const tbody = document.querySelector('#tablaGoleadores tbody');
        if(tbody) tbody.innerHTML = `<tr><td colspan="4" class="text-danger">No se pudieron cargar los datos. Verifique que el servidor (http://localhost:3000) esté corriendo.</td></tr>`;
        // Mensaje de error en cartas
        const lista = document.getElementById('jugadores-list');
        if(lista) lista.innerHTML = `<div class="text-danger p-2">No se pudieron cargar los mejores goleadores</div>`;
    }
}

cargarGoleadores();
