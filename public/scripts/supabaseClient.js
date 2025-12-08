// Supabase Client para uso en el navegador - Basado en Diba FBC
// Carga única del cliente en navegador
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 🚨 REEMPLACE ESTOS con las credenciales del PROYECTO JUVENIL (wdnlqfiwuocmmcdowjyw NO es el juvenil)
const SUPABASE_URL = 'https://cwlvpzossqmpuzdpjrsh.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go';

// El cliente exportado para que los otros scripts lo usen.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// Función de ejemplo (opcional, si necesita validación en el front-end)
export async function requireAdmin() {
  // NOTA: Asegúrese de que la tabla 'v_profiles' o 'usuarios' exista en el proyecto juvenil.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = '/login.html';
    return;
  }
  // Su lógica de validación de rol...
}