// CONFIGURACIÓN DE SUPABASE
const SUPABASE_URL = 'https://cwlvpzossqmpuzdpjrsh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bHZwem9zc3FtcHV6ZHBqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDc5NTIsImV4cCI6MjA3Njk4Mzk1Mn0.PPq8uCEx9Tu1B6iBtS2eCHogGSRaxc5tWPF8PZnU-Go';

let supabaseClient = null;

// INICIALIZAR SUPABASE CUANDO EL DOCUMENTO ESTÉ LISTO
document.addEventListener('DOMContentLoaded', () => {
  initializeSupabase();
  attachFormListener();
});

// FUNCIÓN: Inicializar cliente de Supabase
function initializeSupabase() {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Supabase inicializado correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar Supabase:', error);
    showError('Error en la configuración. Por favor, recargue la página.');
  }
}

// FUNCIÓN: Adjuntar listener al formulario
function attachFormListener() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
    console.log('✅ Formulario de login configurado');
  } else {
    console.error('❌ Formulario no encontrado');
  }
}

// FUNCIÓN: Manejar envío del formulario
async function handleLogin(e) {
  e.preventDefault();
  
  // Obtener elementos del formulario
  const usuarioInput = document.getElementById('usuario');
  const passwordInput = document.getElementById('password');
  const loginMsg = document.getElementById('loginMsg');
  const loginBtn = document.getElementById('loginBtn');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const btnText = document.getElementById('btnText');
  
  // Validar que los campos no estén vacíos
  const usuario = usuarioInput.value.trim();
  const password = passwordInput.value;
  
  if (!usuario || !password) {
    showError(loginMsg, 'Por favor, completa todos los campos.');
    return;
  }
  
  // Deshabilitar interfaz durante el login
  disableForm(loginBtn, loadingSpinner, btnText);
  clearMessage(loginMsg);
  
  try {
    console.log('🔄 Iniciando autenticación para usuario:', usuario);
    
    // PASO 1: Obtener usuario de la base de datos
    const userData = await fetchUserFromDatabase(usuario);
    if (!userData) {
      throw new Error('Usuario no encontrado.');
    }
    
    console.log('✅ Usuario encontrado:', userData.usuario);
    
    // PASO 2: Verificar si el usuario está activo
    if (userData.estado !== 'activo') {
      throw new Error('Usuario inactivo. Contacte al administrador.');
    }
    
    console.log('✅ Usuario está activo');
    
    // PASO 3: Verificar la contraseña con bcrypt
    const passwordValid = await verifyPassword(password, userData.password_hash);
    if (!passwordValid) {
      throw new Error('Usuario o contraseña incorrectos.');
    }
    
    console.log('✅ Contraseña válida');
    
    // PASO 4: Guardar datos en localStorage
    saveUserSession(userData);
    console.log('✅ Sesión guardada');
    
    // PASO 5: Mostrar mensaje de éxito y redirigir
    showSuccess(loginMsg, 'Acceso concedido. Redirigiendo...');
    setTimeout(() => {
      window.location.href = 'administracion.html';
    }, 1500);
    
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    showError(loginMsg, error.message || 'Error al iniciar sesión.');
  } finally {
    // Re-habilitar interfaz
    enableForm(loginBtn, loadingSpinner, btnText);
  }
}

// FUNCIÓN: Obtener usuario de la base de datos
async function fetchUserFromDatabase(usuario) {
  try {
    const { data, error } = await supabaseClient
      .from('usuarios')
      .select('id_usuario, usuario, email, rol, estado, password_hash')
      .eq('usuario', usuario)
      .single();
    
    if (error) {
      console.error('Error en consulta a BD:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Excepción al obtener usuario:', err);
    return null;
  }
}

// FUNCIÓN: Verificar contraseña con bcrypt
async function verifyPassword(password, hash) {
  try {
    // Usar bcrypt.compare para verificación de contraseña
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  } catch (error) {
    console.error('Error al comparar contraseña:', error);
    throw new Error('Error al verificar la contraseña.');
  }
}

// FUNCIÓN: Guardar sesión del usuario
function saveUserSession(userData) {
  localStorage.setItem('usuario_admin', userData.usuario);
  localStorage.setItem('email_admin', userData.email);
  localStorage.setItem('rol', userData.rol);
  localStorage.setItem('id_usuario', userData.id_usuario);
  localStorage.setItem('login_timestamp', new Date().toISOString());
}

// FUNCIÓN: Mostrar mensaje de error
function showError(msgElement, message) {
  msgElement.classList.remove('alert-success');
  msgElement.classList.add('alert-danger', 'active');
  msgElement.textContent = message;
  msgElement.style.color = '#dc3545';
}

// FUNCIÓN: Mostrar mensaje de éxito
function showSuccess(msgElement, message) {
  msgElement.classList.remove('alert-danger');
  msgElement.classList.add('alert-success', 'active');
  msgElement.textContent = message;
  msgElement.style.color = '#28a745';
}

// FUNCIÓN: Limpiar mensaje
function clearMessage(msgElement) {
  msgElement.classList.remove('active', 'alert-danger', 'alert-success');
  msgElement.textContent = '';
}

// FUNCIÓN: Deshabilitar formulario durante la autenticación
function disableForm(btn, spinner, btnText) {
  btn.disabled = true;
  spinner.style.display = 'inline-block';
  btnText.textContent = 'Verificando...';
}

// FUNCIÓN: Re-habilitar formulario después de la autenticación
function enableForm(btn, spinner, btnText) {
  btn.disabled = false;
  spinner.style.display = 'none';
  btnText.textContent = 'Entrar';
}

// LOG: Indicar que el script está cargado
console.log('✅ login.js cargado correctamente');