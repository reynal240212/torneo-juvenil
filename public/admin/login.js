// ===============================
// CONFIGURACIÓN DE SUPABASE
// ===============================
const SUPABASE_URL = "https://cwlvpzossqmpuzdpjrsh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go";

let supabaseClient = null;

// ===============================
// INICIAR AL CARGAR
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  initializeSupabase();
  attachFormListener();
});

// ===============================
// Inicializar Supabase
// ===============================
function initializeSupabase() {
  try {
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
// LOGIN PRINCIPAL
// ===============================
async function handleLogin(e) {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value.trim();
  const password = document.getElementById("password").value.trim();

  const loginMsg = document.getElementById("loginMsg");
  const loginBtn = document.getElementById("loginBtn");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const btnText = document.getElementById("btnText");

  if (!usuario || !password) {
    showError(loginMsg, "Completa todos los campos.");
    return;
  }

  disableForm(loginBtn, loadingSpinner, btnText);
  clearMessage(loginMsg);

  try {
    console.log("🔍 Verificando usuario en tabla 'usuarios'...");

    // 1. Buscar usuario en tabla
    const { data: userRow, error: userError } = await supabaseClient
      .from("usuarios")
      .select("email, rol, estado")
      .eq("usuario", usuario)
      .single();

    if (userError || !userRow) {
      throw new Error("Usuario no encontrado.");
    }

    if (!userRow.estado) {
      throw new Error("Usuario inactivo. Contacte al administrador.");
    }

    console.log("🔐 Intentando iniciar sesión con Supabase Auth...");

    // 2. Autenticación en Supabase
    const { error: authError } = await supabaseClient.auth.signInWithPassword({
      email: userRow.email,
      password: password,
    });

    if (authError) {
      console.error(authError);
      throw new Error("Usuario o contraseña incorrectos.");
    }

    // 3. Guardar sesión en localStorage
    localStorage.setItem("usuario_admin", usuario);
    localStorage.setItem("email_admin", userRow.email);
    localStorage.setItem("rol", userRow.rol);
    localStorage.setItem("login_timestamp", new Date().toISOString());

    showSuccess(loginMsg, "Acceso correcto. Redirigiendo...");

    setTimeout(() => {
      window.location.href = "administracion.html";
    }, 1200);
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
