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

// ⚠️ PEGA AQUÍ LA URL DE TU WORKER
const WORKER_URL = "https://konta-auth.srpakura.workers.dev/"; 

async function tryLogin() {
    const password = loginPassInput.value;
    
    // Feedback visual simple (opcional: deshabilitar botón mientras carga)
    const btnText = document.querySelector('.login-btn span');
    const originalText = btnText.innerText;
    btnText.innerText = "VERIFICANDO...";

    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: password })
        });

        const data = await response.json();

        if (response.ok && data.valid) {
            // LOGIN OK
            localStorage.setItem('konta_user', currentUser);
            // Redirigir
            window.location.href = "dashboard.html"; 
        } else {
            // LOGIN FALLIDO
            throw new Error("Pin incorrecto");
        }

    } catch (error) {
        console.error(error);
        alert("Contraseña incorrecta."); // Sin pistas ;)
        loginPassInput.value = "";
        btnText.innerText = originalText; // Restaurar texto botón
        loginPassInput.focus();
    }
}
