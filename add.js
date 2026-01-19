// CONFIGURACIÓN DE SUPABASE
const SUPABASE_URL = 'https://pguljdqeacxzozvevmnr.supabase.co';
// ⚠️ IMPORTANTE: Pega aquí tu clave API 'anon public' que empieza por eyJ...
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWxqZHFlYWN4em96dmV2bW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MjI2NjEsImV4cCI6MjA4NDM5ODY2MX0.kzJR7ZDazkJGqjoiBpdXIX6_LzhgPDKRG1G4ToFr0Lg'; 

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ESTADO
let selectedCategory = 'Comida'; // Valor por defecto
let currentUser = localStorage.getItem('konta_user');

// Comprobación de seguridad
if (!currentUser) {
    window.location.href = 'index.html';
}

// ELEMENTOS
const inpConcept = document.getElementById('inp-concept');
const inpDesc = document.getElementById('inp-desc');
const inpAmount = document.getElementById('inp-amount');
const btnComida = document.getElementById('btn-comida');
const btnOtro = document.getElementById('btn-otro');

// LÓGICA DE SELECCIÓN DE CATEGORÍA
function setCategory(cat) {
    selectedCategory = cat;
    
    if (cat === 'Comida') {
        btnComida.classList.add('active');
        btnOtro.classList.remove('active');
    } else {
        btnComida.classList.remove('active');
        btnOtro.classList.add('active');
    }
}

// LÓGICA DE GUARDADO
async function saveTicket() {
    const concept = inpConcept.value.trim();
    const desc = inpDesc.value.trim();
    let amountStr = inpAmount.value.toString(); // Cogemos el string

    // VALIDACIÓN BÁSICA
    if (!concept) {
        alert("Por favor, escribe un concepto.");
        return;
    }
    if (!amountStr) {
        alert("Por favor, escribe un importe.");
        return;
    }

    // Convertir coma a punto (para decimales)
    amountStr = amountStr.replace(',', '.');
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
        alert("El importe debe ser un número válido.");
        return;
    }

    // PREPARAR DATOS PARA SUPABASE
    const newTicket = {
        concept: concept,
        description: desc, // Puede ir vacío
        category: selectedCategory,
        amount: amount,
        user_name: currentUser,
        // Supabase pone la fecha de hoy automáticamente en 'created_at',
        // pero nosotros usamos 'expense_date' para el dashboard.
        expense_date: new Date().toISOString().split('T')[0] // Fecha de hoy YYYY-MM-DD
    };

    // ENVIAR A SUPABASE
    const { data, error } = await supabaseClient
        .from('tickets')
        .insert([newTicket]);

    if (error) {
        console.error("Error guardando:", error);
        alert("Hubo un error al guardar. Inténtalo de nuevo.");
    } else {
        // ÉXITO
        // alert("¡Gasto guardado!"); // Opcional
        window.location.href = 'dashboard.html'; // Volver al inicio
    }
}
