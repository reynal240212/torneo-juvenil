// ===============================
// CONFIGURACIÓN DE SUPABASE
// ===============================
const SUPABASE_URL = "https://cwlvpzossqmpuzdpjrsh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go";

let supabaseClient = null;

// ===============================
// FUNCIONES DE UTILIDAD
// ===============================

// Verifica si la cadena tiene formato de email
function isEmail(str) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
}


// ===============================
// INICIAR AL CARGAR
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  // Opcional: Si ya hay sesión guardada y no ha expirado, redirigir directamente
  if (localStorage.getItem("email_admin") && localStorage.getItem("rol")) {
    window.location.href = "administracion.html";
    return;
  }
  
  initializeSupabase();
  attachFormListener();
});

// ===============================
// Inicializar Supabase
// ===============================
function initializeSupabase() {
  try {
    // La variable window.supabase es accesible porque la cargaste en el HTML
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("✅ Supabase inicializado correctamente");
  } catch (error) {
    console.error("❌ Error inicializando Supabase:", error);
    alert("Error interno. Refresca la página.");
  }
}

// ===============================
// Listener del formulario
// ===============================
function attachFormListener() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
}

// ===============================
// LOGIN PRINCIPAL (POR EMAIL O USUARIO)
// ===============================
async function handleLogin(e) {
  e.preventDefault();

  // El campo de entrada en el HTML tiene el ID "usuario", que puede ser email o nombre de usuario
  const searchInput = document.getElementById("usuario").value.trim();
  const password = document.getElementById("password").value.trim();

  const loginMsg = document.getElementById("loginMsg");
  const loginBtn = document.getElementById("loginBtn");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const btnText = document.getElementById("btnText");

  if (!searchInput || !password) {
    showError(loginMsg, "Completa todos los campos.");
    return;
  }

  disableForm(loginBtn, loadingSpinner, btnText);
  clearMessage(loginMsg);

  try {
    let query;
    let columnaBusqueda;

    // Determinar si buscar por 'email' o por 'usuario'
    if (isEmail(searchInput)) {
        columnaBusqueda = "email";
    } else {
        columnaBusqueda = "usuario";
    }
    
    console.log(`🔍 Buscando en tabla 'usuarios' por ${columnaBusqueda}...`);

    // 1. Buscar en la tabla usuarios para obtener ROL, ESTADO y, crucialmente, el EMAIL
    const { data: userRow, error: userError } = await supabaseClient
      .from("usuarios")
      .select("id, email, rol, estado")
      .eq(columnaBusqueda, searchInput)
      .single();

    if (userError || !userRow) {
      // Si hay error (ej. RLS o not found)
      throw new Error("Credenciales incorrectas o usuario no registrado.");
    }

    if (!userRow.estado) {
      throw new Error("Tu usuario está inactivo. Contacta al administrador.");
    }

    // 2. Autenticación real usando Email + Password con Supabase Auth
    // ¡IMPORTANTE! signInWithPassword SIEMPRE usa el campo 'email' de la DB
    console.log(`🔐 Iniciando sesión con Email: ${userRow.email}`);
    const { error: authError } = await supabaseClient.auth.signInWithPassword({
      email: userRow.email, // Se usa el email recuperado, no el input
      password: password,
    });

    if (authError) {
      console.error("Error de autenticación de Supabase:", authError);
      throw new Error("Correo o contraseña incorrectos.");
    }

    // 3. Guardar sesión y redirigir
    localStorage.setItem("usuario_id", userRow.id);
    localStorage.setItem("email_admin", userRow.email);
    localStorage.setItem("rol", userRow.rol);
    localStorage.setItem("login_timestamp", new Date().toISOString());

    showSuccess(loginMsg, "Acceso correcto. Redirigiendo...");

    // Redirección al panel de administración
    setTimeout(() => {
      window.location.href = "administracion.html";
    }, 800);
  } catch (err) {
    showError(loginMsg, err.message);
  } finally {
    enableForm(loginBtn, loadingSpinner, btnText);
  }
}

// ===============================
// UI - Manejo de mensajes
// ===============================
function showError(msgElement, message) {
  msgElement.classList.add("active");
  msgElement.style.color = "#dc3545";
  msgElement.textContent = message;
}

function showSuccess(msgElement, message) {
  msgElement.classList.add("active");
  msgElement.style.color = "#28a745";
  msgElement.textContent = message;
}

function clearMessage(msgElement) {
  msgElement.classList.remove("active");
  msgElement.textContent = "";
}

function disableForm(btn, spinner, btnText) {
  btn.disabled = true;
  spinner.style.display = "inline-block";
  btnText.textContent = "Verificando...";
}

function enableForm(btn, spinner, btnText) {
  btn.disabled = false;
  spinner.style.display = "none";
  btnText.textContent = "Entrar";
}

console.log("✅ login.js cargado");