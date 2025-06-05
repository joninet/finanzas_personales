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
