// CHECK INICIAL: Si ya hay usuario guardado, vamos directo al dashboard
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('konta_user');
    if (savedUser) {
        console.log("Sesión encontrada, redirigiendo...");
        window.location.href = 'dashboard.html';
    }
});

let currentUser = null;
const screenSelection = document.getElementById('screen-selection');
const screenLogin = document.getElementById('screen-login');
const greetingTitle = document.getElementById('greeting-title');
const loginUserInput = document.getElementById('login-user');
const loginPassInput = document.getElementById('login-pass');

function selectUser(name) {
    currentUser = name;
    greetingTitle.innerText = `¿Qué tal, ${name}?`;
    loginUserInput.value = name;
    
    screenSelection.classList.add('hidden');
    screenLogin.classList.remove('hidden');
    
    loginPassInput.focus();
}

function tryLogin() {
    const password = loginPassInput.value;
    
    if (password === "00000") {
        // 1. Guardar en LocalStorage (Persistencia)
        localStorage.setItem('konta_user', currentUser);
        
        // 2. Redirigir al Dashboard REAL
        window.location.href = "dashboard.html"; 
    } else {
        alert("Contraseña incorrecta. Pista: es 00000");
        loginPassInput.value = "";
    }
}
