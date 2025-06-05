/**
 * Funcionalidad para la gestión de gastos mensuales fijos
 */

// Referencias a elementos del DOM
let tablaGastosMensuales = null;
let formularioGastoMensual = null;
let totalGastosMensuales = null;
let totalPendiente = null;
let totalPagado = null;

/**
 * Inicializa la funcionalidad de gastos mensuales
 */
async function inicializarGastosMensuales() {
  // Obtener referencias a elementos del DOM
  tablaGastosMensuales = document.getElementById('tabla-gastos-mensuales');
  formularioGastoMensual = document.getElementById('form-gasto-mensual');
  totalGastosMensuales = document.getElementById('total-gastos-mensuales');
  totalPendiente = document.getElementById('total-pendiente');
  totalPagado = document.getElementById('total-pagado');
  
  // Configurar eventos
  if (formularioGastoMensual) {
    formularioGastoMensual.addEventListener('submit', manejarSubmitGastoMensual);
  }
  
  // Cargar datos iniciales
  await cargarGastosMensuales();
}

/**
 * Maneja el envío del formulario de gasto mensual
 * @param {Event} evento - Evento de submit
 */
async function manejarSubmitGastoMensual(evento) {
  evento.preventDefault();
  
  try {
    // Obtener datos del formulario
    const formData = new FormData(formularioGastoMensual);
    
    const gastoMensual = {
      tipo: 'gasto',
      categoria: 'fijo',
      concepto: formData.get('concepto'),
      monto: Number(formData.get('monto')),
      origen: formData.get('origen'),
      estado: formData.get('estado'),
      fecha: formData.get('fecha'),
      observaciones: formData.get('observaciones') || ''
    };
    
    // Validar datos
    if (!gastoMensual.concepto || !gastoMensual.monto || !gastoMensual.fecha) {
      window.utils.mostrarNotificacion('Por favor complete todos los campos requeridos', 'warning');
      return;
    }
    
    // Guardar gasto mensual
    await window.api.guardarRegistro(gastoMensual);
    
    // Limpiar formulario
    formularioGastoMensual.reset();
    
    // Recargar datos
    await cargarGastosMensuales();
    
    // Mostrar notificación
    window.utils.mostrarNotificacion('Gasto mensual agregado correctamente', 'success');
  } catch (error) {
    console.error('Error al guardar gasto mensual:', error);
    window.utils.mostrarNotificacion('Error al guardar el gasto mensual', 'error');
  }
}

/**
 * Carga los gastos mensuales desde la API
 */
async function cargarGastosMensuales() {
  try {
    // Obtener todos los registros
    const registros = await window.api.obtenerRegistros();
    
    // Filtrar solo gastos mensuales fijos
    const gastosMensuales = registros.filter(r => r.tipo === 'gasto' && r.categoria === 'fijo');
    
    // Renderizar tabla
    renderizarTablaGastosMensuales(gastosMensuales);
    
    // Actualizar totales
    actualizarTotalesGastosMensuales(gastosMensuales);
    
    return gastosMensuales;
  } catch (error) {
    console.error('Error al cargar gastos mensuales:', error);
    window.utils.mostrarNotificacion('Error al cargar los gastos mensuales', 'error');
    return [];
  }
}

/**
 * Renderiza la tabla de gastos mensuales
 * @param {Array} gastosMensuales - Gastos mensuales a mostrar
 */
function renderizarTablaGastosMensuales(gastosMensuales) {
  if (!tablaGastosMensuales) return;
  
  // Limpiar tabla
  const tbody = tablaGastosMensuales.querySelector('tbody') || tablaGastosMensuales;
  tbody.innerHTML = '';
  
  // Si no hay gastos, mostrar mensaje
  if (gastosMensuales.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="7" class="text-center py-4">No hay gastos mensuales registrados</td>';
    tbody.appendChild(tr);
    return;
  }
  
  // Ordenar por fecha
  const gastosMensualesOrdenados = [...gastosMensuales].sort((a, b) => {
    if (a.fecha < b.fecha) return -1;
    if (a.fecha > b.fecha) return 1;
    return 0;
  });
  
  // Crear filas
  gastosMensualesOrdenados.forEach(gasto => {
    const tr = document.createElement('tr');
    
    // Determinar clase de estado
    let estadoClass = '';
    switch (gasto.estado?.toLowerCase()) {
      case 'pendiente':
        estadoClass = 'status-pending';
        break;
      case 'cancelado':
      case 'pagado':
        estadoClass = 'status-paid';
        break;
      default:
        estadoClass = '';
    }
    
    tr.innerHTML = `
      <td class="p-2">${gasto.concepto || ''}</td>
      <td class="p-2">${window.utils.formatearMoneda(gasto.monto)}</td>
      <td class="p-2">${gasto.origen || ''}</td>
      <td class="p-2"><span class="status-badge ${estadoClass}">${gasto.estado || ''}</span></td>
      <td class="p-2">${window.utils.formatearFecha(gasto.fecha)}</td>
      <td class="p-2">${gasto.observaciones || ''}</td>
      <td class="p-2">
        <button class="btn btn-danger btn-sm" onclick="eliminarGastoMensual('${gasto.id}')">
          Eliminar
        </button>
        <button class="btn btn-secondary btn-sm ml-2" onclick="cambiarEstadoGasto('${gasto.id}', '${gasto.estado === 'Pendiente' ? 'Cancelado' : 'Pendiente'}')">
          ${gasto.estado === 'Pendiente' ? 'Marcar Pagado' : 'Marcar Pendiente'}
        </button>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
}

/**
 * Actualiza los totales de gastos mensuales
 * @param {Array} gastosMensuales - Gastos mensuales
 */
function actualizarTotalesGastosMensuales(gastosMensuales) {
  // Calcular totales
  const total = window.utils.calcularSuma(gastosMensuales, 'monto');
  
  // Calcular total pendiente y pagado
  const pendientes = gastosMensuales.filter(g => g.estado === 'Pendiente');
  const pagados = gastosMensuales.filter(g => g.estado === 'Cancelado' || g.estado === 'Pagado');
  
  const totalPendienteValor = window.utils.calcularSuma(pendientes, 'monto');
  const totalPagadoValor = window.utils.calcularSuma(pagados, 'monto');
  
  // Actualizar elementos del DOM
  if (totalGastosMensuales) {
    totalGastosMensuales.textContent = window.utils.formatearMoneda(total);
  }
  
  if (totalPendiente) {
    totalPendiente.textContent = window.utils.formatearMoneda(totalPendienteValor);
  }
  
  if (totalPagado) {
    totalPagado.textContent = window.utils.formatearMoneda(totalPagadoValor);
  }
}

/**
 * Elimina un gasto mensual
 * @param {string} id - ID del gasto a eliminar
 */
async function eliminarGastoMensual(id) {
  if (!confirm('¿Está seguro de eliminar este gasto mensual?')) {
    return;
  }
  
  try {
    await window.api.eliminarRegistro(id);
    await cargarGastosMensuales();
    window.utils.mostrarNotificacion('Gasto mensual eliminado correctamente', 'success');
  } catch (error) {
    console.error('Error al eliminar gasto mensual:', error);
    window.utils.mostrarNotificacion('Error al eliminar el gasto mensual', 'error');
  }
}

/**
 * Cambia el estado de un gasto
 * @param {string} id - ID del gasto
 * @param {string} nuevoEstado - Nuevo estado
 */
async function cambiarEstadoGasto(id, nuevoEstado) {
  try {
    await window.api.actualizarRegistro(id, { estado: nuevoEstado });
    await cargarGastosMensuales();
    window.utils.mostrarNotificacion(`Gasto marcado como ${nuevoEstado}`, 'success');
  } catch (error) {
    console.error('Error al cambiar estado del gasto:', error);
    window.utils.mostrarNotificacion('Error al cambiar el estado del gasto', 'error');
  }
}

// Exportar funciones
window.gastosMensuales = {
  inicializar: inicializarGastosMensuales,
  cargar: cargarGastosMensuales,
  eliminar: eliminarGastoMensual,
  cambiarEstado: cambiarEstadoGasto
};
