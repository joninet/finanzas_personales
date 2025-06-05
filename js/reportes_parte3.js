/**
 * Genera gráficos específicos para ingresos
 * @param {Array} ingresos - Ingresos del período
 */
function generarGraficosIngresos(ingresos) {
  // Gráfico de tendencia de ingresos
  generarGraficoTendenciaIngresos(ingresos);
  
  // Gráfico de distribución de ingresos por fuente
  generarGraficoDistribucionIngresos(ingresos);
}

/**
 * Genera gráficos específicos para gastos
 * @param {Array} gastosFijos - Gastos fijos del período
 * @param {Array} gastosVariables - Gastos variables del período
 */
function generarGraficosGastos(gastosFijos, gastosVariables) {
  // Gráfico de distribución de gastos
  generarGraficoDistribucion(gastosFijos, gastosVariables);
  
  // Gráfico de tendencia de gastos
  generarGraficoTendenciaGastos(gastosFijos, gastosVariables);
}

/**
 * Genera gráficos comparativos de ingresos vs gastos
 * @param {Array} ingresos - Ingresos del período
 * @param {Array} gastosFijos - Gastos fijos del período
 * @param {Array} gastosVariables - Gastos variables del período
 */
function generarGraficosComparativos(ingresos, gastosFijos, gastosVariables) {
  // Gráfico de evolución (ingresos vs gastos por mes)
  generarGraficoEvolucion(ingresos, gastosFijos, gastosVariables);
  
  // Gráfico de balance acumulado
  generarGraficoBalanceAcumulado(ingresos, gastosFijos, gastosVariables);
}

/**
 * Genera el gráfico de evolución de ingresos y gastos por mes
 * @param {Array} ingresos - Ingresos del período
 * @param {Array} gastosFijos - Gastos fijos del período
 * @param {Array} gastosVariables - Gastos variables del período
 */
function generarGraficoEvolucion(ingresos, gastosFijos, gastosVariables) {
  const canvas = document.getElementById('grafico-evolucion');
  if (!canvas) return;
  
  // Destruir gráfico anterior si existe
  if (graficos.evolucion) {
    graficos.evolucion.destroy();
  }
  
  // Agrupar datos por mes
  const datosPorMes = agruparDatosPorMes(ingresos, gastosFijos, gastosVariables);
  
  // Crear gráfico
  graficos.evolucion = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: datosPorMes.meses,
      datasets: [
        {
          label: 'Ingresos',
          data: datosPorMes.ingresos,
          backgroundColor: 'rgba(75, 192, 75, 0.5)',
          borderColor: 'rgb(75, 192, 75)',
          borderWidth: 1
        },
        {
          label: 'Gastos Fijos',
          data: datosPorMes.gastosFijos,
          backgroundColor: 'rgba(255, 159, 64, 0.5)',
          borderColor: 'rgb(255, 159, 64)',
          borderWidth: 1
        },
        {
          label: 'Gastos Variables',
          data: datosPorMes.gastosVariables,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Evolución Mensual de Ingresos y Gastos'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
            }
          }
        }
      }
    }
  });
}
