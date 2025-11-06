import pool from '../db.js';

export const obtenerTodos = async () => {
  const result = await pool.query('SELECT * FROM jugadores');
  return result.rows;
};

export const obtenerPorId = async (id) => {
  const result = await pool.query('SELECT * FROM jugadores WHERE id_jugador = $1', [id]);
  return result.rows[0];
};

export const crear = async (data) => {
  const { id_equipo, nombres, apellidos, tipo_id, numero_id, numero_camiseta, posicion, estado } = data;
  const result = await pool.query(
    `INSERT INTO jugadores 
    (id_equipo, nombres, apellidos, tipo_id, numero_id, numero_camiseta, posicion, estado)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [id_equipo, nombres, apellidos, tipo_id, numero_id, numero_camiseta, posicion, estado]
  );
  return result.rows[0];
};

export const actualizar = async (id, data) => {
  const { id_equipo, nombres, apellidos, tipo_id, numero_id, numero_camiseta, posicion, estado } = data;
  const result = await pool.query(
    `UPDATE jugadores SET 
      id_equipo = $1, 
      nombres = $2, 
      apellidos = $3,
      tipo_id = $4,
      numero_id = $5,
      numero_camiseta = $6,
      posicion = $7,
      estado = $8
    WHERE id_jugador = $9
    RETURNING *`,
    [id_equipo, nombres, apellidos, tipo_id, numero_id, numero_camiseta, posicion, estado, id]
  );
  return result.rows[0];
};

export const eliminar = async (id) => {
  const result = await pool.query('DELETE FROM jugadores WHERE id_jugador = $1 RETURNING *', [id]);
  return result.rowCount > 0;
};
