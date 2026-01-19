// CONFIGURACIÓN SUPABASE
const SUPABASE_URL = 'https://pguljdqeacxzozvevmnr.supabase.co';
// ⚠️ TU CLAVE API AQUÍ
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWxqZHFlYWN4em96dmV2bW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MjI2NjEsImV4cCI6MjA4NDM5ODY2MX0.kzJR7ZDazkJGqjoiBpdXIX6_LzhgPDKRG1G4ToFr0Lg'; 

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elementos del DOM
const elConcept = document.getElementById('det-concept');
const elAmount = document.getElementById('det-amount');
const elUser = document.getElementById('det-user');
const elCategory = document.getElementById('det-category');
const elDate = document.getElementById('det-date');
const elDesc = document.getElementById('det-desc');

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener ID de la URL (ej: detail.html?id=123)
    const params = new URLSearchParams(window.location.search);
    const ticketId = params.get('id');

    if (!ticketId) {
        alert("No se ha especificado un registro.");
        window.location.href = 'dashboard.html';
        return;
    }

    loadTicketDetail(ticketId);
});

async function loadTicketDetail(id) {
    // Consultar Supabase por ID
    const { data: ticket, error } = await supabaseClient
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single(); // Solo queremos uno

    if (error) {
        console.error("Error:", error);
        elConcept.innerText = "Error cargando";
        return;
    }

    // Rellenar datos
    elConcept.innerText = ticket.concept;
    elAmount.innerText = parseFloat(ticket.amount).toFixed(2).replace('.', ',') + '€';
    elUser.innerText = `Hecho por ${ticket.user_name}`;
    elCategory.innerText = ticket.category;
    
    // Formatear Fecha y Hora
    // Usamos 'created_at' porque guarda la hora exacta. 'expense_date' solo guarda el día.
    const dateObj = new Date(ticket.created_at);
    const dateStr = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    elDate.innerText = `${dateStr} a las ${timeStr}`;

    // Descripción
    elDesc.innerText = ticket.description ? ticket.description : "Sin descripción";
}
