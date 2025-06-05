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

// El STORAGE_KEY está definido más abajo en el archivo

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
 * Obtiene los medios de pago disponibles
 * @returns {Promise<Array<string>>} - Promesa que resuelve a un array de medios de pago
 */
async function obtenerMediosPago() {
  try {
    // Intentar recuperar los medios de pago de localStorage
    const mediosGuardados = localStorage.getItem(STORAGE_KEY);
    if (mediosGuardados) {
      const medios = JSON.parse(mediosGuardados);
      if (Array.isArray(medios) && medios.length > 0) {
        return medios;
      }
    }
  } catch (error) {
    console.error('Error al obtener medios de pago de localStorage:', error);
  }
  
  // Si no hay datos en localStorage o hay un error, usar valores predeterminados
  const mediosDefault = [
    'Efectivo',
    'Tarjeta de Crédito',
    'Tarjeta de Débito',
    'Transferencia',
    'Sueldo',
    'Freelance',
    'Inversiones',
    'Otros'
  ];
  
  // Guardar los valores predeterminados en localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mediosDefault));
  } catch (error) {
    console.error('Error al guardar medios de pago en localStorage:', error);
  }
  
  return mediosDefault;
}

/**
 * Agrega un nuevo medio de pago/origen
 * @param {string} medio - Medio de pago/origen a agregar
 * @returns {Promise<boolean>} - Promesa que resuelve a true si se agregó correctamente
 */
async function agregarMedioPago(medio) {
  try {
    // Validación básica
    if (!medio || typeof medio !== 'string' || medio.trim() === '') {
      console.error('Medio de pago inválido');
      return false;
    }
    
    // Obtener medios actuales
    const mediosActuales = await obtenerMediosPago();
    
    // Verificar si ya existe
    if (mediosActuales.includes(medio)) {
      return false; // Ya existe, no hacer nada
    }
    
    // Agregar el nuevo medio
    mediosActuales.push(medio);
    
    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mediosActuales));
    
    return true;
  } catch (error) {
    console.error('Error en utils.agregarMedioPago:', error);
    return false;
  }
}

/**
 * Elimina un medio de pago/origen
 * @param {string} medio - Medio de pago/origen a eliminar
 * @returns {Promise<boolean>} - Promesa que resuelve a true si se eliminó correctamente
 */
async function eliminarMedioPago(medio) {
  try {
    // Validación básica
    if (!medio || typeof medio !== 'string' || medio.trim() === '') {
      console.error('Medio de pago inválido para eliminar');
      return false;
    }
    
    // Obtener medios actuales
    const mediosActuales = await obtenerMediosPago();
    
    // Verificar si existe el medio a eliminar
    const index = mediosActuales.indexOf(medio);
    if (index === -1) {
      return false; // No existe, no hacer nada
    }
    
    // Eliminar el medio
    mediosActuales.splice(index, 1);
    
    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mediosActuales));
    
    return true;
  } catch (error) {
    console.error('Error en utils.eliminarMedioPago:', error);
    return false;
  }
}

/**
 * Rellena un selector con los medios de pago disponibles
 * @param {HTMLSelectElement} selector - Elemento select a rellenar
 */
async function rellenarSelectorMediosPago(selector) {
  if (!selector) {
    console.warn('No se proporcionó un selector válido para rellenar');
    return;
  }
  
  try {
    // Limpiar opciones actuales
    selector.innerHTML = '';
    
    // Agregar opción por defecto
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Seleccione...';
    selector.appendChild(defaultOption);
    
    // Obtener medios de pago (ahora provienen del array interno)
    const mediosPago = await obtenerMediosPago();
    
    // Agregar opciones
    mediosPago.forEach(medio => {
      const option = document.createElement('option');
      option.value = medio;
      option.textContent = medio;
      selector.appendChild(option);
    });
  } catch (error) {
    console.error('Error al rellenar selector de medios de pago:', error);
    
    // En caso de error, agregar opciones por defecto
    selector.innerHTML = '';
    
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Seleccione...';
    selector.appendChild(defaultOption);
    
    ['Efectivo', 'Tarjeta de Crédito', 'Transferencia'].forEach(medio => {
      const option = document.createElement('option');
      option.value = medio;
      option.textContent = medio;
      selector.appendChild(option);
    });
  }
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
