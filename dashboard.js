// CONFIGURACIÓN DE SUPABASE
const SUPABASE_URL = 'https://pguljdqeacxzozvevmnr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWxqZHFlYWN4em96dmV2bW5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MjI2NjEsImV4cCI6MjA4NDM5ODY2MX0.kzJR7ZDazkJGqjoiBpdXIX6_LzhgPDKRG1G4ToFr0Lg'; 

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ELEMENTOS DOM
const userGreeting = document.getElementById('user-greeting');
const remainingAmountEl = document.getElementById('remaining-amount');
const catComidaEl = document.getElementById('cat-comida');
const catOtrosEl = document.getElementById('cat-otros');
const expensesListEl = document.getElementById('expenses-list');
const fabContainer = document.querySelector('.sticky-fab-container'); // El botón flotante

// ESTADO
let currentUser = localStorage.getItem('konta_user') || 'Usuario';
const WEEKLY_BUDGET = 250;

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('konta_user')) {
        window.location.href = 'index.html';
        return;
    }

    userGreeting.textContent = `Hola, ${currentUser}`;
    loadDashboardData();
    
    // Activar el link de "Ver gastos de otras semanas"
    const historyLink = document.querySelector('.history-link');
    if(historyLink) {
        historyLink.onclick = () => window.location.href = 'calendar.html';
    }
});

async function loadDashboardData() {
    // 1. Mirar si hay fecha en la URL (viniendo del calendario)
    const params = new URLSearchParams(window.location.search);
    const urlDate = params.get('date');
    
    // 2. Calcular rango según URL o fecha actual
    const { startStr, endStr, isCurrentWeek } = getWeekRange(urlDate);
    
    // 3. Ocultar botón "Añadir" si NO es la semana actual
    if (!isCurrentWeek) {
        if(fabContainer) fabContainer.style.display = 'none';
        userGreeting.textContent = `Semana del ${formatDateShort(startStr)}`;
    } else {
        if(fabContainer) fabContainer.style.display = 'flex';
    }

    console.log(`Buscando gastos: ${startStr} - ${endStr}`);

    const { data: tickets, error } = await supabaseClient
        .from('tickets')
        .select('*')
        .gte('expense_date', startStr)
        .lte('expense_date', endStr)
        .order('expense_date', { ascending: false });

    if (error) {
        console.error('Error:', error);
        expensesListEl.innerHTML = '<p style="color:white">Error cargando datos.</p>';
        return;
    }

    calculateAndRender(tickets);
}

// ... (Las funciones calculateAndRender y renderExpensesList SE QUEDAN IGUAL, no hace falta cambiarlas) ...
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
        expensesListEl.innerHTML = '<p style="color:white; text-align:center; margin-top:20px;">No hay gastos registrados esta semana.</p>';
        return;
    }
    // (Resto de la lógica de renderizado igual...)
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
            card.onclick = () => { window.location.href = `detail.html?id=${t.id}`; };
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


// NUEVA FUNCIÓN DE FECHAS (Sustituye a getCurrentWeekRange)
function getWeekRange(dateInput) {
    // Si pasamos fecha, usamos esa. Si no, hoy.
    const referenceDate = dateInput ? new Date(dateInput) : new Date();
    const today = new Date();
    
    // Calcular Lunes
    const dayOfWeek = referenceDate.getDay(); 
    const distToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const monday = new Date(referenceDate);
    monday.setDate(referenceDate.getDate() - distToMonday);
    
    // Calcular Domingo
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // Comprobar si es la semana actual (comparando el lunes de ambas)
    const currentMonday = new Date(today);
    const currentDayOfWeek = currentMonday.getDay();
    const distCurrent = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    currentMonday.setDate(today.getDate() - distCurrent);

    // Comparar strings YYYY-MM-DD para ver si es la misma semana
    const isCurrentWeek = monday.toISOString().split('T')[0] === currentMonday.toISOString().split('T')[0];

    return {
        startStr: monday.toISOString().split('T')[0],
        endStr: sunday.toISOString().split('T')[0],
        isCurrentWeek: isCurrentWeek
    };
}

function formatDateShort(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}
