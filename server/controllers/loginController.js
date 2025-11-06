import usuariosModel from '../models/usuariosModel.js';

const login = async (req, res) => {
  const { usuario, password } = req.body;
  try {
    // Busca usuario en la base de datos
    const user = await usuariosModel.obtenerPorUsuario(usuario);
    if (!user) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }
    // Aquí podrías usar bcrypt para comparar la password, si la almacenaste con hash
    const esValido = password === user.password_hash; // Solo ejemplo, usa bcrypt realmente
    if (!esValido) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }
    // Devuelve usuario sin el hash
    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, message: "Login exitoso" });
  } catch (error) {
    res.status(500).json({ error: "Error en login: " + error.message });
  }
};

export default {
  login
};
