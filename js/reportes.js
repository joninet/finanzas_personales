/**
 * Funcionalidad para la generación de reportes financieros
 */

// Referencias a elementos del DOM
let tablaTransacciones = null;
let graficos = {
  evolucion: null,
  distribucion: null,
  tendenciaIngresos: null,
  tendenciaGastos: null
};

/**
 * Inicializa la funcionalidad de reportes
 */
async function inicializarReportes() {
  // Obtener referencias a elementos del DOM
  tablaTransacciones = document.getElementById('tabla-transacciones');
  
  // Configurar fechas por defecto si no están configuradas
  const fechaInicio = document.getElementById('fecha-inicio');
  const fechaFin = document.getElementById('fecha-fin');
  
  if (fechaInicio && !fechaInicio.value) {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    fechaInicio.valueAsDate = inicioMes;
  }
  
  if (fechaFin && !fechaFin.value) {
    fechaFin.valueAsDate = new Date();
  }
  
  // Generar reporte inicial
  if (fechaInicio && fechaInicio.value && fechaFin && fechaFin.value) {
    await generarReporte(fechaInicio.value, fechaFin.value, 'general');
  }
}

/**
 * Genera un reporte financiero según los parámetros
 * @param {string} fechaInicio - Fecha de inicio del período
 * @param {string} fechaFin - Fecha de fin del período
 * @param {string} tipoReporte - Tipo de reporte a generar
 */
async function generarReporte(fechaInicio, fechaFin, tipoReporte) {
  try {
    // Mostrar indicador de carga
    window.utils.mostrarNotificacion('Generando reporte...', 'info');
    
    // Obtener datos
    const registros = await window.api.obtenerRegistros();
    
    // Filtrar por fecha
    const registrosFiltrados = registros.filter(r => {
      return r.fecha >= fechaInicio && r.fecha <= fechaFin;
    });
    
    // Separar por tipo
    const ingresos = registrosFiltrados.filter(r => r.tipo === 'ingreso');
    const gastosFijos = registrosFiltrados.filter(r => r.tipo === 'gasto-fijo' || r.tipo === 'mensual');
    const gastosVariables = registrosFiltrados.filter(r => r.tipo === 'gasto-variable' || r.tipo === 'diario');
    
    // Actualizar resumen
    actualizarResumenReporte(ingresos, gastosFijos, gastosVariables);
    
    // Generar gráficos según el tipo de reporte
    switch (tipoReporte) {
      case 'ingresos':
        generarGraficosIngresos(ingresos);
        break;
      case 'gastos':
        generarGraficosGastos(gastosFijos, gastosVariables);
        break;
      case 'comparativo':
        generarGraficosComparativos(ingresos, gastosFijos, gastosVariables);
        break;
      case 'general':
      default:
        generarGraficosGenerales(ingresos, gastosFijos, gastosVariables);
        break;
    }
    
    // Actualizar tabla de transacciones
    actualizarTablaTransacciones(registrosFiltrados);
    
    window.utils.mostrarNotificacion('Reporte generado correctamente', 'success');
  } catch (error) {
    console.error('Error al generar reporte:', error);
    window.utils.mostrarNotificacion('Error al generar el reporte', 'error');
  }
}

/**
 * Actualiza el resumen del reporte
 * @param {Array} ingresos - Ingresos del período
 * @param {Array} gastosFijos - Gastos fijos del período
 * @param {Array} gastosVariables - Gastos variables del período
 */
function actualizarResumenReporte(ingresos, gastosFijos, gastosVariables) {
  // Calcular totales
  const totalIngresos = window.utils.calcularSuma(ingresos, 'monto');
  const totalGastosFijos = window.utils.calcularSuma(gastosFijos, 'monto');
  const totalGastosVariables = window.utils.calcularSuma(gastosVariables, 'monto');
  const balance = totalIngresos - totalGastosFijos - totalGastosVariables;
  
  // Actualizar elementos del DOM
  document.getElementById('reporte-ingresos-total').textContent = window.utils.formatearMoneda(totalIngresos);
  document.getElementById('reporte-gastos-fijos').textContent = window.utils.formatearMoneda(totalGastosFijos);
  document.getElementById('reporte-gastos-variables').textContent = window.utils.formatearMoneda(totalGastosVariables);
  
  const balanceElement = document.getElementById('reporte-balance');
  balanceElement.textContent = window.utils.formatearMoneda(balance);
  
  // Aplicar color según el balance
  if (balance > 0) {
    balanceElement.classList.remove('text-red-600');
    balanceElement.classList.add('text-green-600');
  } else {
    balanceElement.classList.remove('text-green-600');
    balanceElement.classList.add('text-red-600');
  }
}

/**
 * Actualiza la tabla de transacciones
 * @param {Array} registros - Registros a mostrar
 */
function actualizarTablaTransacciones(registros) {
  if (!tablaTransacciones) return;
  
  // Limpiar tabla
  const tbody = tablaTransacciones.querySelector('tbody') || tablaTransacciones;
  tbody.innerHTML = '';
  
  // Si no hay registros, mostrar mensaje
  if (registros.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="5" class="text-center py-4">No hay transacciones en el período seleccionado</td>';
    tbody.appendChild(tr);
    return;
  }
  
  // Ordenar por fecha (más reciente primero)
  const registrosOrdenados = [...registros].sort((a, b) => {
    if (a.fecha > b.fecha) return -1;
    if (a.fecha < b.fecha) return 1;
    return 0;
  });
  
  // Crear filas
  registrosOrdenados.forEach(registro => {
    const tr = document.createElement('tr');
    
    // Determinar tipo y categoría
    let tipo = 'Desconocido';
    let categoria = '';
    
    if (registro.tipo === 'ingreso') {
      tipo = 'Ingreso';
      categoria = registro.fuente || '';
    } else if (registro.tipo === 'gasto-fijo' || registro.tipo === 'mensual') {
      tipo = 'Gasto Fijo';
      categoria = registro.origen || '';
    } else if (registro.tipo === 'gasto-variable' || registro.tipo === 'diario') {
      tipo = 'Gasto Variable';
      categoria = registro['medio-pago'] || '';
    }
    
    // Determinar clase para el monto
    const montoClass = registro.tipo === 'ingreso' ? 'amount-positive' : 'amount-negative';
    
    tr.innerHTML = `
      <td class="p-2">${window.utils.formatearFecha(registro.fecha)}</td>
      <td class="p-2">${tipo}</td>
      <td class="p-2">${registro.concepto || ''}</td>
      <td class="p-2">${categoria}</td>
      <td class="p-2 ${montoClass}">${window.utils.formatearMoneda(registro.monto)}</td>
    `;
    
    tbody.appendChild(tr);
  });
}

/**
 * Genera gráficos generales para el reporte
 * @param {Array} ingresos - Ingresos del período
 * @param {Array} gastosFijos - Gastos fijos del período
 * @param {Array} gastosVariables - Gastos variables del período
 */
function generarGraficosGenerales(ingresos, gastosFijos, gastosVariables) {
  // Gráfico de evolución (ingresos vs gastos por mes)
  generarGraficoEvolucion(ingresos, gastosFijos, gastosVariables);
  
  // Gráfico de distribución de gastos
  generarGraficoDistribucion(gastosFijos, gastosVariables);
  
  // Gráficos de tendencias
  generarGraficoTendenciaIngresos(ingresos);
  generarGraficoTendenciaGastos(gastosFijos, gastosVariables);
}
