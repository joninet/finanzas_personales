/**
 * API para interactuar con Google Sheets a través de SheetDB
 */

// URL de la API de SheetDB
const SHEETDB_URL = "https://sheetdb.io/api/v1/vve96i4bamp4d";

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
  obtenerUltimoDiaMes
};
