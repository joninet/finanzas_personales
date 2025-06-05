/**
 * Funcionalidad del Dashboard
 */

// Referencias a elementos del DOM
let resumenIngresos = null;
let resumenGastosFijos = null;
let resumenGastosVariables = null;
let resumenBalance = null;
let resumenMes = null;

// Gráficos
let graficoBalance = null;
let graficoGastosPorCategoria = null;

/**
 * Inicializa el dashboard
 */
async function inicializarDashboard() {
  // Obtener referencias a elementos del DOM
  resumenIngresos = document.getElementById('resumen-ingresos');
  resumenGastosFijos = document.getElementById('resumen-gastos-fijos');
  resumenGastosVariables = document.getElementById('resumen-gastos-variables');
  resumenBalance = document.getElementById('resumen-balance');
  resumenMes = document.getElementById('resumen-mes');
  
  // Actualizar datos del dashboard
  await actualizarDashboard();
  
  // Inicializar gráficos
  inicializarGraficos();
}

/**
 * Actualiza los datos del dashboard
 */
async function actualizarDashboard() {
  try {
    // Obtener todos los registros
    const registros = await window.api.obtenerRegistros();
    
    // Filtrar registros del mes actual
    const mesActual = window.api.obtenerMesActual();
    const registrosMes = registros.filter(r => r.fecha && r.fecha.startsWith(mesActual));
    
    // Calcular totales
    const ingresos = calcularTotalIngresos(registrosMes);
    const gastosFijos = calcularTotalGastosFijos(registrosMes);
    const gastosVariables = calcularTotalGastosVariables(registrosMes);
    const balance = ingresos - gastosFijos - gastosVariables;
    
    // Actualizar elementos del DOM
    if (resumenIngresos) resumenIngresos.textContent = window.utils.formatearMoneda(ingresos);
    if (resumenGastosFijos) resumenGastosFijos.textContent = window.utils.formatearMoneda(gastosFijos);
    if (resumenGastosVariables) resumenGastosVariables.textContent = window.utils.formatearMoneda(gastosVariables);
    if (resumenBalance) {
      resumenBalance.textContent = window.utils.formatearMoneda(balance);
      resumenBalance.classList.remove('amount-positive', 'amount-negative');
      resumenBalance.classList.add(balance >= 0 ? 'amount-positive' : 'amount-negative');
    }
    if (resumenMes) resumenMes.textContent = window.utils.obtenerMesActualTexto();
    
    // Actualizar gráficos
    actualizarGraficos(registrosMes);
    
    return {
      ingresos,
      gastosFijos,
      gastosVariables,
      balance,
      registros: registrosMes
    };
  } catch (error) {
    console.error('Error al actualizar dashboard:', error);
    window.utils.mostrarNotificacion('Error al cargar los datos del dashboard', 'error');
  }
}

/**
 * Calcula el total de ingresos
 * @param {Array} registros - Registros a procesar
 * @returns {number} - Total de ingresos
 */
function calcularTotalIngresos(registros) {
  return registros
    .filter(r => r.tipo === 'ingreso')
    .reduce((total, r) => total + Number(r.monto || 0), 0);
}

/**
 * Calcula el total de gastos fijos
 * @param {Array} registros - Registros a procesar
 * @returns {number} - Total de gastos fijos
 */
function calcularTotalGastosFijos(registros) {
  return registros
    .filter(r => r.tipo === 'gasto' && r.categoria === 'fijo')
    .reduce((total, r) => total + Number(r.monto || 0), 0);
}

/**
 * Calcula el total de gastos variables
 * @param {Array} registros - Registros a procesar
 * @returns {number} - Total de gastos variables
 */
function calcularTotalGastosVariables(registros) {
  return registros
    .filter(r => r.tipo === 'gasto' && r.categoria !== 'fijo')
    .reduce((total, r) => total + Number(r.monto || 0), 0);
}

/**
 * Inicializa los gráficos del dashboard
 */
function inicializarGraficos() {
  // Verificar si Chart.js está disponible
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js no está disponible. Los gráficos no se mostrarán.');
    return;
  }
  
  // Inicializar gráfico de balance
  const ctxBalance = document.getElementById('grafico-balance');
  if (ctxBalance) {
    graficoBalance = new Chart(ctxBalance, {
      type: 'bar',
      data: {
        labels: ['Ingresos', 'Gastos Fijos', 'Gastos Variables'],
        datasets: [{
          data: [0, 0, 0],
          backgroundColor: ['#10b981', '#ef4444', '#f59e0b']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return window.utils.formatearMoneda(context.raw);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return window.utils.formatearMoneda(value);
              }
            }
          }
        }
      }
    });
  }
  
  // Inicializar gráfico de gastos por categoría
  const ctxCategorias = document.getElementById('grafico-categorias');
  if (ctxCategorias) {
    graficoGastosPorCategoria = new Chart(ctxCategorias, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: []
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = window.utils.formatearMoneda(context.raw);
                const percentage = Math.round(context.parsed * 100 / context.dataset.data.reduce((a, b) => a + b, 0)) + '%';
                return `${label}: ${value} (${percentage})`;
              }
            }
          }
        }
      }
    });
  }
}

/**
 * Actualiza los gráficos con nuevos datos
 * @param {Array} registros - Registros a mostrar en los gráficos
 */
function actualizarGraficos(registros) {
  // Actualizar gráfico de balance
  if (graficoBalance) {
    const ingresos = calcularTotalIngresos(registros);
    const gastosFijos = calcularTotalGastosFijos(registros);
    const gastosVariables = calcularTotalGastosVariables(registros);
    
    graficoBalance.data.datasets[0].data = [ingresos, gastosFijos, gastosVariables];
    graficoBalance.update();
  }
  
  // Actualizar gráfico de gastos por categoría
  if (graficoGastosPorCategoria) {
    // Filtrar solo gastos
    const gastos = registros.filter(r => r.tipo === 'gasto');
    
    // Calcular totales por categoría
    const totalesPorCategoria = window.utils.calcularTotalesPorCategoria(gastos, 'concepto', 'monto');
    
    // Preparar datos para el gráfico
    const categorias = Object.keys(totalesPorCategoria);
    const valores = Object.values(totalesPorCategoria);
    const colores = window.utils.generarPaletaColores(categorias.length);
    
    // Actualizar gráfico
    graficoGastosPorCategoria.data.labels = categorias;
    graficoGastosPorCategoria.data.datasets[0].data = valores;
    graficoGastosPorCategoria.data.datasets[0].backgroundColor = colores;
    graficoGastosPorCategoria.update();
  }
}

// Exportar funciones
window.dashboard = {
  inicializar: inicializarDashboard,
  actualizar: actualizarDashboard
};
