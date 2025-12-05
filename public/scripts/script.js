// Archivo: public/scripts/script.js

// Importar las funciones de carga desde los archivos refactorizados
import { cargarPartidos } from "../scripts/calendario.js";
import { cargarPosiciones } from "../scripts/posiciones.js";

// Este script es el coordinador principal para index.html

function initIndex() {
  // 1. Cargar la tabla de posiciones (desde posiciones.js)
  cargarPosiciones();
  
  // 2. Cargar la tabla de partidos (desde calendario.js)
  // Aunque calendario.js tiene su propio listener, lo llamamos aquí para 
  // asegurar el orden y la dependencia si fuera necesario, o para usar una 
  // versión filtrada/limitada. Para el index.html, llamamos la función completa.
  cargarPartidos(); 
}

// Ejecutar las funciones al cargar el DOM
document.addEventListener("DOMContentLoaded", initIndex);