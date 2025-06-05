/**
 * Genera el gráfico de tendencia de ingresos
 * @param {Array} ingresos - Ingresos del período
 */
function generarGraficoTendenciaIngresos(ingresos) {
  const canvas = document.getElementById('grafico-tendencia-ingresos');
  if (!canvas) return;
  
  // Destruir gráfico anterior si existe
  if (graficos.tendenciaIngresos) {
    graficos.tendenciaIngresos.destroy();
  }
  
  // Ordenar ingresos por fecha
  const ingresosOrdenados = [...ingresos].sort((a, b) => {
    if (a.fecha < b.fecha) return -1;
    if (a.fecha > b.fecha) return 1;
    return 0;
  });
  
  // Agrupar por fecha
  const fechas = [];
  const montos = [];
  const acumulado = [];
  let total = 0;
  
  ingresosOrdenados.forEach(ingreso => {
    fechas.push(window.utils.formatearFecha(ingreso.fecha));
    montos.push(Number(ingreso.monto));
    total += Number(ingreso.monto);
    acumulado.push(total);
  });
  
  // Crear gráfico
  graficos.tendenciaIngresos = new Chart(canvas, {
    type: 'line',
    data: {
      labels: fechas,
      datasets: [
        {
          label: 'Ingresos',
          data: montos,
          borderColor: 'rgb(75, 192, 75)',
          backgroundColor: 'rgba(75, 192, 75, 0.1)',
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3
        },
        {
          label: 'Acumulado',
          data: acumulado,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          borderDash: [5, 5]
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
          text: 'Tendencia de Ingresos'
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

/**
 * Genera el gráfico de tendencia de gastos
 * @param {Array} gastosFijos - Gastos fijos del período
 * @param {Array} gastosVariables - Gastos variables del período
 */
function generarGraficoTendenciaGastos(gastosFijos, gastosVariables) {
  const canvas = document.getElementById('grafico-tendencia-gastos');
  if (!canvas) return;
  
  // Destruir gráfico anterior si existe
  if (graficos.tendenciaGastos) {
    graficos.tendenciaGastos.destroy();
  }
  
  // Combinar todos los gastos
  const todosLosGastos = [...gastosFijos, ...gastosVariables];
  
  // Ordenar gastos por fecha
  const gastosOrdenados = [...todosLosGastos].sort((a, b) => {
    if (a.fecha < b.fecha) return -1;
    if (a.fecha > b.fecha) return 1;
    return 0;
  });
  
  // Agrupar por fecha
  const fechas = [];
  const montos = [];
  const acumulado = [];
  let total = 0;
  
  gastosOrdenados.forEach(gasto => {
    fechas.push(window.utils.formatearFecha(gasto.fecha));
    montos.push(Number(gasto.monto));
    total += Number(gasto.monto);
    acumulado.push(total);
  });
  
  // Crear gráfico
  graficos.tendenciaGastos = new Chart(canvas, {
    type: 'line',
    data: {
      labels: fechas,
      datasets: [
        {
          label: 'Gastos',
          data: montos,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3
        },
        {
          label: 'Acumulado',
          data: acumulado,
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.1)',
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          borderDash: [5, 5]
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
          text: 'Tendencia de Gastos'
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
