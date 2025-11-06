import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://cwlvpzossqmpuzdpjrsh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go";
const supabase = createClient(supabaseUrl, supabaseKey);

const topGoleadoresEl = document.getElementById('topGoleadores');
const tablaGoleadoresEl = document.getElementById('tablaGoleadores');

// --- FUNCIONES DE RENDERIZADO ---

const renderTopGoleadoresSkeleton = () => {
  const skeletonHTML = `
    <div class="col-lg-4 col-md-6 mb-4"><div class="skeleton skeleton-card"></div></div>
    <div class="col-lg-4 col-md-6 mb-4"><div class="skeleton skeleton-card"></div></div>
    <div class="col-lg-4 col-md-6 mb-4"><div class="skeleton skeleton-card"></div></div>
  `;
  topGoleadoresEl.innerHTML = skeletonHTML;
};

const renderTablaSkeleton = () => {
  let skeletonHTML = '';
  for (let i = 0; i < 10; i++) {
    skeletonHTML += `
      <tr class="skeleton-row">
        <td><div class="skeleton"></div></td>
        <td><div class="skeleton"></div></td>
        <td><div class="skeleton"></div></td>
        <td><div class="skeleton"></div></td>
      </tr>
    `;
  }
  tablaGoleadoresEl.innerHTML = skeletonHTML;
};

const renderTopGoleadores = (goleadores) => {
  if (!goleadores || goleadores.length === 0) {
    topGoleadoresEl.innerHTML = ''; // Ocultar si no hay goleadores
    return;
  }
  const top3 = goleadores.slice(0, 3);
  const clasesCss = ['oro', 'plata', 'bronce'];
  
  const top3HTML = top3.map((g, idx) => `
    <div class="col-lg-4 col-md-6 mb-4">
      <div class="top-goleador-card top-goleador-${clasesCss[idx]}">
        <div class="posicion">${['🥇','🥈','🥉'][idx]}</div>
        <div class="nombre mt-2">${g.jugador}</div>
        <div class="equipo">${g.equipo}</div>
        <div class="goles-numero">${g.goles}</div>
        <div class="goles-texto">Goles</div>
      </div>
    </div>
  `).join('');

  topGoleadoresEl.innerHTML = top3HTML;
};

const renderTablaGoleadores = (goleadores) => {
  if (!goleadores || goleadores.length === 0) {
    tablaGoleadoresEl.innerHTML = `<tr><td colspan="4" class="text-center py-5">Aún no hay datos de goleadores.</td></tr>`;
    return;
  }
  
  const tablaHTML = goleadores.map((g, idx) => `
    <tr>
      <td class="posicion-col">${idx + 1}</td>
      <td style="text-align: left;">${g.jugador}</td>
      <td>${g.equipo}</td>
      <td class="goles-col">${g.goles}</td>
    </tr>
  `).join('');

  tablaGoleadoresEl.innerHTML = tablaHTML;
};

const renderError = (message) => {
    topGoleadoresEl.innerHTML = '';
    tablaGoleadoresEl.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-5">${message}</td></tr>`;
};

// --- LÓGICA DE DATOS ---

async function cargarGoleadores() {
  const { data, error } = await supabase
    .from("vista_goleadores")
    .select("jugador, equipo, goles")
    .order("goles", { ascending: false })
    .limit(50); // Limitar a los 50 mejores para mejorar rendimiento

  if (error) {
    console.error("Error al cargar goleadores:", error);
    renderError("No se pudieron cargar los datos. Inténtelo más tarde.");
    return;
  }

  renderTopGoleadores(data);
  renderTablaGoleadores(data);
}

function suscribirseACambios() {
  // Escucha cualquier cambio en la tabla de goles.
  // Al ocurrir un cambio, simplemente se vuelve a cargar todo.
  const channel = supabase.channel('goleadores_changes')
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'goles' }, 
        (payload) => {
            console.log('Cambio en la tabla de goles detectado, actualizando goleadores...');
            cargarGoleadores();
        }
    )
    .subscribe();
}

// --- INICIALIZACIÓN ---

function init() {
  renderTopGoleadoresSkeleton();
  renderTablaSkeleton();
  cargarGoleadores();
  suscribirseACambios();
}

document.addEventListener("DOMContentLoaded", init);