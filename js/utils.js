/**
 * Utilidades para la aplicación de finanzas personales
 */

/**
 * Formatea un número como moneda (ARS)
 * @param {number} valor - Valor a formatear
 * @returns {string} - Valor formateado como moneda
 */
function formatearMoneda(valor) {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return '$0,00';
  }
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(valor);
}

/**
 * Formatea una fecha en formato legible
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {string} - Fecha formateada
 */
function formatearFecha(fecha) {
  if (!fecha) return '';
  
  const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(fecha).toLocaleDateString('es-AR', opciones);
}

/**
 * Obtiene el mes y año actual en formato legible
 * @returns {string} - Mes y año actual
 */
function obtenerMesActualTexto() {
  const fecha = new Date();
  return fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}

/**
 * Calcula la suma de valores de un array de objetos
 * @param {Array} items - Array de objetos
 * @param {string} propiedad - Propiedad numérica a sumar
 * @returns {number} - Suma total
 */
function calcularSuma(items, propiedad) {
  return items.reduce((total, item) => {
    const valor = Number(item[propiedad] || 0);
    return total + (isNaN(valor) ? 0 : valor);
  }, 0);
}

/**
 * Agrupa un array de objetos por una propiedad
 * @param {Array} items - Array de objetos
 * @param {string} propiedad - Propiedad por la que agrupar
 * @returns {Object} - Objeto con los items agrupados
 */
function agruparPor(items, propiedad) {
  return items.reduce((resultado, item) => {
    const clave = item[propiedad] || 'Sin categoría';
    if (!resultado[clave]) {
      resultado[clave] = [];
    }
    resultado[clave].push(item);
    return resultado;
  }, {});
}

/**
 * Calcula totales por categoría
 * @param {Array} items - Array de objetos
 * @param {string} propiedadCategoria - Propiedad de categoría
 * @param {string} propiedadValor - Propiedad de valor
 * @returns {Object} - Objeto con los totales por categoría
 */
function calcularTotalesPorCategoria(items, propiedadCategoria, propiedadValor) {
  return items.reduce((resultado, item) => {
    const categoria = item[propiedadCategoria] || 'Sin categoría';
    const valor = Number(item[propiedadValor] || 0);
    
    if (!resultado[categoria]) {
      resultado[categoria] = 0;
    }
    
    resultado[categoria] += isNaN(valor) ? 0 : valor;
    return resultado;
  }, {});
}

/**
 * Genera un color aleatorio en formato hexadecimal
 * @returns {string} - Color en formato hexadecimal
 */
function generarColorAleatorio() {
  const letras = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letras[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * Genera una paleta de colores para gráficos
 * @param {number} cantidad - Cantidad de colores a generar
 * @returns {Array} - Array de colores en formato hexadecimal
 */
function generarPaletaColores(cantidad) {
  // Colores predefinidos para categorías comunes
  const coloresPredefinidos = {
    'Alquiler': '#FF6384',
    'Servicios': '#36A2EB',
    'Alimentación': '#FFCE56',
    'Transporte': '#4BC0C0',
    'Salud': '#9966FF',
    'Educación': '#FF9F40',
    'Entretenimiento': '#8AC249',
    'Ingresos': '#2ECC71',
    'Tarjeta': '#E74C3C',
    'Sueldo': '#3498DB'
  };
  
  // Colores base para generar variaciones
  const coloresBase = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#8AC249', '#2ECC71', '#E74C3C', '#3498DB'
  ];
  
  const resultado = [];
  
  // Si la cantidad es menor o igual a los colores base, usar esos
  if (cantidad <= coloresBase.length) {
    return coloresBase.slice(0, cantidad);
  }
  
  // Agregar todos los colores base
  resultado.push(...coloresBase);
  
  // Generar colores adicionales
  for (let i = coloresBase.length; i < cantidad; i++) {
    resultado.push(generarColorAleatorio());
  }
  
  return resultado;
}

/**
 * Actualiza el estado activo de los enlaces de navegación
 * @param {string} seccionActiva - ID de la sección activa
 */
function actualizarNavegacionActiva(seccionActiva) {
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === `#${seccionActiva}`) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Muestra un mensaje de notificación
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de mensaje (success, error, warning, info)
 * @param {number} duracion - Duración en milisegundos
 */
function mostrarNotificacion(mensaje, tipo = 'info', duracion = 3000) {
  // Crear elemento de notificación
  const notificacion = document.createElement('div');
  notificacion.className = `notificacion notificacion-${tipo}`;
  notificacion.textContent = mensaje;
  
  // Agregar al DOM
  document.body.appendChild(notificacion);
  
  // Mostrar con animación
  setTimeout(() => {
    notificacion.classList.add('mostrar');
  }, 10);
  
  // Ocultar después de la duración
  setTimeout(() => {
    notificacion.classList.remove('mostrar');
    setTimeout(() => {
      document.body.removeChild(notificacion);
    }, 300);
  }, duracion);
}

/**
 * Inicializa el toggle del sidebar
 */
function inicializarSidebar() {
  const toggleBtn = document.querySelector('.toggle-sidebar');
  const sidebar = document.querySelector('.sidebar');
  const content = document.querySelector('.content');
  
  if (toggleBtn && sidebar && content) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('sidebar-collapsed');
      sidebar.classList.toggle('sidebar-expanded');
      content.classList.toggle('content-expanded');
    });
  }
}

/**
 * Gestiona los medios de pago/origen disponibles
 */
const STORAGE_KEY = 'finanzas_personales_medios';

/**
 * Obtiene los medios de pago/origen disponibles
 * @returns {Array} - Lista de medios de pago/origen
 */
function obtenerMediosPago() {
  // Valores por defecto
  const valoresPorDefecto = [
    'Efectivo',
    'Tarjeta de Crédito',
    'Tarjeta de Débito',
    'Transferencia',
    'Sueldo',
    'Freelance',
    'Inversiones',
    'Otros'
  ];
  
  // Intentar obtener del localStorage
  try {
    const valoresGuardados = localStorage.getItem(STORAGE_KEY);
    if (valoresGuardados) {
      return JSON.parse(valoresGuardados);
    }
    
    // Si no hay valores guardados, guardar los valores por defecto
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valoresPorDefecto));
  } catch (error) {
    console.error('Error al obtener medios de pago:', error);
  }
  
  return valoresPorDefecto;
}

/**
 * Agrega un nuevo medio de pago/origen
 * @param {string} medio - Medio de pago/origen a agregar
 * @returns {boolean} - Si se agregó correctamente
 */
function agregarMedioPago(medio) {
  if (!medio || typeof medio !== 'string' || medio.trim() === '') {
    return false;
  }
  
  try {
    const medios = obtenerMediosPago();
    
    // Verificar si ya existe
    if (medios.includes(medio)) {
      return false;
    }
    
    // Agregar y guardar
    medios.push(medio);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medios));
    return true;
  } catch (error) {
    console.error('Error al agregar medio de pago:', error);
    return false;
  }
}

/**
 * Elimina un medio de pago/origen
 * @param {string} medio - Medio de pago/origen a eliminar
 * @returns {boolean} - Si se eliminó correctamente
 */
function eliminarMedioPago(medio) {
  try {
    const medios = obtenerMediosPago();
    const indice = medios.indexOf(medio);
    
    if (indice === -1) {
      return false;
    }
    
    // Eliminar y guardar
    medios.splice(indice, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medios));
    return true;
  } catch (error) {
    console.error('Error al eliminar medio de pago:', error);
    return false;
  }
}

/**
 * Rellena un selector con las opciones de medios de pago/origen
 * @param {HTMLSelectElement} selector - Elemento select a rellenar
 */
function rellenarSelectorMediosPago(selector) {
  if (!selector) return;
  
  const medios = obtenerMediosPago();
  
  // Limpiar selector
  selector.innerHTML = '';
  
  // Agregar opción vacía
  const optionVacia = document.createElement('option');
  optionVacia.value = '';
  optionVacia.textContent = '-- Seleccionar --';
  selector.appendChild(optionVacia);
  
  // Agregar opciones de medios de pago
  medios.forEach(medio => {
    const option = document.createElement('option');
    option.value = medio;
    option.textContent = medio;
    selector.appendChild(option);
  });
}

// Exportar funciones
window.utils = {
  formatearMoneda,
  formatearFecha,
  obtenerMesActualTexto,
  calcularSuma,
  agruparPor,
  calcularTotalesPorCategoria,
  generarColorAleatorio,
  generarPaletaColores,
  actualizarNavegacionActiva,
  mostrarNotificacion,
  inicializarSidebar,
  obtenerMediosPago,
  agregarMedioPago,
  eliminarMedioPago,
  rellenarSelectorMediosPago
};
