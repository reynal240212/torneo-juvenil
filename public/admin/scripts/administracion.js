// Archivo: public/admin/scripts/administracion.js

// 1. IMPORTAR CLIENTE Y CONFIGURACIÓN CENTRALIZADA
import { supabase, API_BASE, SUPABASE_KEY_EXPORT } from "../scripts/supabaseClient.js"; 
// NOTA: Asegúrate de que 'supabaseClient.js' esté en la carpeta 'public/scripts/'

// 2. VARIABLES GLOBALES
const contentArea = document.getElementById('content-area');
const crudModal = new bootstrap.Modal(document.getElementById('crudModal'));
const navLinks = document.querySelectorAll('#admin-nav-links a'); 
let currentView = 'dashboard';
const teamsCache = []; 
let USER_TOKEN = null; 
const SUPABASE_KEY = SUPABASE_KEY_EXPORT; 


// 🔐 CARGA DE SESIÓN Y DISPLAY DE USUARIO
async function loadAuthSession() {
    try {
        const { data: { session } } = await supabase.auth.getSession(); 
        if (session) {
            USER_TOKEN = session.access_token;
            // Display en el Navbar
            document.getElementById('user-display-email').textContent = localStorage.getItem("email_admin");
            document.getElementById('user-display-rol').textContent = localStorage.getItem("rol");
        } else {
            window.location.href = "login.html";
        }
    } catch (error) {
        console.error("Error cargando sesión de Auth:", error);
        window.location.href = "login.html";
    }
}

function logout() {
    supabase.auth.signOut(); 
    localStorage.clear();
    window.location.href = "login.html";
}


document.addEventListener('DOMContentLoaded', async () => {
    // Vincular el botón de Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);

    await loadAuthSession(); 
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.target.getAttribute('data-view') || e.target.closest('a').getAttribute('data-view');
            if (view) loadView(view);
        });
    });

    loadView('dashboard');
    document.querySelector('[data-view="dashboard"]').classList.add('active');
});

// ===============================
// 0. LÓGICA DE VISTAS PRINCIPAL
// ===============================

function loadView(viewName) {
    currentView = viewName;
    contentArea.classList.remove('loaded');
    
    navLinks.forEach(l => l.classList.remove('active'));
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

    contentArea.innerHTML = `<h2 class="fw-bold mb-3 text-center" style="color:var(--color-blue)">Cargando ${viewName.toUpperCase()}...</h2>`;
    
    switch (viewName) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'equipos':
            renderEquiposView();
            break;
        case 'jugadores':
            renderJugadoresView();
            break;
        case 'usuarios': 
            renderUsuariosView();
            break;
        case 'partidos': 
            renderPartidosView();
            break;
        case 'goleadores': 
            renderGoleadoresView();
            break;
        case 'posiciones': 
            renderPosicionesView();
            break;
        default:
            contentArea.innerHTML = `<h2 class="mt-4 text-danger">Vista "${viewName}" no implementada.</h2>`;
    }
    setTimeout(() => contentArea.classList.add('loaded'), 50);
}

function renderDashboard() {
    contentArea.innerHTML = `
        <h2 class="fw-bold mb-3" style="color:var(--color-blue)">Dashboard y Resumen del Torneo</h2>
        <p class="text-secondary">Visión general de las estadísticas principales del torneo.</p>
        <div class="row text-center mt-5">
            <div class="col-md-4">
                <div class="card shadow p-3 bg-light">
                    <h3>Total Equipos</h3>
                    <p class="fs-1 fw-bold text-primary" id="stat-equipos">0</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card shadow p-3 bg-light">
                    <h3>Total Jugadores</h3>
                    <p class="fs-1 fw-bold text-success" id="stat-jugadores">0</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card shadow p-3 bg-light">
                    <h3>Partidos Jugados</h3>
                    <p class="fs-1 fw-bold text-info" id="stat-partidos">0</p>
                </div>
            </div>
        </div>
        <div class="alert alert-info mt-4">
            <i class="bi bi-info-circle-fill"></i> Para ver las estadísticas reales, necesitarás funciones SQL (RPC) que cuenten los registros.
        </div>
    `;
    // Implementar la carga de estadísticas reales aquí
}

// ===============================
// 1. MÓDULO EQUIPOS
// ===============================

async function renderEquiposView() {
    contentArea.innerHTML = `
        <h2 class="fw-bold mb-3" style="color:var(--color-blue)">Gestión de Equipos</h2>
        <div class="d-flex justify-content-end mb-3">
            <button class="btn btn-success btn-admin" id="btnAgregarEquipo">
                <i class="bi bi-plus-circle"></i> Agregar Equipo
            </button>
        </div>
        <div class="table-responsive">
            <table class="table table-dark table-hover align-middle text-center shadow" id="tablaEquipos">
                <thead class="table-secondary">
                    <tr>
                        <th>ID</th>
                        <th>Logo</th>
                        <th>Nombre del Equipo</th>
                        <th>Delegado</th>
                        <th>Teléfono</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody><tr><td colspan="6">Cargando equipos...</td></tr></tbody>
            </table>
        </div>
    `;
    document.getElementById('btnAgregarEquipo').addEventListener('click', () => prepararCrud('equipo'));
    await cargarEquipos();
}

async function cargarEquipos() {
    try {
        const res = await fetch(`${API_BASE}/equipos?select=*`, {
            headers: { 
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${USER_TOKEN}` 
            }
        });
        
        if (!res.ok) {
            const errorDetails = await res.json();
            throw new Error(`Error al cargar: ${errorDetails.message || 'Error desconocido'}`);
        }
        const data = await res.json();
        
        teamsCache.splice(0, teamsCache.length, ...data); 

        const cuerpo = document.querySelector("#tablaEquipos tbody");
        if (!cuerpo) return; 

        cuerpo.innerHTML = "";
        if (data.length === 0) {
            cuerpo.innerHTML = `<tr><td colspan="6">No hay equipos registrados.</td></tr>`;
            return;
        }

        data.forEach(eq => {
            const logo = eq.logo_url ? `<img src="${eq.logo_url}" alt="Logo" height="30" class="rounded-circle">` : '<i class="bi bi-shield-fill-exclamation" style="font-size: 1.5rem;"></i>';
            
            const nombre = eq.nombre_equipo.replace(/'/g, "\\'");
            const delegado = (eq.delegado || '').replace(/'/g, "\\'");
            const telefono = (eq.telefono || '').replace(/'/g, "\\'");
            const logoUrl = (eq.logo_url || '').replace(/'/g, "\\'");
            
            cuerpo.innerHTML += `
            <tr>
              <td>${eq.id_equipo}</td>
              <td>${logo}</td>
              <td class="text-start">${eq.nombre_equipo}</td>
              <td>${eq.delegado || "N/A"}</td>
              <td>${eq.telefono || "N/A"}</td>
              <td>
                <button class="btn btn-warning btn-sm" onclick="prepararCrud('equipo', ${eq.id_equipo}, '${nombre}', '${delegado}', '${telefono}', '${logoUrl}')">
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarEntidad('equipos', ${eq.id_equipo}, '${nombre}')">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </td>
            </tr>`;
        });
    } catch (error) {
        console.error("Error cargando equipos:", error);
        const cuerpo = document.querySelector("#tablaEquipos tbody");
        if (cuerpo) cuerpo.innerHTML = `<tr><td colspan="6" class="text-danger">Error: ${error.message}</td></tr>`;
    }
}

// ===============================
// 2. MÓDULO JUGADORES
// ===============================

async function renderJugadoresView() {
    if (teamsCache.length === 0) await cargarEquipos(); 

    const equipoOptions = teamsCache.map(eq => 
        `<option value="${eq.id_equipo}">${eq.nombre_equipo}</option>`
    ).join('');

    contentArea.innerHTML = `
        <h2 class="fw-bold mb-3" style="color:var(--color-blue)">Gestión de Jugadores</h2>
        <form class="d-flex gap-2 mb-3 flex-wrap" id="busqueda-rapida-jugadores" autocomplete="off">
            <select id="selectFiltroJugador" class="form-select" style="max-width:140px">
                <option value="nombres">Nombre</option>
                <option value="apellidos">Apellido</option>
                <option value="posicion">Posición</option>
                <option value="numero_id">Doc</option>
                <option value="estado">Estado</option>
            </select>
            <input type="search" class="form-control" id="inputFiltroJugador" placeholder="Buscar...">
            <select id="selectEquipoJugador" class="form-select" style="max-width:170px">
                <option value="">Todos los equipos</option>
                ${equipoOptions}
            </select>
            <button class="btn btn-admin" type="submit"><i class="bi bi-search"></i> Filtrar</button>
            <button class="btn btn-info" type="button" id="btnMostrarTodos"><i class="bi bi-list-columns-reverse"></i> Mostrar Todos</button>
            <button class="btn btn-success btn-admin ms-auto" type="button" id="btnAgregarJugador">
                <i class="bi bi-plus-circle"></i> Agregar Jugador
            </button>
        </form>

        <div class="table-responsive">
            <table class="table table-dark table-hover align-middle text-center shadow" id="tablaJugadores">
                <thead class="table-secondary">
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Equipo</th>
                        <th># Camiseta</th>
                        <th>Posición</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody><tr><td colspan="8">Haz una búsqueda o pulsa "Mostrar Todos" para ver jugadores.</td></tr></tbody>
            </table>
        </div>
    `;
    
    document.getElementById("btnAgregarJugador").addEventListener('click', () => prepararCrud('jugador'));
    document.getElementById("busqueda-rapida-jugadores").addEventListener("submit", handleFiltroJugador);
    document.getElementById("btnMostrarTodos").addEventListener("click", () => cargarJugadores());
    document.getElementById("selectEquipoJugador").addEventListener("change", handleFiltroJugador);

    cargarJugadores();
}

async function cargarJugadores(filtro = "", valor = "", id_equipo = "") {
    // Se usa el JOIN para obtener el nombre del equipo: ?select=*,equipos(nombre_equipo)
    let url = `${API_BASE}/jugadores?select=*,equipos(nombre_equipo)`;
    let params = [];
    
    if (filtro && valor) params.push(`${filtro}=ilike.*${encodeURIComponent(valor)}*`);
    if (id_equipo) params.push(`id_equipo=eq.${id_equipo}`);
    
    if (params.length) url += `&${params.join("&")}`; // PostgREST usa & para múltiples filtros

    try {
        const res = await fetch(url, {
            headers: { 
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${USER_TOKEN}` 
            }
        });

        if (!res.ok) {
            const errorDetails = await res.json();
            throw new Error(`Error al cargar: ${errorDetails.message || 'Error desconocido'}`);
        }
        const data = await res.json();
        renderJugadores(data);
    } catch (error) {
        console.error("Error cargando jugadores:", error);
        const cuerpo = document.querySelector("#tablaJugadores tbody");
        if (cuerpo) cuerpo.innerHTML = `<tr><td colspan="8" class="text-danger">Error: ${error.message}</td></tr>`;
    }
}

function handleFiltroJugador(e) {
    e.preventDefault();
    const filtro = document.getElementById("selectFiltroJugador")?.value || "";
    const valor = document.getElementById("inputFiltroJugador")?.value.trim() || "";
    const id_equipo = document.getElementById("selectEquipoJugador")?.value || "";

    if (valor || id_equipo) cargarJugadores(filtro, valor, id_equipo);
    else if (e.target.id === 'selectEquipoJugador' && id_equipo) cargarJugadores("", "", id_equipo);
}

function renderJugadores(jugadores) {
    const cuerpo = document.querySelector("#tablaJugadores tbody");
    if (!cuerpo) return; 
    cuerpo.innerHTML = "";

    if (jugadores.length === 0) {
        cuerpo.innerHTML = `<tr><td colspan="8">No se encontraron jugadores.</td></tr>`;
        return;
    }

    jugadores.forEach(j => {
        // Obtener el nombre del equipo del JOIN
        const equipoNombre = j.equipos ? j.equipos.nombre_equipo : teamsCache.find(t => t.id_equipo == j.id_equipo)?.nombre_equipo || 'Sin Equipo';
        const editParams = JSON.stringify(j).replace(/'/g, "\\'"); 
        
        cuerpo.innerHTML += `
        <tr>
            <td>${j.id_jugador}</td>
            <td>${j.nombres}</td>
            <td>${j.apellidos}</td>
            <td>${equipoNombre}</td>
            <td>${j.numero_camiseta || "N/A"}</td>
            <td>${j.posicion || "N/A"}</td>
            <td>
                <span class="badge ${j.estado === 'Activo' ? 'bg-success' : 'bg-danger'}">${j.estado}</span>
            </td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="prepararCrud('jugador', ${editParams})">
                    <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarEntidad('jugadores', ${j.id_jugador}, '${j.nombres} ${j.apellidos}')">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </td>
        </tr>`;
    });
}

// ===============================
// 3. MÓDULO USUARIOS
// ===============================

async function renderUsuariosView() {
     contentArea.innerHTML = `
        <h2 class="fw-bold mb-3" style="color:var(--color-blue)">Gestión de Usuarios Admin</h2>
        <div class="d-flex justify-content-end mb-3">
            <button class="btn btn-success btn-admin" id="btnAgregarUsuario">
                <i class="bi bi-person-plus"></i> Agregar Usuario
            </button>
        </div>
        <div class="table-responsive">
            <table class="table table-dark table-hover align-middle text-center shadow" id="tablaUsuarios">
                <thead class="table-secondary">
                    <tr>
                        <th>ID (UUID)</th>
                        <th>Email</th>
                        <th>Nombre</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody><tr><td colspan="6">Cargando usuarios...</td></tr></tbody>
            </table>
        </div>
    `;
    document.getElementById('btnAgregarUsuario').addEventListener('click', () => prepararCrud('usuario'));
    await cargarUsuarios();
}

async function cargarUsuarios() {
    try {
        // LLAMADA DIRECTA A SUPABASE REST
        const res = await fetch(`${API_BASE}/usuarios?select=id,email,nombre_completo,rol,estado`, {
            headers: { 
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${USER_TOKEN}` 
            }
        });

        if (!res.ok) {
            const errorDetails = await res.json();
            throw new Error(`Error al cargar: ${errorDetails.message || 'Error desconocido'}`);
        }
        const data = await res.json();
        
        const cuerpo = document.querySelector("#tablaUsuarios tbody");
        if (!cuerpo) return;
        
        cuerpo.innerHTML = "";

        data.forEach(u => {
            const estadoBadge = u.estado ? 
                `<span class="badge bg-success">Activo</span>` : 
                `<span class="badge bg-danger">Inactivo</span>`;
            
            const editParams = JSON.stringify(u).replace(/'/g, "\\'"); 
            
            cuerpo.innerHTML += `
            <tr>
              <td>${u.id.substring(0, 8)}...</td>
              <td class="text-start">${u.email}</td>
              <td>${u.nombre_completo || 'N/A'}</td>
              <td>${u.rol}</td>
              <td>${estadoBadge}</td>
              <td>
                <button class="btn btn-warning btn-sm" onclick="prepararCrud('usuario', ${editParams})">
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarEntidad('usuarios', '${u.id}', '${u.email}')">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </td>
            </tr>`;
        });
    } catch (error) {
        console.error("Error cargando usuarios:", error);
        const cuerpo = document.querySelector("#tablaUsuarios tbody");
        if (cuerpo) cuerpo.innerHTML = `<tr><td colspan="6" class="text-danger">Error: ${error.message}</td></tr>`;
    }
}

// ===============================
// 4. MÓDULO PARTIDOS / FIXTURE
// ===============================

async function renderPartidosView() {
     contentArea.innerHTML = `
        <h2 class="fw-bold mb-3" style="color:var(--color-blue)">Gestión de Partidos / Fixture</h2>
        <div class="table-responsive">
            <table class="table table-dark table-hover align-middle text-center shadow" id="tablaPartidos">
                <thead class="table-secondary">
                    <tr>
                        <th>Jornada</th>
                        <th>Fecha y Hora</th>
                        <th>Local</th>
                        <th>Resultado</th>
                        <th>Visitante</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody><tr><td colspan="7">Cargando fixture...</td></tr></tbody>
            </table>
        </div>
    `;
    if (teamsCache.length === 0) await cargarEquipos(); 
    await cargarPartidos();
}

async function cargarPartidos() {
    try {
        // LLAMADA DIRECTA A SUPABASE REST: Usamos la tabla 'partidos' y hacemos JOIN con equipos y fixture_futbol
        const res = await fetch(`${API_BASE}/partidos?select=*,id_equipo_local:equipos!fk_equipo_local(nombre_equipo),id_equipo_visitante:equipos!fk_equipo_visitante(nombre_equipo)`, {
             headers: { 
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${USER_TOKEN}` 
            }
        }); 
        
        if (!res.ok) {
            const errorDetails = await res.json();
            throw new Error(`Error al cargar: ${errorDetails.message || 'Error desconocido'}`);
        }
        const data = await res.json();
        
        const cuerpo = document.querySelector("#tablaPartidos tbody");
        if (!cuerpo) return;
        cuerpo.innerHTML = "";

        data.forEach(p => {
            // Obtener nombres usando el JOIN implícito de PostgREST
            const local = p.id_equipo_local.nombre_equipo || 'Local Desconocido';
            const visitante = p.id_equipo_visitante.nombre_equipo || 'Visitante Desconocido';
            
            const marcador = p.estado === 'Jugado' ? 
                             `${p.marcador_local || 0} - ${p.marcador_visitante || 0}` : 'vs';

            const estadoBadge = p.estado === 'Pendiente' ? `<span class="badge bg-warning text-dark">Pendiente</span>` :
                                p.estado === 'Jugado' ? `<span class="badge bg-success">Finalizado</span>` :
                                `<span class="badge bg-danger">Aplazado</span>`;

            const editParams = JSON.stringify(p).replace(/'/g, "\\'"); 

            cuerpo.innerHTML += `
            <tr>
              <td>${p.jornada || 'N/A'}</td>
              <td>${new Date(p.fecha).toLocaleDateString()} ${p.hora || ''}</td>
              <td class="text-end fw-bold">${local}</td>
              <td>${marcador}</td>
              <td class="text-start fw-bold">${visitante}</td>
              <td>${estadoBadge}</td>
              <td>
                <button class="btn btn-primary btn-sm" onclick="prepararCrud('resultado', ${editParams})">
                  <i class="bi bi-gear-fill"></i> Gest. Resultado
                </button>
              </td>
            </tr>`;
        });
    } catch (error) {
        console.error("Error cargando partidos:", error);
        const cuerpo = document.querySelector("#tablaPartidos tbody");
        if (cuerpo) cuerpo.innerHTML = `<tr><td colspan="7" class="text-danger">Error: ${error.message}</td></tr>`;
    }
}

// ===============================
// 5. MÓDULO GOLEADORES (Ranking)
// ===============================

async function renderGoleadoresView() {
     contentArea.innerHTML = `
        <h2 class="fw-bold mb-3" style="color:var(--color-blue)">Tabla de Goleadores (Ranking)</h2>
        <p class="text-muted">Esta tabla se actualiza automáticamente con los goles registrados en los partidos.</p>
        <div class="table-responsive">
            <table class="table table-dark table-hover align-middle text-center shadow" id="tablaGoleadores">
                <thead class="table-secondary">
                    <tr>
                        <th>#</th>
                        <th>Nombre Completo</th>
                        <th>Equipo</th>
                        <th>Goles</th>
                        <th>Foto</th> 
                    </tr>
                </thead>
                <tbody><tr><td colspan="5">Cargando ranking...</td></tr></tbody>
            </table>
        </div>
    `;
    await cargarGoleadores();
}

async function cargarGoleadores() {
     try {
        // LLAMADA RPC (función SQL de Supabase) para obtener el ranking
        const res = await fetch(`${API_BASE}/rpc/get_goleadores_ranking`, { // Suponemos una función rpc llamada get_goleadores_ranking
            method: 'POST', // Las RPC (Remote Procedure Calls) son POST
            headers: { 
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${USER_TOKEN}` 
            },
            body: JSON.stringify({}) // Si la función no necesita parámetros
        }); 

         if (!res.ok) {
            const errorDetails = await res.json();
            throw new Error(`Error al cargar: ${errorDetails.message || 'Error desconocido'}`);
        }
        const data = await res.json();
        
        const cuerpo = document.querySelector("#tablaGoleadores tbody");
        if (!cuerpo) return;
        cuerpo.innerHTML = "";
        
        data.forEach((g, index) => {
            cuerpo.innerHTML += `
            <tr>
              <td>${index + 1}</td>
              <td class="text-start">${g.nombres} ${g.apellidos}</td>
              <td>${g.nombre_equipo || 'N/A'}</td>
              <td class="fw-bold">${g.goles}</td>
              <td><i class="bi bi-person-circle" style="font-size: 1.5rem;"></i></td>
            </tr>`;
        });

    } catch (error) { 
        console.error("Error cargando goleadores:", error);
        const cuerpo = document.querySelector("#tablaGoleadores tbody");
        if (cuerpo) cuerpo.innerHTML = `<tr><td colspan="5" class="text-danger">Error: ${error.message}. Asegura que la función RPC 'get_goleadores_ranking' existe.</td></tr>`;
    }
}

// ===============================
// 6. MÓDULO POSICIONES (Tabla)
// ===============================

async function renderPosicionesView() {
    contentArea.innerHTML = `
        <h2 class="fw-bold mb-3" style="color:var(--color-blue)">Tabla de Posiciones</h2>
        <p class="text-muted">Esta tabla se calcula con los resultados de los partidos.</p>
        <div class="table-responsive">
            <table class="table table-dark table-hover align-middle text-center shadow" id="tablaPosiciones">
                <thead class="table-secondary">
                    <tr>
                        <th>#</th>
                        <th>Equipo</th>
                        <th>PJ</th>
                        <th>PG</th>
                        <th>PE</th>
                        <th>PP</th>
                        <th>GF</th>
                        <th>GC</th>
                        <th>DIF</th>
                        <th>PTS</th>
                    </tr>
                </thead>
                <tbody><tr><td colspan="10">Cargando tabla de posiciones...</td></tr></tbody>
            </table>
        </div>
    `;
    await cargarPosiciones();
}

async function cargarPosiciones() {
     try {
        // LLAMADA RPC (función SQL de Supabase) para obtener las posiciones
        const res = await fetch(`${API_BASE}/rpc/get_posiciones_table`, { // Suponemos una función rpc llamada get_posiciones_table
            method: 'POST', 
            headers: { 
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${USER_TOKEN}` 
            },
            body: JSON.stringify({})
        }); 

        if (!res.ok) {
            const errorDetails = await res.json();
            throw new Error(`Error al cargar: ${errorDetails.message || 'Error desconocido'}`);
        }
        const data = await res.json();
        
        const cuerpo = document.querySelector("#tablaPosiciones tbody");
        if (!cuerpo) return;
        cuerpo.innerHTML = "";

        data.forEach((p, index) => {
            cuerpo.innerHTML += `
            <tr>
              <td>${index + 1}</td>
              <td class="text-start fw-bold">${p.nombre_equipo}</td>
              <td>${p.pj}</td>
              <td>${p.pg}</td>
              <td>${p.pe}</td>
              <td>${p.pp}</td>
              <td>${p.gf}</td>
              <td>${p.gc}</td>
              <td class="fw-bold">${p.dif}</td>
              <td class="fw-bold bg-warning text-dark">${p.pts}</td>
            </tr>`;
        });
    } catch (error) { 
        console.error("Error cargando posiciones:", error);
        const cuerpo = document.querySelector("#tablaPosiciones tbody");
        if (cuerpo) cuerpo.innerHTML = `<tr><td colspan="10" class="text-danger">Error: ${error.message}. Asegura que la función RPC 'get_posiciones_table' existe.</td></tr>`;
    }
}

// ===============================
// 7. LÓGICA CRUD ÚNICA (Modals & Forms)
// ===============================

function prepararCrud(tipo, ...params) {
    const modalLabel = document.getElementById('crudModalLabel');
    const modalBody = document.getElementById('crudModalBody');
    modalBody.innerHTML = '';
    
    if (tipo === 'equipo') {
        const [id, nombre, delegado, telefono, logo] = params;
        modalLabel.textContent = id ? `Editar Equipo: ${nombre}` : 'Agregar Nuevo Equipo';
        modalBody.innerHTML = getEquipoForm(id, nombre, delegado, telefono, logo);
        document.getElementById('equipoForm').addEventListener('submit', handleEquipoSubmit);
    } else if (tipo === 'jugador') {
        const jugador = params[0] || {}; 
        modalLabel.textContent = jugador.id_jugador ? `Editar Jugador: ${jugador.nombres}` : 'Agregar Nuevo Jugador';
        modalBody.innerHTML = getJugadorForm(jugador);
        document.getElementById('jugadorForm').addEventListener('submit', handleJugadorSubmit);
    } else if (tipo === 'usuario') {
        const usuario = params[0] || {};
        modalLabel.textContent = usuario.id ? `Editar Usuario: ${usuario.email}` : 'Crear Nuevo Usuario';
        modalBody.innerHTML = getUsuarioForm(usuario);
        document.getElementById('usuarioForm').addEventListener('submit', handleUsuarioSubmit);
    } else if (tipo === 'resultado') {
        const partido = params[0] || {};
        modalLabel.textContent = `Gestión de Resultado: Jornada ${partido.jornada || 'N/A'}`;
        modalBody.innerHTML = getResultadoForm(partido);
        document.getElementById('resultadoForm').addEventListener('submit', handleResultadoSubmit);
    }

    crudModal.show();
}

// --- FORMULARIOS HTML ---

function getEquipoForm(id = '', nombre = '', delegado = '', telefono = '', logo = '') {
    return `
    <form id="equipoForm">
        <input type="hidden" id="equipo_id" value="${id}">
        <div class="mb-3">
            <label for="nombre_equipo" class="form-label">Nombre</label>
            <input type="text" class="form-control" id="nombre_equipo" value="${nombre}" required>
        </div>
        <div class="mb-3">
            <label for="delegado" class="form-label">Delegado</label>
            <input type="text" class="form-control" id="delegado" value="${delegado}">
        </div>
        <div class="mb-3">
            <label for="telefono" class="form-label">Teléfono</label>
            <input type="text" class="form-control" id="telefono" value="${telefono}">
        </div>
        <div class="mb-3">
            <label for="logo_url" class="form-label">URL del Logo (Opcional)</label>
            <input type="url" class="form-control" id="logo_url" value="${logo}">
        </div>
        <button type="submit" class="btn btn-admin w-100">Guardar Equipo</button>
    </form>`;
}

function getJugadorForm(j = {}) {
    const equipoOptions = teamsCache.map(eq => 
        `<option value="${eq.id_equipo}" ${j.id_equipo == eq.id_equipo ? 'selected' : ''}>${eq.nombre_equipo}</option>`
    ).join('');

    return `
    <form id="jugadorForm">
        <input type="hidden" id="jugador_id" value="${j.id_jugador || ''}">
        <div class="mb-3"><label for="nombres" class="form-label">Nombres</label><input type="text" class="form-control" id="nombres" value="${j.nombres || ''}" required></div>
        <div class="mb-3"><label for="apellidos" class="form-label">Apellidos</label><input type="text" class="form-control" id="apellidos" value="${j.apellidos || ''}" required></div>
        <div class="mb-3">
            <label for="id_equipo_jugador" class="form-label">Equipo</label>
            <select class="form-select" id="id_equipo_jugador" required>
                <option value="">-- Seleccionar Equipo --</option>
                ${equipoOptions}
            </select>
        </div>
        <div class="row">
            <div class="col-6 mb-3"><label for="numero_camiseta" class="form-label"># Camiseta</label><input type="number" class="form-control" id="numero_camiseta" value="${j.numero_camiseta || ''}"></div>
            <div class="col-6 mb-3"><label for="posicion" class="form-label">Posición</label><input type="text" class="form-control" id="posicion" value="${j.posicion || ''}"></div>
        </div>
        <div class="mb-3">
            <label for="estado_jugador" class="form-label">Estado</label>
            <select class="form-select" id="estado_jugador" required>
                <option value="Activo" ${j.estado === 'Activo' ? 'selected' : ''}>Activo</option>
                <option value="Inactivo" ${j.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
            </select>
        </div>
        <button type="submit" class="btn btn-admin w-100">Guardar Jugador</button>
    </form>`;
}

function getUsuarioForm(u = {}) {
    const isEdit = !!u.id;
    return `
    <form id="usuarioForm">
        <input type="hidden" id="usuario_id" value="${u.id || ''}">
        <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" value="${u.email || ''}" ${isEdit ? 'disabled' : ''} required>
            ${isEdit ? '<small class="text-muted">El email no se puede editar.</small>' : ''}
        </div>
        <div class="mb-3 ${isEdit ? 'd-none' : ''}">
            <label for="password" class="form-label">Contraseña</label>
            <input type="password" class="form-control" id="password" ${isEdit ? '' : 'required'} placeholder="${isEdit ? 'Solo para nuevos usuarios' : 'Mínimo 6 caracteres'}">
        </div>
        <div class="mb-3">
            <label for="nombre_completo" class="form-label">Nombre Completo</label>
            <input type="text" class="form-control" id="nombre_completo" value="${u.nombre_completo || ''}">
        </div>
        <div class="mb-3">
            <label for="rol" class="form-label">Rol</label>
            <select class="form-select" id="rol" required>
                <option value="usuario" ${u.rol === 'usuario' ? 'selected' : ''}>Usuario (Web Pública)</option>
                <option value="admin" ${u.rol === 'admin' ? 'selected' : ''}>Administrador (Panel Total)</option>
            </select>
        </div>
        <div class="mb-3">
            <label for="estado_usuario" class="form-label">Estado</label>
            <select class="form-select" id="estado_usuario" required>
                <option value="true" ${u.estado ? 'selected' : ''}>Activo</option>
                <option value="false" ${!u.estado ? 'selected' : ''}>Inactivo</option>
            </select>
        </div>
        <button type="submit" class="btn btn-admin w-100">${isEdit ? 'Actualizar Usuario' : 'Crear Usuario'}</button>
    </form>`;
}

function getResultadoForm(p = {}) {
    const local = teamsCache.find(t => t.id_equipo == p.id_equipo_local)?.nombre_equipo || 'Local';
    const visitante = teamsCache.find(t => t.id_equipo == p.id_equipo_visitante)?.nombre_equipo || 'Visitante';
    
    const golesLocal = p.marcador_local || p.goles_local || 0;
    const golesVisitante = p.marcador_visitante || p.goles_visitante || 0;

    return `
    <form id="resultadoForm">
        <input type="hidden" id="partido_id_resultado" value="${p.id_partido}">
        <h4 class="text-center mb-4">${local} vs ${visitante}</h4>
        
        <div class="row mb-3">
            <div class="col-6">
                <label for="goles_local" class="form-label">${local} (Goles)</label>
                <input type="number" class="form-control" id="goles_local" value="${golesLocal}" min="0" required>
            </div>
            <div class="col-6">
                <label for="goles_visitante" class="form-label">${visitante} (Goles)</label>
                <input type="number" class="form-control" id="goles_visitante" value="${golesVisitante}" min="0" required>
            </div>
        </div>

        <div class="mb-3">
            <label for="estado_partido" class="form-label">Estado del Partido</label>
            <select class="form-select" id="estado_partido" required>
                <option value="Pendiente" ${p.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                <option value="Jugado" ${p.estado === 'Jugado' ? 'selected' : ''}>Finalizado (Actualizar marcador)</option>
                <option value="Aplazado" ${p.estado === 'Aplazado' ? 'selected' : ''}>Aplazado</option>
            </select>
        </div>

        <div class="mb-3">
            <label for="observaciones" class="form-label">Observaciones</label>
            <textarea class="form-control" id="observaciones">${p.observaciones || ''}</textarea>
        </div>

        <button type="submit" class="btn btn-admin w-100">Guardar Resultado y Estado</button>
    </form>`;
}

// --- MANEJADORES DE SUBMIT (Compartidos) ---

async function handleEquipoSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('equipo_id').value;
    const method = id ? 'PATCH' : 'POST'; 
    const url = `${API_BASE}/equipos`;
    
    const equipoData = {
        nombre_equipo: document.getElementById('nombre_equipo').value,
        delegado: document.getElementById('delegado').value,
        telefono: document.getElementById('telefono').value,
        logo_url: document.getElementById('logo_url').value,
    };

    await crudOperation(url, method, equipoData, `id_equipo=eq.${id}`, cargarEquipos);
}

async function handleJugadorSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('jugador_id').value;
    const method = id ? 'PATCH' : 'POST'; 
    const url = `${API_BASE}/jugadores`;
    
    const jugadorData = {
        id_equipo: document.getElementById('id_equipo_jugador').value || null,
        nombres: document.getElementById('nombres').value,
        apellidos: document.getElementById('apellidos').value,
        numero_camiseta: document.getElementById('numero_camiseta').value || null,
        posicion: document.getElementById('posicion').value,
        estado: document.getElementById('estado_jugador').value,
    };
    
    await crudOperation(url, method, jugadorData, `id_jugador=eq.${id}`, () => cargarJugadores());
}

async function handleUsuarioSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('usuario_id').value;
    const method = id ? 'PATCH' : 'POST';
    const url = `${API_BASE}/usuarios`;
    
    const isEdit = !!id;

    const usuarioData = {
        nombre_completo: document.getElementById('nombre_completo').value,
        rol: document.getElementById('rol').value,
        estado: document.getElementById('estado_usuario').value === 'true',
    };

    if (!isEdit) {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
            });

            if (authError) throw authError;

            await crudOperation(url, 'POST', {
                id: authData.user.id,
                email: email,
                nombre_completo: usuarioData.nombre_completo,
                rol: usuarioData.rol,
                estado: usuarioData.estado
            }, null, cargarUsuarios);
            
            alert('Usuario creado y registrado en la base de datos.');
            crudModal.hide();
            return;

        } catch (error) {
            console.error("Error al crear usuario:", error);
            alert(`Error: ${error.message}`);
            return;
        }
    }
    
    await crudOperation(url, 'PATCH', usuarioData, `id=eq.${id}`, cargarUsuarios);
}

async function handleResultadoSubmit(e) {
    e.preventDefault();
    const id_partido = document.getElementById('partido_id_resultado').value;
    const url = `${API_BASE}/partidos`; 
    
    const resultadoData = {
        marcador_local: parseInt(document.getElementById('goles_local').value),
        marcador_visitante: parseInt(document.getElementById('goles_visitante').value),
        estado: document.getElementById('estado_partido').value,
        observaciones: document.getElementById('observaciones').value,
    };

    await crudOperation(url, 'PATCH', resultadoData, `id_partido=eq.${id_partido}`, cargarPartidos);
}

// --- FUNCIÓN CRUD GENÉRICA (Base) ---

async function crudOperation(url, method, data, filter, successCallback) {
    try {
        const headers = { 
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY, 
            'Authorization': `Bearer ${USER_TOKEN}`,
            'Prefer': 'return=representation' 
        };
        
        let finalUrl = url;

        if (method === 'PATCH' || method === 'DELETE') {
            if (!filter) throw new Error("Se requiere un filtro (WHERE) para PATCH y DELETE.");
            finalUrl += `?${filter}`; 
        }
        
        const res = await fetch(finalUrl, {
            method: method,
            headers: headers,
            body: (method === 'POST' || method === 'PATCH') ? JSON.stringify(data) : null
        });

        if (!res.ok) {
            const errorDetails = await res.json();
            console.error("Detalles del Error:", errorDetails);
            throw new Error(`Error: ${errorDetails.message || 'Error desconocido'}. Revisa los permisos (RLS).`);
        }

        alert(`${method === 'POST' ? 'Creado' : 'Actualizado'} correctamente.`);
        if (crudModal._isShown) crudModal.hide();
        successCallback();
        return res;

    } catch (error) {
        console.error("Error CRUD:", error);
        alert(`Hubo un error al guardar: ${error.message}`);
        return null;
    }
}

// --- FUNCIÓN ELIMINAR GENÉRICA (Base) ---

window.eliminarEntidad = async (entidad, id, nombre) => {
    if (!confirm(`¿Estás seguro de eliminar "${nombre}" de ${entidad}? Esta acción es irreversible y podría causar errores de referencia.`)) {
        return;
    }

    const filter = entidad === 'usuarios' ? `id=eq.${id}` : `id_${entidad.slice(0, -1)}=eq.${id}`;
    const url = `${API_BASE}/${entidad}`;

    try {
        const res = await crudOperation(url, 'DELETE', null, filter, () => {
             alert(`"${nombre}" eliminado correctamente.`);
        });

        if (res) {
            if (currentView === entidad) {
                if (entidad === 'equipos') cargarEquipos();
                if (entidad === 'jugadores') cargarJugadores();
                if (entidad === 'usuarios') cargarUsuarios();
            }
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert(`No se pudo eliminar: ${error.message}`);
    }
};

// =================================================================
// FIN DE ARCHIVO administracion.js
// =================================================================