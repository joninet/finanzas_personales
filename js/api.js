/**
 * API para interactuar con Google Sheets a través de SheetDB
 */

// URLs de la API de SheetDB - usar la URL base original
const SHEETDB_URL = "https://sheetdb.io/api/v1/vve96i4bamp4d";

/**
 * Obtiene todos los registros de la hoja de cálculo, excluyendo registros de configuración
 * @returns {Promise<Array>} - Promesa que resuelve a un array de registros financieros
 */
async function obtenerRegistros() {
  console.log('Iniciando obtenerRegistros()...');
  
  try {
    // Obtener datos de la API
    const response = await fetch(SHEETDB_URL);
    if (!response.ok) {
      console.error(`Error HTTP al obtener datos: ${response.status}`);
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    console.log('Respuesta HTTP OK, obteniendo datos JSON...');
    const data = await response.json();
    
    // Asegurarse de que los datos son un array
    if (!Array.isArray(data)) {
      console.error('Los datos recibidos no son un array:', data);
      return [];
    }
    
    console.log('Total de registros sin filtrar:', data.length);
    
    // Mostrar datos para debugging
    if (data.length > 0) {
      console.log('Primer registro ejemplo:', JSON.stringify(data[0]));
    }
    
    // Filtrar los registros de configuración con verificación más robusta
    const registrosFiltrados = data.filter(item => {
      // Asegurarse de que el ítem es un objeto válido
      if (!item || typeof item !== 'object') {
        return false;
      }
      
      // Filtrar registros de configuración
      return item.tipo !== 'configuracion';
    });
    
    console.log('Total registros filtrados (excluyendo configuración):', registrosFiltrados.length);
    return registrosFiltrados;
  } catch (error) {
    console.error('Error al obtener registros:', error);
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
 * Función auxiliar para obtener todos los datos brutos de la hoja
 * @returns {Promise<Array>} - Todos los registros sin filtrar
 * @private
 */
async function _obtenerTodosLosRegistros() {
  try {
    const response = await fetch(SHEETDB_URL);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error al obtener registros brutos:", error);
    return [];
  }
}

/**
 * Obtiene los medios de pago/origen desde Google Sheets
 * @returns {Promise<Array<string>>} - Promesa que resuelve a un array de medios de pago
 */
async function obtenerMediosPago() {
  try {
    const data = await _obtenerTodosLosRegistros();
    
    // Buscar el registro de tipo 'configuracion' y categoria 'medios-pago'
    const medioPagoSettings = data.find(item => item.tipo === 'configuracion' && item.categoria === 'medios-pago');
    
    if (medioPagoSettings && medioPagoSettings.concepto) {
      try {
        // Intentar analizar el JSON
        return JSON.parse(medioPagoSettings.concepto);
      } catch (parseError) {
        console.error('Error al analizar los medios de pago:', parseError);
        // Si hay error de parseo, retornar los valores por defecto
        return getDefaultMediosPago();
      }
    } else {
      // Valores por defecto si no hay configuración
      const valoresPorDefecto = getDefaultMediosPago();
      
      // Guardar los valores por defecto
      await guardarMediosPago(valoresPorDefecto);
      return valoresPorDefecto;
    }
  } catch (error) {
    console.error('Error al obtener medios de pago:', error);
    // En caso de error, retornar valores por defecto
    return getDefaultMediosPago();
  }
}

/**
 * Obtiene los valores por defecto para medios de pago
 * @returns {Array<string>} - Array de medios de pago por defecto
 */
function getDefaultMediosPago() {
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

/**
 * Guarda los medios de pago/origen en Google Sheets
 * @param {Array<string>} medios - Lista de medios de pago
 * @returns {Promise<boolean>} - Promesa que resuelve a true si se guardó correctamente
 */
async function guardarMediosPago(medios) {
  console.log('Iniciando guardarMediosPago con:', medios);
  
  // Validar que medios sea un array
  if (!Array.isArray(medios)) {
    console.error('guardarMediosPago: El parámetro medios no es un array');
    return false;
  }
  
  try {
    // Obtener todos los registros para buscar la configuración
    console.log('Obteniendo todos los registros...');
    const data = await _obtenerTodosLosRegistros();
    console.log('Registros obtenidos:', data.length);
    
    const medioPagoSettings = Array.isArray(data) ? 
      data.find(item => item && item.tipo === 'configuracion' && item.categoria === 'medios-pago') : 
      null;
    
    console.log('Configuración de medios de pago encontrada:', medioPagoSettings ? 'Sí' : 'No');
    
    // Convertir el array a JSON string
    const valoresJSON = JSON.stringify(medios);
    console.log('JSON de medios de pago:', valoresJSON);
    
    if (medioPagoSettings && medioPagoSettings.id) {
      console.log('Actualizando registro existente con ID:', medioPagoSettings.id);
      // Actualizar el registro existente
      try {
        const response = await fetch(`${SHEETDB_URL}/id/${medioPagoSettings.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: { concepto: valoresJSON } })
        });
        
        if (!response.ok) {
          console.error(`Error HTTP al actualizar: ${response.status}`);
          throw new Error(`Error al actualizar medios de pago: ${response.status}`);
        }
        
        console.log('Actualización exitosa');
      } catch (updateError) {
        console.error('Error en la actualización:', updateError);
        throw updateError;
      }
    } else {
      console.log('Creando nuevo registro de configuración...');
      // Crear un nuevo registro con ID único
      const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
      
      try {
        // Crear directamente con fetch en lugar de usar guardarRegistro
        const response = await fetch(SHEETDB_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: [{
              id: id,
              tipo: 'configuracion',
              categoria: 'medios-pago',
              concepto: valoresJSON,
              fecha: new Date().toISOString().split('T')[0] // Fecha actual en formato YYYY-MM-DD
            }]
          })
        });
        
        if (!response.ok) {
          console.error(`Error HTTP al crear: ${response.status}`);
          throw new Error(`Error al crear registro de medios de pago: ${response.status}`);
        }
        
        console.log('Creación exitosa con ID:', id);
      } catch (createError) {
        console.error('Error en la creación:', createError);
        throw createError;
      }
    }
    
    console.log('guardarMediosPago completado exitosamente');
    return true;
  } catch (error) {
    console.error('Error general en guardarMediosPago:', error);
    
    // Intento de recuperación como último recurso
    try {
      console.log('Intentando método alternativo de guardar medios de pago...');
      localStorage.setItem('medios_pago_backup', JSON.stringify(medios));
      console.log('Respaldo guardado en localStorage');
    } catch (backupError) {
      console.error('No se pudo crear respaldo en localStorage:', backupError);
    }
    
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
      console.error('Medio de pago inválido');
      return false;
    }
    
    // Obtener los medios actuales
    const medios = await obtenerMediosPago();
    
    // Verificar si ya existe
    if (medios.includes(medio)) {
      console.log('El medio de pago ya existe, no se agregará');
      return false;
    }
    
    // Agregar y guardar
    console.log('Agregando medio de pago:', medio);
    medios.push(medio);
    const resultado = await guardarMediosPago(medios);
    console.log('Medio de pago guardado:', resultado ? 'exitoso' : 'fallido');
    return resultado;
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
      console.log('Medio de pago no encontrado para eliminar:', medio);
      return false;
    }
    
    // Eliminar y guardar
    console.log('Eliminando medio de pago:', medio);
    medios.splice(indice, 1);
    const resultado = await guardarMediosPago(medios);
    console.log('Medio de pago eliminado:', resultado ? 'exitoso' : 'fallido');
    return resultado;
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
