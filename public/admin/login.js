// ========================================
// LOGIN.JS - Autenticacion Nativa Supabase
// ========================================

// Configuracion de Supabase
const SUPABASE_URL = 'https://cwlvpzossqmpuzdpjrsh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwemo3b3NzcXRpZHdqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzcwMzQ0NzIsImV4cCI6MTk5MzAwNDQ3Mn0.qQsEfCe8Qi23u0_T-IIqZS5Ej4JVVP4gvNHrq0-0Zb4';

let supabaseClient = null;

// Inicializar Supabase
function initSupabase() {
  console.log('Inicializando Supabase...');
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase inicializado correctamente');
  } catch (error) {
    console.error('Error al inicializar Supabase:', error);
    showError('Error al inicializar el sistema de autenticacion');
  }
}

// Esperar a que el DOM este listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM cargado');
  initSupabase();
  
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.onsubmit = handleLogin;
  } else {
    console.error('No se encontro el formulario con id loginForm');
  }
});

// Manejador principal de login
async function handleLogin(e) {
  e.preventDefault();
  
  const usuario = document.getElementById('usuario')?.value?.trim();
  const password = document.getElementById('password')?.value;
  const loginBtn = document.getElementById('loginBtn');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const btnText = document.getElementById('btnText');
  
  // Validaciones
  if (!usuario || !password) {
    showError('Por favor completa todos los campos');
    return;
  }
  
  try {
    // Mostrar estado de carga
    disableForm(loginBtn, loadingSpinner, btnText);
    clearMessage();
    
    console.log('Buscando usuario:', usuario);
    
    // PASO 1: Buscar el usuario en la tabla public.usuarios
    const { data: usuarioData, error: searchError } = await supabaseClient
      .from('usuarios')
      .select('id, email, estado, rol, nombre_completo')
      .eq('usuario', usuario)
      .single();
    
    if (searchError || !usuarioData) {
      console.error('Usuario no encontrado:', searchError?.message);
      throw new Error('Usuario no encontrado');
    }
    
    console.log('Usuario encontrado:', usuarioData.usuario);
    
    // PASO 2: Verificar si el usuario esta activo
    if (!usuarioData.estado) {
      console.warn('Usuario inactivo:', usuario);
      throw new Error('Usuario inactivo. Contacta al administrador.');
    }
    
    console.log('Usuario activo');
    
    // PASO 3: Autenticar con Supabase usando el email y contrasena
    console.log('Autenticando con email:', usuarioData.email);
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: usuarioData.email,
      password: password
    });
    
    if (error) {
      console.error('Error de autenticacion:', error.message);
      throw new Error('Contrasena incorrecta');
    }
    
    console.log('Autenticacion exitosa:', data.user.id);
    
    // PASO 4: Guardar sesion en localStorage
    const sessionData = {
      user_id: data.user.id,
      email: data.user.email,
      usuario: usuarioData.usuario,
      rol: usuarioData.rol,
      nombre_completo: usuarioData.nombre_completo,
      login_time: new Date().toISOString()
    };
    
    localStorage.setItem('session', JSON.stringify(sessionData));
    localStorage.setItem('supabase_session', JSON.stringify(data.session));
    
    console.log('Sesion guardada:', sessionData);
    
    // PASO 5: Mostrar mensaje de exito y redirigir
    showSuccess('Acceso concedido Redirigiendo...');
    console.log('Acceso exitoso. Redirigiendo a administracion...');
    
    // Redirigir despues de 1.5 segundos
    setTimeout(() => {
      window.location.href = 'administracion.html';
    }, 1500);
    
  } catch (error) {
    console.error('Error en login:', error.message);
    enableForm(loginBtn, loadingSpinner, btnText);
    showError(error.message || 'Ocurrio un error durante el login. Intenta de nuevo.');
  }
}

// ========================================
// FUNCIONES DE UI
// ========================================

function showError(message) {
  const loginMsg = document.getElementById('loginMsg');
  if (!loginMsg) return;
  
  loginMsg.classList.remove('alert-success', 'active');
  loginMsg.classList.add('alert-danger', 'active');
  loginMsg.textContent = message;
  loginMsg.style.color = '#dc3545';
  
  console.log('Error mostrado:', message);
}

function showSuccess(message) {
  const loginMsg = document.getElementById('loginMsg');
  if (!loginMsg) return;
  
  loginMsg.classList.remove('alert-danger', 'active');
  loginMsg.classList.add('alert-success', 'active');
  loginMsg.textContent = message;
  loginMsg.style.color = '#28a745';
  
  console.log('Exito mostrado:', message);
}

function clearMessage() {
  const loginMsg = document.getElementById('loginMsg');
  if (!loginMsg) return;
  
  loginMsg.classList.remove('alert-danger', 'alert-success', 'active');
  loginMsg.textContent = '';
}

function disableForm(btn, spinner, btnText) {
  btn.disabled = true;
  spinner.style.display = 'inline-block';
  btnText.textContent = 'Verificando...';
  console.log('Formulario deshabilitado');
}

function enableForm(btn, spinner, btnText) {
  btn.disabled = false;
  spinner.style.display = 'none';
  btnText.textContent = 'Entrar';
  console.log('Formulario habilitado');
}

// Verificar sesion existente al cargar la pagina
function checkExistingSession() {
  const sessionData = localStorage.getItem('session');
  if (sessionData) {
    console.log('Sesion existente encontrada, redirigiendo...');
    window.location.href = 'administracion.html';
  }
}

// Ejecutar verificacion de sesion
checkExistingSession();