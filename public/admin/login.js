// CONFIGURACIÓN DE SUPABASE
const SUPABASE_URL = 'https://cwlvpzossqmpuzdpjrsh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go';

let supabaseClient = null;

// INICIAR AL CARGAR
document.addEventListener('DOMContentLoaded', () => {
    initializeSupabase();
    attachFormListener();
});

// Inicializar
function initializeSupabase() {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase inicializado');
    } catch (error) {
        console.error('❌ Error al inicializar Supabase:', error);
        alert('Error interno. Recargue la página.');
    }
}

// Listener formulario
function attachFormListener() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

// LOGIN PRINCIPAL
async function handleLogin(e) {
    e.preventDefault();

    const usuarioInput = document.getElementById('usuario');
    const passwordInput = document.getElementById('password');
    const loginMsg = document.getElementById('loginMsg');
    const loginBtn = document.getElementById('loginBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const btnText = document.getElementById('btnText');

    const usuario = usuarioInput.value.trim();
    const password = passwordInput.value;

    if (!usuario || !password) {
        showError(loginMsg, 'Completa todos los campos.');
        return;
    }

    disableForm(loginBtn, loadingSpinner, btnText);
    clearMessage(loginMsg);

    try {
        console.log("🔐 Intentando login con Supabase Auth...");

        // 1. Buscar correo por usuario (tu tabla)
        const { data: userRow, error: userError } = await supabaseClient
            .from('usuarios')
            .select('email, rol, estado')
            .eq('usuario', usuario)
            .single();

        if (userError || !userRow) {
            throw new Error("Usuario no encontrado.");
        }

        if (userRow.estado !== "activo") {
            throw new Error("Usuario inactivo. Contacte al administrador.");
        }

        // 2. Iniciar sesión nativa en Supabase Auth
        const { data: authData, error: authError } =
            await supabaseClient.auth.signInWithPassword({
                email: userRow.email,
                password: password
            });

        if (authError) {
            console.error(authError);
            throw new Error("Usuario o contraseña incorrectos.");
        }

        // 3. Guardar sesión
        localStorage.setItem("usuario_admin", usuario);
        localStorage.setItem("email_admin", userRow.email);
        localStorage.setItem("rol", userRow.rol);
        localStorage.setItem("login_timestamp", new Date().toISOString());

        showSuccess(loginMsg, 'Acceso correcto. Redirigiendo...');

        setTimeout(() => {
            window.location.href = "administracion.html";
        }, 1200);

    } catch (err) {
        showError(loginMsg, err.message);
    } finally {
        enableForm(loginBtn, loadingSpinner, btnText);
    }
}

// ERRORES / UI
function showError(msgElement, message) {
    msgElement.classList.add('active');
    msgElement.textContent = message;
    msgElement.style.color = "#dc3545";
}

function showSuccess(msgElement, message) {
    msgElement.classList.add('active');
    msgElement.textContent = message;
    msgElement.style.color = "#28a745";
}

function clearMessage(msgElement) {
    msgElement.classList.remove('active');
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
