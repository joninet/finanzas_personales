/**
 * API para interactuar con Google Sheets a través de SheetDB
 */

// URLs de la API de SheetDB
const SHEETDB_URL = "https://sheetdb.io/api/v1/vve96i4bamp4d";
const SHEETDB_SETTINGS_URL = "https://sheetdb.io/api/v1/vve96i4bamp4d/sheet/ajustes";

/**
 * Obtiene todos los registros de la hoja de cálculo
 * @returns {Promise<Array>} - Promesa que resuelve a un array de registros
 */
async function obtenerRegistros() {
  try {
    const response = await fetch(SHEETDB_URL);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener registros:", error);
    return [];
  }
}

/**
 * Guarda un nuevo registro en la hoja de cálculo
 * @param {Object} registro - Objeto con los datos a guardar
 * @returns {Promise<Object>} - Promesa que resuelve al registro guardado
 */
async function guardarRegistro(registro) {
  try {
    // Agregar un ID único al registro
    registro.id = generarId();
    
    const response = await fetch(SHEETDB_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [registro] })
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al guardar registro:", error);
    throw error;
  }
}

/**
 * Actualiza un registro existente en la hoja de cálculo
 * @param {string} id - ID del registro a actualizar
 * @param {Object} datos - Datos actualizados
 * @returns {Promise<Object>} - Promesa que resuelve a los datos actualizados
 */
async function actualizarRegistro(id, datos) {
  try {
    const response = await fetch(`${SHEETDB_URL}/id/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: datos })
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al actualizar registro:", error);
    throw error;
  }
}

/**
 * Elimina un registro de la hoja de cálculo
 * @param {string} id - ID del registro a eliminar
 * @returns {Promise<void>}
 */
async function eliminarRegistro(id) {
  try {
    const response = await fetch(`${SHEETDB_URL}/id/${id}`, { 
      method: "DELETE" 
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error al eliminar registro:", error);
    throw error;
  }
}

/**
 * Genera un ID único para nuevos registros
 * @returns {string} - ID único
 */
function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Filtra registros por tipo
 * @param {Array} registros - Array de registros
 * @param {string} tipo - Tipo de registro a filtrar
 * @returns {Array} - Registros filtrados
 */
function filtrarPorTipo(registros, tipo) {
  return registros.filter(registro => registro.tipo === tipo);
}

/**
 * Filtra registros por fecha
 * @param {Array} registros - Array de registros
 * @param {string} fechaInicio - Fecha de inicio (formato YYYY-MM-DD)
 * @param {string} fechaFin - Fecha de fin (formato YYYY-MM-DD)
 * @returns {Array} - Registros filtrados
 */
function filtrarPorFecha(registros, fechaInicio, fechaFin) {
  return registros.filter(registro => {
    const fecha = registro.fecha;
    return fecha >= fechaInicio && fecha <= fechaFin;
  });
}

/**
 * Obtiene el mes actual en formato YYYY-MM
 * @returns {string} - Mes actual en formato YYYY-MM
 */
function obtenerMesActual() {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Obtiene el primer día del mes actual
 * @returns {string} - Primer día del mes en formato YYYY-MM-DD
 */
function obtenerPrimerDiaMes() {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-01`;
}

/**
 * Obtiene el último día del mes actual
 * @returns {string} - Último día del mes en formato YYYY-MM-DD
 */
function obtenerUltimoDiaMes() {
  const fecha = new Date();
  const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(ultimoDia.getDate()).padStart(2, '0')}`;
}
/**
 * Obtiene los medios de pago/origen desde Google Sheets
 * @returns {Promise<Array<string>>} - Promesa que resuelve a un array de medios de pago
 */
async function obtenerMediosPago() {
  try {
    const response = await fetch(SHEETDB_SETTINGS_URL);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();
    
    // Buscar el registro de tipo 'medios-pago'
    const medioPagoSettings = data.find(item => item.tipo === 'medios-pago');
    
    if (medioPagoSettings && medioPagoSettings.valores) {
      // Si existe y tiene valores, dividir la cadena en un array
      return JSON.parse(medioPagoSettings.valores);
    } else {
      // Valores por defecto si no hay configuración
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
      
      // Guardar los valores por defecto
      await guardarMediosPago(valoresPorDefecto);
      return valoresPorDefecto;
    }
  } catch (error) {
    console.error('Error al obtener medios de pago:', error);
    // En caso de error, retornar valores por defecto
    return [
      'Efectivo',
      'Tarjeta de Crédito',
      'Tarjeta de Débito',
      'Transferencia',
      'Sueldo',
      'Freelance',
      'Inversiones',
      'Otros'
    ];
  }
}

/**
 * Guarda los medios de pago/origen en Google Sheets
 * @param {Array<string>} medios - Lista de medios de pago
 * @returns {Promise<boolean>} - Promesa que resuelve a true si se guardó correctamente
 */
async function guardarMediosPago(medios) {
  try {
    // Obtener los ajustes actuales
    const response = await fetch(SHEETDB_SETTINGS_URL);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    const medioPagoSettings = data.find(item => item.tipo === 'medios-pago');
    
    // Convertir el array a JSON string
    const valoresJSON = JSON.stringify(medios);
    
    if (medioPagoSettings) {
      // Actualizar el registro existente
      await fetch(`${SHEETDB_SETTINGS_URL}/tipo/medios-pago`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { valores: valoresJSON } })
      });
    } else {
      // Crear un nuevo registro
      await fetch(SHEETDB_SETTINGS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          data: [{ 
            tipo: 'medios-pago', 
            valores: valoresJSON 
          }] 
        })
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error al guardar medios de pago:', error);
    return false;
  }
}

/**
 * Agrega un nuevo medio de pago/origen
 * @param {string} medio - Medio de pago/origen a agregar
 * @returns {Promise<boolean>} - Promesa que resuelve a true si se agregó correctamente
 */
async function agregarMedioPago(medio) {
  try {
    if (!medio || typeof medio !== 'string' || medio.trim() === '') {
      return false;
    }
    
    // Obtener los medios actuales
    const medios = await obtenerMediosPago();
    
    // Verificar si ya existe
    if (medios.includes(medio)) {
      return false;
    }
    
    // Agregar y guardar
    medios.push(medio);
    return await guardarMediosPago(medios);
  } catch (error) {
    console.error('Error al agregar medio de pago:', error);
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
    // Obtener los medios actuales
    const medios = await obtenerMediosPago();
    const indice = medios.indexOf(medio);
    
    if (indice === -1) {
      return false;
    }
    
    // Eliminar y guardar
    medios.splice(indice, 1);
    return await guardarMediosPago(medios);
  } catch (error) {
    console.error('Error al eliminar medio de pago:', error);
    return false;
  }
}

// Exportar funciones
window.api = {
  obtenerRegistros,
  guardarRegistro,
  actualizarRegistro,
  eliminarRegistro,
  filtrarPorTipo,
  filtrarPorFecha,
  obtenerMesActual,
  obtenerPrimerDiaMes,
  obtenerUltimoDiaMes,
  obtenerMediosPago,
  agregarMedioPago,
  eliminarMedioPago
};
