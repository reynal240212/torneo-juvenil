import pool from '../db.js';

const obtenerPorUsuario = async (usuario) => {
  const result = await pool.query(
    'SELECT * FROM usuarios WHERE usuario = $1',
    [usuario]
  );
  return result.rows[0];
};

export default {
  obtenerPorUsuario
};
