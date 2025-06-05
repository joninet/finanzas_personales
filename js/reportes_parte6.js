/**
 * Genera el gráfico de balance acumulado
 * @param {Array} ingresos - Ingresos del período
 * @param {Array} gastosFijos - Gastos fijos del período
 * @param {Array} gastosVariables - Gastos variables del período
 */
function generarGraficoBalanceAcumulado(ingresos, gastosFijos, gastosVariables) {
  const canvas = document.getElementById('grafico-evolucion');
  if (!canvas) return;
  
  // Destruir gráfico anterior si existe
  if (graficos.evolucion) {
    graficos.evolucion.destroy();
  }
  
  // Combinar todos los registros
  const todosLosRegistros = [...ingresos, ...gastosFijos, ...gastosVariables];
  
  // Ordenar registros por fecha
  const registrosOrdenados = [...todosLosRegistros].sort((a, b) => {
    if (a.fecha < b.fecha) return -1;
    if (a.fecha > b.fecha) return 1;
    return 0;
  });
  
  // Calcular balance acumulado
  const fechas = [];
  const balanceAcumulado = [];
  let acumulado = 0;
  
  registrosOrdenados.forEach(registro => {
    const monto = Number(registro.monto);
    // Los ingresos suman, los gastos restan
    if (registro.tipo === 'ingreso') {
      acumulado += monto;
    } else {
      acumulado -= monto;
    }
    
    fechas.push(window.utils.formatearFecha(registro.fecha));
    balanceAcumulado.push(acumulado);
  });
  
  // Crear gráfico
  graficos.evolucion = new Chart(canvas, {
    type: 'line',
    data: {
      labels: fechas,
      datasets: [{
        label: 'Balance Acumulado',
        data: balanceAcumulado,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          
          if (!chartArea) {
            return null;
          }
          
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0.5, 'rgba(255, 99, 132, 0.2)');
          gradient.addColorStop(0.5, 'rgba(75, 192, 75, 0.2)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3
      }]
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
          text: 'Balance Acumulado'
        }
      },
      scales: {
        y: {
          beginAtZero: false,
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
 * Agrupa datos de ingresos y gastos por mes
 * @param {Array} ingresos - Ingresos del período
 * @param {Array} gastosFijos - Gastos fijos del período
 * @param {Array} gastosVariables - Gastos variables del período
 * @returns {Object} Datos agrupados por mes
 */
function agruparDatosPorMes(ingresos, gastosFijos, gastosVariables) {
  // Inicializar resultados
  const resultado = {
    meses: [],
    ingresos: [],
    gastosFijos: [],
    gastosVariables: []
  };
  
  // Obtener rango de meses
  const fechas = [...ingresos, ...gastosFijos, ...gastosVariables].map(r => r.fecha);
  if (fechas.length === 0) return resultado;
  
  // Encontrar fecha mínima y máxima
  const fechaMin = new Date(Math.min(...fechas.map(f => new Date(f))));
  const fechaMax = new Date(Math.max(...fechas.map(f => new Date(f))));
  
  // Crear array de meses en el rango
  const meses = [];
  const mesInicio = fechaMin.getMonth();
  const anioInicio = fechaMin.getFullYear();
  const mesFin = fechaMax.getMonth();
  const anioFin = fechaMax.getFullYear();
  
  let mesActual = mesInicio;
  let anioActual = anioInicio;
  
  while (anioActual < anioFin || (anioActual === anioFin && mesActual <= mesFin)) {
    const nombreMes = new Date(anioActual, mesActual).toLocaleString('es', { month: 'short' });
    const textoMes = `${nombreMes} ${anioActual}`;
    meses.push({
      texto: textoMes,
      mes: mesActual,
      anio: anioActual
    });
    
    mesActual++;
    if (mesActual > 11) {
      mesActual = 0;
      anioActual++;
    }
  }
  
  // Calcular totales por mes
  meses.forEach(mesInfo => {
    resultado.meses.push(mesInfo.texto);
    
    // Ingresos del mes
    const ingresosMes = ingresos.filter(i => {
      const fecha = new Date(i.fecha);
      return fecha.getMonth() === mesInfo.mes && fecha.getFullYear() === mesInfo.anio;
    });
    resultado.ingresos.push(window.utils.calcularSuma(ingresosMes, 'monto'));
    
    // Gastos fijos del mes
    const gastosFijosMes = gastosFijos.filter(g => {
      const fecha = new Date(g.fecha);
      return fecha.getMonth() === mesInfo.mes && fecha.getFullYear() === mesInfo.anio;
    });
    resultado.gastosFijos.push(window.utils.calcularSuma(gastosFijosMes, 'monto'));
    
    // Gastos variables del mes
    const gastosVariablesMes = gastosVariables.filter(g => {
      const fecha = new Date(g.fecha);
      return fecha.getMonth() === mesInfo.mes && fecha.getFullYear() === mesInfo.anio;
    });
    resultado.gastosVariables.push(window.utils.calcularSuma(gastosVariablesMes, 'monto'));
  });
  
  return resultado;
}

// Exportar funciones
window.reportes = {
  inicializar: inicializarReportes,
  generarReporte: generarReporte
};
