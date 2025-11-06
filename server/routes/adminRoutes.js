import express from 'express';
import jugadoresController from '../controllers/jugadoresController.js';
// Agrega aquí tu middleware si lo tienes

const router = express.Router();

// CRUD Jugadores
router.get('/jugadores', jugadoresController.listarTodos);
router.get('/jugadores/:id', jugadoresController.obtenerUno);
router.post('/jugadores', jugadoresController.crear);
router.put('/jugadores/:id', jugadoresController.actualizar);
router.delete('/jugadores/:id', jugadoresController.eliminar);

export default router;
