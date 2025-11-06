// server/server.js

import express from "express";
import cors from "cors";
import pkg from "pg";

// Importa routers de tus archivos (ES Modules)
import loginRoutes from "./routes/loginRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const { Pool } = pkg;
const app = express();

app.use(cors());
app.use(express.json());

// Configuración de PostgreSQL
const pool = new Pool({
  host: "localhost",
  database: "TorneoJuvenil",
  user: "postgres",
  password: "241206",
  port: 5432
});

// ENDPOINTS DIRECTOS DE TU API (las vistas)
app.get("/api/posiciones", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM vista_posiciones
      ORDER BY puntos DESC, diferencia_goles DESC, goles_favor DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener posiciones:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/partidos", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM vista_resultados
      ORDER BY jornada, fecha, hora;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener partidos:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/goleadores", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM vista_goleadores
      ORDER BY goles DESC, jugador ASC;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener goleadores:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/equipos", async (req, res) => {
  try {
    const result = await pool.query("SELECT id_equipo, nombre_equipo FROM equipos ORDER BY nombre_equipo ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener equipos:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/jugadores", async (req, res) => {
  const { filtro, valor, id_equipo } = req.query;
  try {
    let where = [];
    let params = [];
    let idx = 1;
    const allowed = [
      "id_jugador", "nombres", "apellidos", "tipo_id", "numero_id", "numero_camiseta", "posicion", "estado"
    ];
    if (filtro && valor && allowed.includes(filtro)) {
      where.push(`jugadores.${filtro} ILIKE $${idx++}`);
      params.push(`%${valor}%`);
    }
    if (id_equipo) {
      where.push(`jugadores.id_equipo = $${idx++}`);
      params.push(id_equipo);
    }
    const whereStr = where.length ? "WHERE " + where.join(" AND ") : "";
    const query = `
      SELECT jugadores.*, equipos.nombre_equipo as equipo_nombre
      FROM jugadores
      LEFT JOIN equipos ON jugadores.id_equipo = equipos.id_equipo
      ${whereStr}
      ORDER BY jugadores.id_jugador ASC
    `;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener jugadores:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// INCORPORA RUTAS MVC
app.use('/api', loginRoutes);
app.use('/api', adminRoutes);  // /api/jugadores, /api/equipos... protegidas si quieres

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor Node.js corriendo en http://localhost:${PORT}`);
});
