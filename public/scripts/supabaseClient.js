// Archivo: public/scripts/supabaseClient.js

// CORRECCIÓN CLAVE: Eliminar la importación del CDN. 
// Ahora 'createClient' estará disponible globalmente después de cargarse en el HTML.

const SUPABASE_URL = "https://cwlvpzossqmpuzdpjrsh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go";

// Inicializar y exportar la instancia de Supabase usando el createClient global
// La función 'createClient' es expuesta globalmente por el script tag que agregamos en el HTML.
export const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Exportar la URL base de la API REST para las llamadas de administración
export const API_BASE = SUPABASE_URL + "/rest/v1";