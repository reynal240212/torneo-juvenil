// Archivo: public/scripts/supabaseClient.js (Versión Definitiva)

// NO hay "import { createClient }" aquí, confiamos en el CDN.

const SUPABASE_URL = "https://cwlvpzossqmpuzdpjrsh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go";

// Función que devuelve una promesa que se resuelve con el cliente Supabase
export const getSupabaseClient = () => {
    return new Promise((resolve, reject) => {
        // Verificar si el objeto global ya existe
        if (window.supabase) {
            resolve(window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY));
        } else {
            // Si no está, esperar a que el DOM cargue y verificar de nuevo (seguro)
            document.addEventListener('DOMContentLoaded', () => {
                if (window.supabase) {
                    resolve(window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY));
                } else {
                    reject(new Error("Supabase CDN no cargó correctamente antes de la inicialización."));
                }
            });
            // NOTA: Esto no es perfecto, pero es lo más robusto en un entorno simple.
        }
    });
};

// Exportamos las constantes que no dependen de la inicialización
export const API_BASE = SUPABASE_URL + "/rest/v1"; 
export const SUPABASE_KEY_EXPORT = SUPABASE_KEY;