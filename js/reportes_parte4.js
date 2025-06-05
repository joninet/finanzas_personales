/**
 * Genera el gráfico de distribución de gastos por categoría
 * @param {Array} gastosFijos - Gastos fijos del período
 * @param {Array} gastosVariables - Gastos variables del período
 */
function generarGraficoDistribucion(gastosFijos, gastosVariables) {
  const canvas = document.getElementById('grafico-distribucion');
  if (!canvas) return;
  
  // Destruir gráfico anterior si existe
  if (graficos.distribucion) {
    graficos.distribucion.destroy();
  }
  
  // Combinar todos los gastos
  const todosLosGastos = [...gastosFijos, ...gastosVariables];
  
  // Calcular totales por concepto
  const totalesPorConcepto = {};
  todosLosGastos.forEach(gasto => {
    const concepto = gasto.concepto || 'Sin concepto';
    totalesPorConcepto[concepto] = (totalesPorConcepto[concepto] || 0) + Number(gasto.monto);
  });
  
  // Convertir a arrays para el gráfico
  const conceptos = Object.keys(totalesPorConcepto);
  const valores = conceptos.map(concepto => totalesPorConcepto[concepto]);
  
  // Generar colores
  const colores = window.utils.generarColores(conceptos.length);
  
  // Crear gráfico
  graficos.distribucion = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: conceptos,
      datasets: [{
        data: valores,
        backgroundColor: colores,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: 'Distribución de Gastos por Concepto'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw;
              const percentage = (value / valores.reduce((a, b) => a + b, 0) * 100).toFixed(1);
              return `${label}: ${value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Genera el gráfico de distribución de ingresos por fuente
 * @param {Array} ingresos - Ingresos del período
 */
function generarGraficoDistribucionIngresos(ingresos) {
  const canvas = document.getElementById('grafico-distribucion');
  if (!canvas) return;
  
  // Destruir gráfico anterior si existe
  if (graficos.distribucion) {
    graficos.distribucion.destroy();
  }
  
  // Calcular totales por fuente
  const totalesPorFuente = {};
  ingresos.forEach(ingreso => {
    const fuente = ingreso.fuente || 'Sin especificar';
    totalesPorFuente[fuente] = (totalesPorFuente[fuente] || 0) + Number(ingreso.monto);
  });
  
  // Convertir a arrays para el gráfico
  const fuentes = Object.keys(totalesPorFuente);
  const valores = fuentes.map(fuente => totalesPorFuente[fuente]);
  
  // Generar colores
  const colores = window.utils.generarColores(fuentes.length);
  
  // Crear gráfico
  graficos.distribucion = new Chart(canvas, {
    type: 'pie',
    data: {
      labels: fuentes,
      datasets: [{
        data: valores,
        backgroundColor: colores,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: 'Distribución de Ingresos por Fuente'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw;
              const percentage = (value / valores.reduce((a, b) => a + b, 0) * 100).toFixed(1);
              return `${label}: ${value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}
