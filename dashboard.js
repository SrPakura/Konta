// CONFIGURACIÓN DE SUPABASE
const SUPABASE_URL = 'https://pguljdqeacxzozvevmnr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWxqZHFlYWN4em96dmV2bW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MjI2NjEsImV4cCI6MjA4NDM5ODY2MX0.kzJR7ZDazkJGqjoiBpdXIX6_LzhgPDKRG1G4ToFr0Lg'; 

// CAMBIO AQUÍ: Llamamos a la variable 'supabaseClient' para evitar el error de "redeclaration"
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ELEMENTOS DEL DOM
const userGreeting = document.getElementById('user-greeting');
const remainingAmountEl = document.getElementById('remaining-amount');
const catComidaEl = document.getElementById('cat-comida');
const catOtrosEl = document.getElementById('cat-otros');
const expensesListEl = document.getElementById('expenses-list');

// ESTADO
let currentUser = localStorage.getItem('konta_user') || 'Usuario';
const WEEKLY_BUDGET = 250;

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    // Si no hay usuario en el localStorage (alguien intenta entrar directo sin login), lo mandamos fuera
    if (!localStorage.getItem('konta_user')) {
        window.location.href = 'index.html';
        return;
    }

    // 1. Poner nombre
    userGreeting.textContent = `Hola, ${currentUser}`;
    
    // 2. Cargar datos
    loadDashboardData();
});

async function loadDashboardData() {
    const { startStr, endStr } = getCurrentWeekRange();
    
    console.log(`Buscando gastos desde ${startStr} hasta ${endStr}`);

    // Usamos 'supabaseClient' en lugar de 'supabase'
    const { data: tickets, error } = await supabaseClient
        .from('tickets')
        .select('*')
        .gte('expense_date', startStr)
        .lte('expense_date', endStr)
        .order('expense_date', { ascending: false });

    if (error) {
        console.error('Error cargando tickets:', error);
        expensesListEl.innerHTML = '<p style="color:white">Error cargando datos.</p>';
        return;
    }

    calculateAndRender(tickets);
}

function calculateAndRender(tickets) {
    let totalSpent = 0;
    let spentComida = 0;
    let spentOtros = 0;

    tickets.forEach(t => {
        const amount = parseFloat(t.amount);
        totalSpent += amount;
        
        if (t.category === 'Comida') spentComida += amount;
        else spentOtros += amount;
    });

    const remaining = WEEKLY_BUDGET - totalSpent;
    remainingAmountEl.textContent = remaining.toFixed(2).replace('.', ',');
    catComidaEl.textContent = spentComida.toFixed(2).replace('.', ',') + '€';
    catOtrosEl.textContent = spentOtros.toFixed(2).replace('.', ',') + '€';

    renderExpensesList(tickets);
}

function renderExpensesList(tickets) {
    expensesListEl.innerHTML = ''; 

    if (tickets.length === 0) {
        expensesListEl.innerHTML = '<p style="color:white; text-align:center">No hay gastos esta semana.</p>';
        return;
    }

    const groups = {};
    tickets.forEach(ticket => {
        const dateKey = ticket.expense_date;
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(ticket);
    });

    const sortedDates = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));

    sortedDates.forEach(dateStr => {
        const dayTickets = groups[dateStr];
        const dayGroup = document.createElement('div');
        dayGroup.className = 'day-group';

        const dateObj = new Date(dateStr);
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        const formattedDate = new Date(dateStr + 'T00:00').toLocaleDateString('es-ES', options);
        const finalDateTitle = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

        dayGroup.innerHTML = `<h2 class="day-title">${finalDateTitle}</h2>`;

        dayTickets.forEach(t => {
            const card = document.createElement('div');
            card.className = 'expense-card';
            card.innerHTML = `
                <div class="expense-row">
                    <span class="expense-concept">${t.concept}</span>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span class="expense-amount">-${parseFloat(t.amount).toFixed(2).replace('.', ',')}€</span>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="11" stroke="#1A1A1A" stroke-width="2"/><path d="M8 12H16M16 12L12 8M16 12L12 16" stroke="#1A1A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                </div>
            `;
            dayGroup.appendChild(card);
        });

        expensesListEl.appendChild(dayGroup);
    });
}

function getCurrentWeekRange() {
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    const distToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
        startStr: monday.toISOString().split('T')[0],
        endStr: sunday.toISOString().split('T')[0]
    };
}
