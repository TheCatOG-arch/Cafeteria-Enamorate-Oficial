// admin/js/excel.js
checkSession();
let datosReporte = [];

async function cargarReporte() {
    // Consultamos la vista de Supabase
    const { data, error } = await supabaseClient.from('vista_margen_productos').select('*');
    
    if (error) {
        console.error("Error al cargar reportes:", error);
        document.getElementById('tabla-reporte').innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Error de conexión al cargar los datos.</td></tr>';
        return;
    }

    datosReporte = data || [];
    const tbody = document.getElementById('tabla-reporte');
    tbody.innerHTML = '';

    // Si la base de datos está vacía, mostramos un mensaje
    if (datosReporte.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 30px; color: var(--text-muted);"><i class="fa-solid fa-file-excel" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i> Aún no hay ventas pagadas para generar reportes.</td></tr>';
        return;
    }

    datosReporte.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item.nombre}</td>
                <td>${item.unidades_vendidas}</td>
                <td>S/ ${Number(item.ingresos).toFixed(2)}</td>
                <td>S/ ${Number(item.costo_total).toFixed(2)}</td>
                <td style="color: var(--success); font-weight: bold;">S/ ${Number(item.margen_ganancia).toFixed(2)}</td>
            </tr>
        `;
    });
}

function exportarExcel() {
    if (datosReporte.length === 0) { alert("No hay datos para exportar."); return; }

    const dataExcel = datosReporte.map(item => ({
        'Producto': item.nombre,
        'Unidades Vendidas': item.unidades_vendidas,
        'Ingresos (S/)': Number(item.ingresos),
        'Costo Total (S/)': Number(item.costo_total),
        'Margen de Ganancia (S/)': Number(item.margen_ganancia)
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    worksheet['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 25 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Márgenes");

    XLSX.writeFile(workbook, `Reporte_Ganancias_${new Date().toISOString().split('T')[0]}.xlsx`);
}

window.onload = cargarReporte;