import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.PG_HOST || "localhost",
  port: process.env.PG_PORT || 5432,
  user: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD || "241206",
  database: process.env.PG_DATABASE || "TorneoJuvenil",
  ssl:
    process.env.RENDER === "true" || process.env.PG_SSL === "true"
      ? { rejectUnauthorized: false }
      : false,
});

export default pool;

// 🔍 Prueba de conexión
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Conectado a PostgreSQL:", process.env.PG_DATABASE);
    client.release();
  } catch (err) {
    console.error("❌ Error al conectar:", err.message);
  }
})();
