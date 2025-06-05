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
