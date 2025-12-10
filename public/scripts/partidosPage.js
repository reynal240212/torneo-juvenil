// public/scripts/partidosPage.js

if (!window.supabase) {
  console.error("Supabase no está disponible. Revisa el script CDN.");
} else {
  const { createClient } = window.supabase;

  const SUPABASE_URL = "https://cwlvpzossqmpuzdpjrsh.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go";

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const navFechasEl = document.getElementById("navFechas");
  const partidosListEl = document.getElementById("partidosList");
  const filtroFechaEl = document.getElementById("filtroFecha");
  const filtroEquipoEl = document.getElementById("filtroEquipo");
  const btnBuscar = document.getElementById("btnBuscar");
  const eventosModal = document.getElementById("eventosModal");

  let partidosData = [];

  const getLocalISODate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const obtenerFechasTabs = (base = new Date()) => {
    const fechas = [];
    for (let i = -4; i <= 4; i++) {
      const f = new Date(base);
      f.setDate(base.getDate() + i);
      fechas.push(f);
    }
    return fechas.map((f) => ({
      label: f
        .toLocaleDateString("es-CO", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        })
        .replace(".", ""),
      value: getLocalISODate(f),
    }));
  };

  const renderTabsFechas = (fechasArr, fechaActiva) => {
    if (!navFechasEl) return;
    navFechasEl.innerHTML = fechasArr
      .map(
        (f) => `
        <button class="nav-fecha-btn${
          f.value === fechaActiva ? " active" : ""
        }" data-fecha="${f.value}">
          ${f.label}
        </button>`
      )
      .join("");
  };

  function iconoEvento(tipo) {
    const t = tipo ? tipo.toUpperCase() : "";
    if (t.includes("GOL")) return '<i class="fa-solid fa-futbol text-warning"></i>';
    if (t.includes("T.A") || t.includes("T_A") || t.includes("AMARILLA"))
      return '<i class="fa-solid fa-square text-warning"></i>';
    if (t.includes("T.R") || t.includes("T_R") || t.includes("ROJA"))
      return '<i class="fa-solid fa-square text-danger"></i>';
    if (t.includes("T.AZ") || t.includes("T_AZ") || t.includes("AZUL"))
      return '<i class="fa-solid fa-square text-info"></i>';
    return '<i class="fa-solid fa-flag text-slate-300"></i>';
  }

  function partidoCardTemplate(p) {
    const hora = p.hora?.substring(0, 5) ?? "--:--";
    const fechaFormato = p.fecha
      ? new Date(p.fecha).toLocaleDateString("es-CO", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Fecha no definida";
    const equipoLocal = p.equipo_local_nombre || "Equipo Local";
    const equipoVisitante = p.equipo_visitante_nombre || "Equipo Visitante";
    const estado = p.estado || "Programado";
    const marcadorHtml =
      p.goles_local !== null && p.goles_visitante !== null
        ? `<div class="marcador"><span>${p.goles_local}</span> - <span>${p.goles_visitante}</span></div>`
        : `<div class="vs">VS</div>`;
    const estadoClase = (estado || "").trim().replace(/\s+/g, "-").toUpperCase();
    const cancha = p.cancha || "Cancha principal";

    return `
      <li id="partido-${p.id_partido}" class="partido-card">
        <div class="partido-grid">
          <div class="equipo local">
            <div class="equipo-nombre">
              <i class="fa-solid fa-shirt text-info"></i>
              <span>${equipoLocal}</span>
            </div>
          </div>
          ${marcadorHtml}
          <div class="equipo visitante">
            <div class="equipo-nombre">
              <span>${equipoVisitante}</span>
              <i class="fa-solid fa-shirt text-danger"></i>
            </div>
          </div>
        </div>
        <div class="partido-info">
          <div class="d-flex flex-column flex-sm-row gap-2 align-items-sm-center">
            <span><i class="fa-regular fa-calendar-alt me-1"></i> ${fechaFormato}</span>
            <span><i class="fa-regular fa-clock me-1"></i> ${hora}</span>
            <span class="pill-cancha"><i class="fa-solid fa-location-dot me-1"></i>${cancha}</span>
          </div>
          <div class="d-flex align-items-center gap-2 ms-sm-auto">
            <span class="estado-badge estado-${estadoClase}">${estado}</span>
            <button class="btn-eventos" data-bs-toggle="modal" data-bs-target="#eventosModal" data-partido-id="${
              p.id_partido
            }">
              <i class="fa-solid fa-list-ol me-1"></i>Eventos
            </button>
          </div>
        </div>
      </li>
    `;
  }

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
            return `<li>
              <span class="icono">${iconoEvento(e.tipo_evento)}</span>
              <span>${nombreCompleto}</span>
              <span class="modal-eventos-minuto">${minuto}</span>
            </li>`;
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
      partidosListEl.innerHTML = `
        <div class="empty-state">
          <i class="fa-regular fa-futbol"></i>
          <p class="mt-2 mb-0">No se encontraron partidos para los filtros seleccionados.</p>
        </div>`;
      return;
    }
    partidosListEl.innerHTML = partidos.map(partidoCardTemplate).join("");
  }

  async function cargarPartidos(fechaISO, nombreEquipo) {
    if (!partidosListEl) return;

    partidosListEl.innerHTML = `
      <div class="d-flex justify-content-center align-items-center p-5">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>`;

    const desde = fechaISO ? `${fechaISO}T00:00:00.000Z` : null;
    const hasta = fechaISO ? `${fechaISO}T23:59:59.999Z` : null;

    try {
      let query = supabase
        .from("vista_partidos_completa")
        .select("*")
        .order("fecha", { ascending: true })
        .order("hora", { ascending: true });

      if (desde && hasta) {
        query = query.gte("fecha", desde).lte("fecha", hasta);
      }

      const nombreNormalizado = nombreEquipo?.trim();
      if (nombreNormalizado) {
        query = query.or(
          `equipo_local_nombre.ilike.%${nombreNormalizado}%,equipo_visitante_nombre.ilike.%${nombreNormalizado}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      partidosData = data || [];
      await renderPartidos(partidosData);
    } catch (error) {
      console.error("Error al cargar partidos:", error);
      partidosListEl.innerHTML = `<div class="empty-state"><p class="text-danger mb-0">Error al cargar los partidos.</p></div>`;
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const hoy = new Date();
    const hoyISO = getLocalISODate(hoy);

    if (filtroFechaEl) filtroFechaEl.value = hoyISO;

    const tabs = obtenerFechasTabs(hoy);
    renderTabsFechas(tabs, hoyISO);

    await cargarPartidos(hoyISO, "");

    if (navFechasEl) {
      navFechasEl.addEventListener("click", async (e) => {
        const btn = e.target.closest(".nav-fecha-btn");
        if (!btn) return;
        const nuevaFecha = btn.getAttribute("data-fecha");
        document.querySelector(".nav-fecha-btn.active")?.classList.remove("active");
        btn.classList.add("active");
        if (filtroFechaEl) filtroFechaEl.value = nuevaFecha;
        await cargarPartidos(nuevaFecha, filtroEquipoEl?.value || "");
      });
    }

    if (btnBuscar) {
      btnBuscar.addEventListener("click", async () => {
        const fecha = filtroFechaEl?.value || null;
        const equipo = filtroEquipoEl?.value || "";
        await cargarPartidos(fecha, equipo);
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
