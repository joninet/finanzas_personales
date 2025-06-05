/**
 * Funcionalidad para la gestión de gastos diarios
 */

// Referencias a elementos del DOM
let tablaGastosDiarios = null;
let formularioGastoDiario = null;
let totalGastosDiarios = null;
let totalPorCategoria = null;

/**
 * Inicializa la funcionalidad de gastos diarios
 */
async function inicializarGastosDiarios() {
  // Obtener referencias a elementos del DOM
  tablaGastosDiarios = document.getElementById('tabla-gastos-diarios');
  formularioGastoDiario = document.getElementById('form-gasto-diario');
  totalGastosDiarios = document.getElementById('total-gastos-diarios');
  totalPorCategoria = document.getElementById('total-por-categoria');
  
  // Configurar eventos
  if (formularioGastoDiario) {
    formularioGastoDiario.addEventListener('submit', manejarSubmitGastoDiario);
  }
  
  // Inicializar fecha con la fecha actual
  const inputFecha = document.getElementById('fecha-gasto');
  if (inputFecha) {
    inputFecha.valueAsDate = new Date();
  }
  
  // Cargar datos iniciales
  await cargarGastosDiarios();
}

/**
 * Maneja el envío del formulario de gasto diario
 * @param {Event} evento - Evento de submit
 */
async function manejarSubmitGastoDiario(evento) {
  evento.preventDefault();
  
  try {
    // Obtener datos del formulario
    const formData = new FormData(formularioGastoDiario);
    
    const gastoDiario = {
      tipo: 'gasto',
      categoria: 'variable',
      concepto: formData.get('concepto'),
      monto: Number(formData.get('monto')),
      medioPago: formData.get('medio-pago'),
      fecha: formData.get('fecha'),
      observaciones: formData.get('observaciones') || ''
    };
    
    // Validar datos
    if (!gastoDiario.concepto || !gastoDiario.monto || !gastoDiario.fecha) {
      window.utils.mostrarNotificacion('Por favor complete todos los campos requeridos', 'warning');
      return;
    }
    
    // Guardar gasto diario
    await window.api.guardarRegistro(gastoDiario);
    
    // Limpiar formulario (excepto la fecha)
    const fechaActual = formularioGastoDiario.elements['fecha'].value;
    formularioGastoDiario.reset();
    formularioGastoDiario.elements['fecha'].value = fechaActual;
    
    // Recargar datos
    await cargarGastosDiarios();
    
    // Mostrar notificación
    window.utils.mostrarNotificacion('Gasto diario agregado correctamente', 'success');
  } catch (error) {
    console.error('Error al guardar gasto diario:', error);
    window.utils.mostrarNotificacion('Error al guardar el gasto diario', 'error');
  }
}

/**
 * Carga los gastos diarios desde la API
 */
async function cargarGastosDiarios() {
  try {
    console.log('Iniciando carga de gastos diarios...');
    
    // Obtener todos los registros
    const registros = await window.api.obtenerRegistros();
    console.log('Registros obtenidos:', registros ? registros.length : 0);
    
    // Verificar que registros sea un array
    if (!Array.isArray(registros)) {
      console.error('Los registros recibidos no son un array');
      throw new Error('Formato de datos inválido');
    }
    
    // Filtrar solo gastos diarios (variables) con validación adicional
    const gastosDiarios = registros.filter(r => {
      // Validación básica para asegurarnos de que es un objeto válido
      if (!r || typeof r !== 'object') return false;
      
      return r.tipo === 'gasto' && r.categoria === 'variable';
    });
    
    console.log('Gastos diarios filtrados:', gastosDiarios.length);
    
    // Renderizar tabla
    renderizarTablaGastosDiarios(gastosDiarios);
    
    // Actualizar totales
    actualizarTotalesGastosDiarios(gastosDiarios);
    
    return gastosDiarios;
  } catch (error) {
    console.error('Error al cargar gastos diarios:', error);
    window.utils.mostrarNotificacion('Error al cargar los gastos diarios', 'error');
    
    // Intentar mostrar una tabla vacía para evitar UI rota
    try {
      renderizarTablaGastosDiarios([]);
      actualizarTotalesGastosDiarios([]);
    } catch (uiError) {
      console.error('Error al renderizar UI vacía:', uiError);
    }
    
    return [];
  }
}

/**
 * Renderiza la tabla de gastos diarios
 * @param {Array} gastosDiarios - Gastos diarios a mostrar
 */
function renderizarTablaGastosDiarios(gastosDiarios) {
  if (!tablaGastosDiarios) return;
  
  // Limpiar tabla
  const tbody = tablaGastosDiarios.querySelector('tbody') || tablaGastosDiarios;
  tbody.innerHTML = '';
  
  // Si no hay gastos, mostrar mensaje
  if (gastosDiarios.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="6" class="text-center py-4">No hay gastos diarios registrados</td>';
    tbody.appendChild(tr);
    return;
  }
  
  // Ordenar por fecha (más reciente primero)
  const gastosDiariosOrdenados = [...gastosDiarios].sort((a, b) => {
    if (a.fecha > b.fecha) return -1;
    if (a.fecha < b.fecha) return 1;
    return 0;
  });
  
  // Crear filas
  gastosDiariosOrdenados.forEach(gasto => {
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
      <td class="p-2">${window.utils.formatearFecha(gasto.fecha)}</td>
      <td class="p-2">${gasto.concepto || ''}</td>
      <td class="p-2">${window.utils.formatearMoneda(gasto.monto)}</td>
      <td class="p-2">${gasto.medioPago || ''}</td>
      <td class="p-2">${gasto.observaciones || ''}</td>
      <td class="p-2">
        <button class="btn btn-danger btn-sm" onclick="eliminarGastoDiario('${gasto.id}')">
          Eliminar
        </button>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
}

/**
 * Actualiza los totales de gastos diarios
 * @param {Array} gastosDiarios - Gastos diarios
 */
function actualizarTotalesGastosDiarios(gastosDiarios) {
  // Calcular total
  const total = window.utils.calcularSuma(gastosDiarios, 'monto');
  
  // Actualizar elemento del DOM
  if (totalGastosDiarios) {
    totalGastosDiarios.textContent = window.utils.formatearMoneda(total);
  }
  
  // Calcular totales por categoría (concepto)
  const totalesPorCategoria = window.utils.calcularTotalesPorCategoria(gastosDiarios, 'concepto', 'monto');
  
  // Actualizar elemento del DOM
  if (totalPorCategoria) {
    totalPorCategoria.innerHTML = '';
    
    // Ordenar categorías por monto (de mayor a menor)
    const categorias = Object.entries(totalesPorCategoria)
      .sort((a, b) => b[1] - a[1]);
    
    // Crear elementos para cada categoría
    categorias.forEach(([categoria, monto]) => {
      const li = document.createElement('li');
      li.className = 'mb-2';
      li.innerHTML = `
        <span class="font-medium">${categoria}:</span> 
        <span class="amount-negative">${window.utils.formatearMoneda(monto)}</span>
      `;
      totalPorCategoria.appendChild(li);
    });
  }
}

/**
 * Elimina un gasto diario
 * @param {string} id - ID del gasto a eliminar
 */
async function eliminarGastoDiario(id) {
  if (!confirm('¿Está seguro de eliminar este gasto?')) {
    return;
  }
  
  try {
    await window.api.eliminarRegistro(id);
    await cargarGastosDiarios();
    window.utils.mostrarNotificacion('Gasto eliminado correctamente', 'success');
  } catch (error) {
    console.error('Error al eliminar gasto diario:', error);
    window.utils.mostrarNotificacion('Error al eliminar el gasto', 'error');
  }
}

/**
 * Filtra los gastos diarios por fecha
 * @param {string} fechaInicio - Fecha de inicio
 * @param {string} fechaFin - Fecha de fin
 */
async function filtrarPorFecha(fechaInicio, fechaFin) {
  try {
    // Obtener todos los registros
    const registros = await window.api.obtenerRegistros();
    
    // Filtrar por tipo y fecha
    const gastosFiltrados = registros.filter(r => {
      return r.tipo === 'gasto' && 
             r.categoria === 'variable' && 
             r.fecha >= fechaInicio && 
             r.fecha <= fechaFin;
    });
    
    // Renderizar tabla
    renderizarTablaGastosDiarios(gastosFiltrados);
    
    // Actualizar totales
    actualizarTotalesGastosDiarios(gastosFiltrados);
  } catch (error) {
    console.error('Error al filtrar gastos:', error);
    window.utils.mostrarNotificacion('Error al filtrar los gastos', 'error');
  }
}

// Exportar funciones
window.gastosDiarios = {
  inicializar: inicializarGastosDiarios,
  cargar: cargarGastosDiarios,
  eliminar: eliminarGastoDiario,
  filtrar: filtrarPorFecha
};
