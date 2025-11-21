// ==========================
// CONFIG DE SUPABASE
// ==========================
const SUPABASE_URL = "https://cwlvpzossqmpuzdpjrsh.supabase.co";
const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("registerForm").addEventListener("submit", registerUser);
});

// ==========================
// REGISTRO COMPLETO
// ==========================
async function registerUser(e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const usuario = document.getElementById("usuario").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("msg");

    msg.className = "msg";

    if (!nombre || !usuario || !email || !password) {
        showMsg("Todos los campos son obligatorios", "danger");
        return;
    }

    // =============== 1. Crear usuario en AUTH ====================
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: email,
        password: password
    });

    if (authError) {
        showMsg("Error al registrar: " + authError.message, "danger");
        return;
    }

    const userId = authData.user.id;

    // =============== 2. Guardar datos en tabla usuarios ===========
    const { error: dbError } = await supabaseClient
        .from("usuarios")
        .insert([{
            id: userId,
            email: email,
            nombre_completo: nombre,
            usuario: usuario,
            rol: "admin",
            estado: true
        }]);

    if (dbError) {
        showMsg("Error guardando datos: " + dbError.message, "danger");
        return;
    }

    // =============== FIN ===============
    showMsg("Registro exitoso. Redirigiendo al login...", "success");

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);
}

// ==========================
// FUNCIONES DE UI
// ==========================
function showMsg(text, type) {
    const msg = document.getElementById("msg");
    msg.textContent = text;
    msg.className = "msg active alert alert-" + type;
}
