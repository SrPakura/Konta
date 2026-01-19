const monthLabel = document.getElementById('month-year-label');
const calendarGrid = document.getElementById('calendar-grid');

let currentDate = new Date(); // Fecha actual para referencia
let viewingDate = new Date(); // Fecha que estamos viendo en el calendario

document.addEventListener('DOMContentLoaded', () => {
    renderCalendar(viewingDate);
});

function changeMonth(delta) {
    // Cambiar mes (+1 o -1)
    viewingDate.setMonth(viewingDate.getMonth() + delta);
    renderCalendar(viewingDate);
}

function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    // Actualizar título (Ej: Enero 2025)
    const monthName = date.toLocaleDateString('es-ES', { month: 'long' });
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    monthLabel.textContent = `${capitalizedMonth} ${year}`;

    calendarGrid.innerHTML = ''; // Limpiar

    // Calcular primer día del mes y total de días
    // 1 = Lunes, 0 = Domingo. Ajustamos para que Lunes sea el primer día visualmente.
    const firstDayOfMonth = new Date(year, month, 1);
    let startDayIndex = firstDayOfMonth.getDay(); 
    // Convertir Domingo (0) a 7 para facilitar cálculo (Lunes(1) -> 1, Domingo(0) -> 7)
    if (startDayIndex === 0) startDayIndex = 7;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Generar array de días incluyendo espacios vacíos al inicio
    let daysArray = [];
    
    // Espacios vacíos antes del día 1 (startDayIndex - 1 porque Lunes es 1)
    for (let i = 1; i < startDayIndex; i++) {
        daysArray.push(null);
    }
    
    // Días reales
    for (let i = 1; i <= daysInMonth; i++) {
        daysArray.push(i);
    }

    // Dividir en semanas (chunks de 7)
    while (daysArray.length > 0) {
        // Coger los siguientes 7 días (o menos si es la última semana)
        const weekChunk = daysArray.splice(0, 7);
        
        // Si la semana está incompleta al final, rellenar con nulls para mantener el grid
        while (weekChunk.length < 7) {
            weekChunk.push(null);
        }

        createWeekRow(weekChunk, year, month);
    }
}

function createWeekRow(days, year, month) {
    const row = document.createElement('div');
    row.className = 'week-row';

    // Buscar el primer día real de esta semana para calcular la fecha de inicio
    const firstRealDay = days.find(d => d !== null);
    
    // Configurar click: ir al Dashboard con la fecha del Lunes de esta semana
    if (firstRealDay) {
        row.onclick = () => {
            // Calcular fecha exacta
            // Nota: Si la semana empieza con 'null' (ej: mes empieza en Miercoles),
            // el lunes pertenecía al mes anterior, pero para simplificar, 
            // pasaremos el primer día real del mes y que el dashboard calcule el lunes relativo.
            
            const targetDate = new Date(year, month, firstRealDay);
            // Formato YYYY-MM-DD
            // Truco zona horaria: usar formato local
            const dateStr = targetDate.toLocaleDateString('en-CA'); // en-CA da formato YYYY-MM-DD
            
            window.location.href = `dashboard.html?date=${dateStr}`;
        };
    }

    // Generar HTML de los días
    days.forEach(day => {
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        
        if (day) {
            cell.textContent = day;
            
            // Comprobar si es HOY
            const today = new Date();
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                cell.classList.add('today');
            }
        } else {
            cell.classList.add('empty');
        }
        
        row.appendChild(cell);
    });

    calendarGrid.appendChild(row);
}
