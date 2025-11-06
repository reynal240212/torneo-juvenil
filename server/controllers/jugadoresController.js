import * as jugadoresModel from '../models/jugadoresModel.js';

const listarTodos = async (req, res) => {
  try {
    const jugadores = await jugadoresModel.obtenerTodos();
    res.json(jugadores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerUno = async (req, res) => {
  try {
    const jugador = await jugadoresModel.obtenerPorId(req.params.id);
    if (!jugador) {
      return res.status(404).json({ error: "Jugador no encontrado" });
    }
    res.json(jugador);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crear = async (req, res) => {
  try {
    const nuevoJugador = await jugadoresModel.crear(req.body);
    res.status(201).json(nuevoJugador);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const jugadorActualizado = await jugadoresModel.actualizar(req.params.id, req.body);
    if (!jugadorActualizado) {
      return res.status(404).json({ error: "Jugador no encontrado" });
    }
    res.json(jugadorActualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const eliminado = await jugadoresModel.eliminar(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ error: "Jugador no encontrado" });
    }
    res.json({ message: "Jugador eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  listarTodos,
  obtenerUno,
  crear,
  actualizar,
  eliminar
};
