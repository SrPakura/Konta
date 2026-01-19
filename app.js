let currentUser = null;

// Referencias a las pantallas
const screenSelection = document.getElementById('screen-selection');
const screenLogin = document.getElementById('screen-login');

// Referencias a elementos del login
const greetingTitle = document.getElementById('greeting-title');
const loginUserInput = document.getElementById('login-user');
const loginPassInput = document.getElementById('login-pass');

// 1. Función para elegir usuario
function selectUser(name) {
    currentUser = name;
    
    // Actualizar textos pantalla 2
    greetingTitle.innerText = `¿Qué tal, ${name}?`;
    loginUserInput.value = name; // Rellena el input automáticamente
    
    // Transición: Ocultar selección -> Mostrar Login
    screenSelection.classList.add('hidden');
    screenLogin.classList.remove('hidden');
    
    // Poner foco en la contraseña para escribir directo
    loginPassInput.focus();
}

// 2. Función para validar login
function tryLogin() {
    const password = loginPassInput.value;
    
    if (password === "00000") {
        console.log("LOGIN CORRECTO");
        // Guardar sesión (básico)
        localStorage.setItem('konta_user', currentUser);
        
        // AQUÍ IRÍAMOS AL DASHBOARD (Pantalla 3)
        alert("¡Contraseña correcta! Redirigiendo al Dashboard...");
        // window.location.href = "dashboard.html"; // Ejemplo futuro
    } else {
        alert("Contraseña incorrecta. Pista: es 00000");
        loginPassInput.value = ""; // Limpiar campo
    }
}
