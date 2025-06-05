/**
 * Funcionalidad para la gestión de ingresos
 */

// Referencias a elementos del DOM
let tablaIngresos = null;
let formularioIngreso = null;
let totalIngresos = null;
let totalPorFuente = null;

/**
 * Inicializa la funcionalidad de ingresos
 */
async function inicializarIngresos() {
  // Obtener referencias a elementos del DOM
  tablaIngresos = document.getElementById('tabla-ingresos');
  formularioIngreso = document.getElementById('form-ingreso');
  totalIngresos = document.getElementById('total-ingresos');
  totalPorFuente = document.getElementById('total-por-fuente');
  
  // Configurar eventos
  if (formularioIngreso) {
    formularioIngreso.addEventListener('submit', manejarSubmitIngreso);
  }
  
  // Inicializar fecha con la fecha actual
  const inputFecha = document.getElementById('fecha-ingreso');
  if (inputFecha) {
    inputFecha.valueAsDate = new Date();
  }
  
  // Cargar datos iniciales
  await cargarIngresos();
}

/**
 * Maneja el envío del formulario de ingreso
 * @param {Event} evento - Evento de submit
 */
async function manejarSubmitIngreso(evento) {
  evento.preventDefault();
  
  try {
    // Obtener datos del formulario
    const formData = new FormData(formularioIngreso);
    
    const ingreso = {
      tipo: 'ingreso',
      concepto: formData.get('concepto'),
      monto: Number(formData.get('monto')),
      fuente: formData.get('fuente'),
      fecha: formData.get('fecha'),
      observaciones: formData.get('observaciones') || ''
    };
    
    // Validar datos
    if (!ingreso.concepto || !ingreso.monto || !ingreso.fecha) {
      window.utils.mostrarNotificacion('Por favor complete todos los campos requeridos', 'warning');
      return;
    }
    
    // Guardar ingreso
    await window.api.guardarRegistro(ingreso);
    
    // Limpiar formulario (excepto la fecha)
    const fechaActual = formularioIngreso.elements['fecha'].value;
    formularioIngreso.reset();
    formularioIngreso.elements['fecha'].value = fechaActual;
    
    // Recargar datos
    await cargarIngresos();
    
    // Mostrar notificación
    window.utils.mostrarNotificacion('Ingreso agregado correctamente', 'success');
    
    // Actualizar dashboard si existe
    if (window.dashboard && typeof window.dashboard.actualizar === 'function') {
      window.dashboard.actualizar();
    }
  } catch (error) {
    console.error('Error al guardar ingreso:', error);
    window.utils.mostrarNotificacion('Error al guardar el ingreso', 'error');
  }
}

/**
 * Carga los ingresos desde la API
 */
async function cargarIngresos() {
  try {
    // Obtener todos los registros
    const registros = await window.api.obtenerRegistros();
    
    // Filtrar solo ingresos
    const ingresos = registros.filter(r => r.tipo === 'ingreso');
    
    // Renderizar tabla
    renderizarTablaIngresos(ingresos);
    
    // Actualizar totales
    actualizarTotalesIngresos(ingresos);
    
    return ingresos;
  } catch (error) {
    console.error('Error al cargar ingresos:', error);
    window.utils.mostrarNotificacion('Error al cargar los ingresos', 'error');
    return [];
  }
}

/**
 * Renderiza la tabla de ingresos
 * @param {Array} ingresos - Ingresos a mostrar
 */
function renderizarTablaIngresos(ingresos) {
  if (!tablaIngresos) return;
  
  // Limpiar tabla
  const tbody = tablaIngresos.querySelector('tbody') || tablaIngresos;
  tbody.innerHTML = '';
  
  // Si no hay ingresos, mostrar mensaje
  if (ingresos.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="6" class="text-center py-4">No hay ingresos registrados</td>';
    tbody.appendChild(tr);
    return;
  }
  
  // Ordenar por fecha (más reciente primero)
  const ingresosOrdenados = [...ingresos].sort((a, b) => {
    if (a.fecha > b.fecha) return -1;
    if (a.fecha < b.fecha) return 1;
    return 0;
  });
  
  // Crear filas
  ingresosOrdenados.forEach(ingreso => {
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
      <td class="p-2">${window.utils.formatearFecha(ingreso.fecha)}</td>
      <td class="p-2">${ingreso.concepto || ''}</td>
      <td class="p-2 amount-positive">${window.utils.formatearMoneda(ingreso.monto)}</td>
      <td class="p-2">${ingreso.fuente || ''}</td>
      <td class="p-2">${ingreso.observaciones || ''}</td>
      <td class="p-2">
        <button class="btn btn-danger btn-sm" onclick="eliminarIngreso('${ingreso.id}')">
          Eliminar
        </button>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
}

/**
 * Actualiza los totales de ingresos
 * @param {Array} ingresos - Ingresos
 */
function actualizarTotalesIngresos(ingresos) {
  // Calcular total
  const total = window.utils.calcularSuma(ingresos, 'monto');
  
  // Actualizar elemento del DOM
  if (totalIngresos) {
    totalIngresos.textContent = window.utils.formatearMoneda(total);
  }
  
  // Calcular totales por fuente
  const totalesPorFuente = window.utils.calcularTotalesPorCategoria(ingresos, 'fuente', 'monto');
  
  // Actualizar elemento del DOM
  if (totalPorFuente) {
    totalPorFuente.innerHTML = '';
    
    // Ordenar fuentes por monto (de mayor a menor)
    const fuentes = Object.entries(totalesPorFuente)
      .sort((a, b) => b[1] - a[1]);
    
    // Crear elementos para cada fuente
    fuentes.forEach(([fuente, monto]) => {
      const li = document.createElement('li');
      li.className = 'mb-2';
      li.innerHTML = `
        <span class="font-medium">${fuente || 'Sin especificar'}:</span> 
        <span class="amount-positive">${window.utils.formatearMoneda(monto)}</span>
      `;
      totalPorFuente.appendChild(li);
    });
  }
}

/**
 * Elimina un ingreso
 * @param {string} id - ID del ingreso a eliminar
 */
async function eliminarIngreso(id) {
  if (!confirm('¿Está seguro de eliminar este ingreso?')) {
    return;
  }
  
  try {
    await window.api.eliminarRegistro(id);
    await cargarIngresos();
    window.utils.mostrarNotificacion('Ingreso eliminado correctamente', 'success');
    
    // Actualizar dashboard si existe
    if (window.dashboard && typeof window.dashboard.actualizar === 'function') {
      window.dashboard.actualizar();
    }
  } catch (error) {
    console.error('Error al eliminar ingreso:', error);
    window.utils.mostrarNotificacion('Error al eliminar el ingreso', 'error');
  }
}

/**
 * Filtra los ingresos por fecha
 * @param {string} fechaInicio - Fecha de inicio
 * @param {string} fechaFin - Fecha de fin
 */
async function filtrarPorFecha(fechaInicio, fechaFin) {
  try {
    // Obtener todos los registros
    const registros = await window.api.obtenerRegistros();
    
    // Filtrar por tipo y fecha
    const ingresosFiltrados = registros.filter(r => {
      return r.tipo === 'ingreso' && 
             r.fecha >= fechaInicio && 
             r.fecha <= fechaFin;
    });
    
    // Renderizar tabla
    renderizarTablaIngresos(ingresosFiltrados);
    
    // Actualizar totales
    actualizarTotalesIngresos(ingresosFiltrados);
  } catch (error) {
    console.error('Error al filtrar ingresos:', error);
    window.utils.mostrarNotificacion('Error al filtrar los ingresos', 'error');
  }
}

// Exportar funciones
window.ingresos = {
  inicializar: inicializarIngresos,
  cargar: cargarIngresos,
  eliminar: eliminarIngreso,
  filtrar: filtrarPorFecha
};
