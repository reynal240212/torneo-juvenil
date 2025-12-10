// Archivo: public/scripts/partidosPage.js

// Usar Supabase global desde CDN UMD
if (!window.supabase) {
  console.error(
    "Supabase no está disponible. Verifica que el script CDN se cargue antes de partidosPage.js"
  );
} else {
  const { createClient } = window.supabase;

  // Configuración del proyecto
  const SUPABASE_URL = "https://cwlvpzossqmpuzdpjrsh.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go";

  // Cliente único reutilizable en esta página
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // -------------------------------------------------------------

  const partidosListEl = document.getElementById("partidosList");
  const filtroFechaEl = document.getElementById("filtroFecha");
  const filtroMesEl = document.getElementById("filtroMes");
  const filtroAnioEl = document.getElementById("filtroAnio");
  const btnBuscarFecha = document.getElementById("btnBuscarFecha");
  const eventosModal = document.getElementById("eventosModal");
  let partidosData = []; // Caché para guardar los datos de los partidos

  function iconoEvento(tipo) {
    const tipoNormalizado = tipo ? tipo.toUpperCase() : "";
    if (tipoNormalizado.includes("GOL"))
      return '<i class="fa-solid fa-futbol text-warning"></i>';
    if (
      tipoNormalizado.includes("T.A") ||
      tipoNormalizado.includes("T_A") ||
      tipoNormalizado.includes("AMARILLA")
    )
      return '<i class="fa-solid fa-square text-warning"></i>';
    if (
      tipoNormalizado.includes("T.R") ||
      tipoNormalizado.includes("T_R") ||
      tipoNormalizado.includes("ROJA")
    )
      return '<i class="fa-solid fa-square text-danger"></i>';
    if (
      tipoNormalizado.includes("T.AZ") ||
      tipoNormalizado.includes("T_AZ") ||
      tipoNormalizado.includes("AZUL")
    )
      return '<i class="fa-solid fa-square text-info"></i>';
    return '<i class="fa-solid fa-flag"></i>';
  }

  function partidoCardTemplate(p) {
    const hora = p.hora?.substring(0, 5) ?? "--:--";
    const fechaFormato = p.fecha
      ? new Date(p.fecha + "T00:00:00").toLocaleDateString("es-CO", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Fecha no definida";
    const equipoLocal = p.equipo_local_nombre || "Equipo Local";
    const equipoVisitante = p.equipo_visitante_nombre || "Equipo Visitante";
    const estado = p.estado || "Desconocido";
    const marcadorHtml =
      p.goles_local !== null && p.goles_visitante !== null
        ? `<div class="marcador"><span>${p.goles_local}</span> - <span>${p.goles_visitante}</span></div>`
        : `<div class="vs">VS</div>`;
    const estadoClase = (estado || "")
      .trim()
      .replace(/\s+/g, "-")
      .toUpperCase();

    return `
      <li id="partido-${p.id_partido}" class="partido-card">
        <div class="partido-grid">
          <div class="equipo local">
            <div class="equipo-nombre"><i class="fa-solid fa-shirt"></i> <span>${equipoLocal}</span></div>
          </div>
          ${marcadorHtml}
          <div class="equipo visitante">
            <div class="equipo-nombre"><span>${equipoVisitante}</span> <i class="fa-solid fa-shirt"></i></div>
          </div>
        </div>
        <div class="partido-info">
          <span><i class="fa-regular fa-calendar-alt"></i> ${fechaFormato}</span>
          <span><i class="fa-regular fa-clock"></i> ${hora}</span>
          <span class="estado-badge estado-${estadoClase}">${estado}</span>
          <button class="btn-eventos" data-bs-toggle="modal" data-bs-target="#eventosModal" data-partido-id="${
            p.id_partido
          }">
            <i class="fa-solid fa-list-ol"></i> Eventos
          </button>
        </div>
      </li>
    `;
  }

  // Lógica del modal
  if (eventosModal) {
    eventosModal.addEventListener("show.bs.modal", (event) => {
      const button = event.relatedTarget;
      const modalBody = document.getElementById("modal-body-content");
      if (!button || !modalBody) return;

      modalBody.innerHTML = `<p class="text-center p-4">Cargando eventos...</p>`;

      const partidoId = parseInt(button.getAttribute("data-partido-id"), 10);
      const partido = partidosData.find((p) => p.id_partido === partidoId);

      if (!partido || !partido.eventos_json || partido.eventos_json.length === 0) {
        modalBody.innerHTML = `<p class="text-center p-4">No hay eventos registrados para este partido.</p>`;
        return;
      }

      const eventosLocal = partido.eventos_json.filter(
        (e) => e.jugador_equipo_id === partido.id_equipo_local
      );
      const eventosVisitante = partido.eventos_json.filter(
        (e) => e.jugador_equipo_id === partido.id_equipo_visitante
      );

      const generarHtmlColumna = (eventos) => {
        eventos.sort((a, b) => (a.minuto || 999) - (b.minuto || 999));
        if (eventos.length === 0) return "<li>No hay eventos.</li>";
        return eventos
          .map((e) => {
            const nombreCompleto = `${e.jugador_nombres || ""} ${
              e.jugador_apellidos || ""
            }`.trim();
            const minuto = e.minuto ? `${e.minuto}'` : "";
            return `<li><span class="icono">${iconoEvento(
              e.tipo_evento
            )}</span> ${nombreCompleto} ${minuto}</li>`;
          })
          .join("");
      };

      modalBody.innerHTML = `
        <div class="modal-eventos-grid">
          <div class="modal-eventos-column">
            <div class="modal-eventos-header">${partido.equipo_local_nombre}</div>
            <ul class="modal-eventos-list">${generarHtmlColumna(eventosLocal)}</ul>
          </div>
          <div class="modal-eventos-column">
            <div class="modal-eventos-header">${partido.equipo_visitante_nombre}</div>
            <ul class="modal-eventos-list">${generarHtmlColumna(eventosVisitante)}</ul>
          </div>
        </div>
      `;
    });
  }

  async function renderPartidos(partidos) {
    if (!partidosListEl) return;
    if (!partidos || partidos.length === 0) {
      partidosListEl.innerHTML = `<div class="d-flex justify-content-center align-items-center p-5"><p class="lead">No hay partidos para esta fecha.</p></div>`;
      return;
    }
    partidosListEl.innerHTML = partidos.map(partidoCardTemplate).join("");
  }

  async function cargarPartidosPorFecha(fechaISO) {
    if (!partidosListEl) return;

    partidosListEl.innerHTML = `
      <div class="d-flex justify-content-center align-items-center p-5">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>`;

    const desde = `${fechaISO}T00:00:00.000Z`;
    const hasta = `${fechaISO}T23:59:59.999Z`;

    try {
      const { data, error } = await supabase
        .from("vista_partidos_completa")
        .select("*")
        .gte("fecha", desde)
        .lte("fecha", hasta)
        .order("hora", { ascending: true });

      if (error) throw error;

      partidosData = data || [];
      await renderPartidos(partidosData);
    } catch (error) {
      console.error("Error al cargar partidos:", error);
      partidosListEl.innerHTML = `<div class="d-flex justify-content-center align-items-center p-5"><p class="lead text-danger">Error al cargar. ${
        error.message || "Revise la conexión a Supabase y las políticas RLS."
      }</p></div>`;
    }
  }

  // Auxiliar fecha local ISO
  const getLocalISODate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Inicialización
  document.addEventListener("DOMContentLoaded", async () => {
    const hoy = new Date();
    const hoyISO = getLocalISODate(hoy);

    // Setear valores iniciales de filtros
    if (filtroFechaEl) filtroFechaEl.value = hoyISO;
    if (filtroMesEl) filtroMesEl.value = String(hoy.getMonth());
    if (filtroAnioEl) filtroAnioEl.value = String(hoy.getFullYear());

    await cargarPartidosPorFecha(hoyISO);

    if (btnBuscarFecha && filtroFechaEl) {
      btnBuscarFecha.addEventListener("click", async () => {
        let fechaSeleccionada = filtroFechaEl.value; // yyyy-mm-dd

        // Si no hay fecha pero sí mes/año, usar primer día del mes
        if (!fechaSeleccionada && filtroMesEl && filtroAnioEl) {
          const mes = filtroMesEl.value;
          const anio = filtroAnioEl.value;
          if (mes !== "" && anio) {
            fechaSeleccionada = `${anio}-${String(
              Number(mes) + 1
            ).padStart(2, "0")}-01`;
            filtroFechaEl.value = fechaSeleccionada;
          }
        }

        if (!fechaSeleccionada) return;
        await cargarPartidosPorFecha(fechaSeleccionada);
      });
    }

    // Carga de layouts
    Promise.all([
      fetch("layout/navbar.html")
        .then((r) => r.text())
        .then((h) => {
          const navPlaceholder = document.getElementById("nav-placeholder");
          if (navPlaceholder) navPlaceholder.innerHTML = h;
        }),
      fetch("layout/hero.html")
        .then((r) => r.text())
        .then((h) => {
          const heroPlaceholder = document.getElementById("hero-placeholder");
          if (heroPlaceholder) heroPlaceholder.innerHTML = h;
        }),
      fetch("layout/footer.html")
        .then((r) => r.text())
        .then((h) => {
          const footerPlaceholder = document.getElementById("footer-placeholder");
          if (footerPlaceholder) footerPlaceholder.innerHTML = h;
        }),
    ]).catch(console.error);
  });
}
