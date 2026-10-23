// admin/js/dashboard.js
checkSession();

// LÓGICA DEL INTERRUPTOR DE TIENDA
async function cargarEstadoTienda() {
    const { data } = await supabaseClient.from('configuracion').select('*').single();
    if (data) {
        const toggle = document.getElementById('toggle-tienda');
        const statusText = document.getElementById('status-text');
        
        toggle.checked = data.tienda_abierta;
        if (data.tienda_abierta) {
            statusText.innerText = 'Abierta';
            statusText.style.color = 'var(--success)';
        } else {
            statusText.innerText = 'Cerrada';
            statusText.style.color = 'var(--danger)';
        }
    }
}

async function toggleTienda(checkbox) {
    const nuevoEstado = checkbox.checked;
    // Actualizamos la base de datos
    await supabaseClient.from('configuracion').update({ tienda_abierta: nuevoEstado }).eq('id', 1);
    // Refrescamos la vista visual
    cargarEstadoTienda();
}

// CARGA GENERAL DEL DASHBOARD
async function cargarDashboard() {
    // 1. Cargar estado de la tienda
    cargarEstadoTienda();

    // 2. Totales de Pedidos
    const { data: pedidos } = await supabaseClient.from('pedidos').select('total').eq('estado', 'pagado');
    const { count: productos } = await supabaseClient.from('productos').select('*', { count: 'exact', head: true });
    const { count: reclamos } = await supabaseClient.from('reclamos').select('*', { count: 'exact', head: true });

    if (pedidos) {
        let totalIngresos = pedidos.reduce((sum, p) => sum + Number(p.total), 0);
        let ticketPromedio = pedidos.length > 0 ? totalIngresos / pedidos.length : 0;
        document.getElementById('stat-ingresos').innerText = `S/ ${totalIngresos.toFixed(2)}`;
        document.getElementById('stat-pedidos').innerText = pedidos.length;
        document.getElementById('stat-ticket').innerText = `S/ ${ticketPromedio.toFixed(2)}`;
    }
    document.getElementById('stat-productos').innerText = productos || 0;
    document.getElementById('stat-reclamos').innerText = reclamos || 0;

    // 3. Gráfico
    const { data: ventas } = await supabaseClient.from('vista_ventas_diarias').select('*').order('fecha', { ascending: true });
    
    if (ventas && ventas.length > 0) {
        const ctx = document.getElementById('graficoVentas').getContext('2d');
        const labels = ventas.map(v => new Date(v.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }));
        const dataHistorica = ventas.map(v => v.ingresos_totales);

        let datasets = [{
            label: 'Facturación Real',
            data: dataHistorica,
            borderColor: '#0067c0',
            backgroundColor: 'rgba(0, 103, 192, 0.1)',
            borderWidth: 3,
            pointBackgroundColor: '#0067c0',
            fill: true,
            tension: 0.3
        }];

        if (dataHistorica.length > 1) {
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
            dataHistorica.forEach((y, x) => { sumX += x; sumY += y; sumXY += (x * y); sumXX += (x * x); });
            const slope = (dataHistorica.length * sumXY - sumX * sumY) / (dataHistorica.length * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / dataHistorica.length;
            const dataForecast = dataHistorica.map((_, i) => slope * i + intercept);
            dataForecast.push(slope * (dataHistorica.length) + intercept);

            datasets.push({
                label: 'Línea de Tendencia',
                data: dataForecast,
                borderColor: 'rgba(0,0,0,0.2)',
                borderDash: [5, 5],
                borderWidth: 1,
                pointRadius: 0,
                fill: false
            });
        }

        new Chart(ctx, {
            type: 'line',
            data: { labels: labels, datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#1a1a1a', font: { family: 'Segoe UI' } } } },
                scales: {
                    x: { ticks: { color: '#5f5f5f' }, grid: { display: false } },
                    y: { ticks: { color: '#5f5f5f', callback: (val) => 'S/ ' + val }, grid: { color: 'rgba(0,0,0,0.05)' } }
                }
            }
        });
    }

    // 4. Tabla de Últimos Pedidos
    const { data: ultimosPedidos } = await supabaseClient.from('pedidos').select('*').order('created_at', { ascending: false }).limit(5);
    const tbody = document.getElementById('tabla-ultimos-pedidos');
    
    if (tbody && ultimosPedidos) {
        tbody.innerHTML = '';
        ultimosPedidos.forEach(p => {
            let badgeClass = p.estado === 'pagado' ? 'badge-success' : p.estado === 'pendiente' ? 'badge-warning' : 'badge-danger';
            tbody.innerHTML += `
                <tr>
                    <td>${p.cliente_nombre}</td>
                    <td style="font-weight: 600;">S/ ${Number(p.total).toFixed(2)}</td>
                    <td>${p.metodo_pago.toUpperCase()}</td>
                    <td><span class="badge ${badgeClass}">${p.estado.toUpperCase()}</span></td>
                    <td>${new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
            `;
        });
    }
}

window.onload = cargarDashboard;