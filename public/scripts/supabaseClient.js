// scripts/supabaseClient.js

// 1. Importación directa de la función createClient desde el CDN (para módulos)
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// 🚨 CREDENCIALES - REEMPLACE SI ES NECESARIO 🚨
const SUPABASE_URL = "https://cwlvpzossqmpuzdpjrsh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go";

let supabase = null; // Inicializamos a null

try {
    console.log("DEBUG: Intentando inicializar el cliente Supabase...");
    
    // 2. Verificación de seguridad antes de llamar a createClient
    if (typeof createClient === 'function') {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("DEBUG: Cliente Supabase creado exitosamente (objeto NO nulo).");
    } else {
        console.error("DEBUG CRÍTICO: La función createClient NO está definida después de la importación.");
    }
} catch (error) {
    // 3. Captura cualquier error que ocurra durante la creación del cliente
    console.error("DEBUG CRÍTICO: Error en createClient:", error);
}

// 4. Exportar el cliente (incluso si es null)
export { supabase };