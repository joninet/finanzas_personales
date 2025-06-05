// Script de emergencia para reparar los selectores de medios de pago
// Este script debe cargarse al final de la página

(function() {
  // Constante para localStorage
  const STORAGE_KEY = 'finanzas_medios_pago';
  
  // Medios de pago por defecto
  const MEDIOS_DEFAULT = [
    'Efectivo',
    'Tarjeta de Crédito',
    'Tarjeta de Débito',
    'Transferencia',
    'Sueldo',
    'Freelance',
    'Inversiones',
    'Otros'
  ];
  
  // Función principal para inicializar todos los selectores de medios de pago
  function inicializarMediosPago() {
    console.log('Inicializando medios de pago...');
    
    // Obtener todos los selectores de medios de pago en la página
    const selectores = document.querySelectorAll('select[id="medio-pago"]');
    
    if (selectores.length === 0) {
      console.log('No se encontraron selectores de medios de pago');
      return;
    }
    
    console.log(`Encontrados ${selectores.length} selectores de medios de pago`);
    
    // Obtener medios de pago (de localStorage o usar default)
    const mediosPago = obtenerMediosPago();
    
    // Rellenar cada selector
    selectores.forEach(selector => {
      rellenarSelector(selector, mediosPago);
    });
    
    // Inicializar botones de gestión si existen
    inicializarBotonesGestion(mediosPago);
  }
  
  // Obtener medios de pago de localStorage o usar default
  function obtenerMediosPago() {
    try {
      // Intentar recuperar de localStorage
      const guardados = localStorage.getItem(STORAGE_KEY);
      if (guardados) {
        const medios = JSON.parse(guardados);
        if (Array.isArray(medios) && medios.length > 0) {
          console.log('Medios de pago recuperados de localStorage:', medios);
          return medios;
        }
      }
    } catch (error) {
      console.error('Error al recuperar medios de pago:', error);
    }
    
    // Si no hay datos en localStorage o hay error, usar default
    console.log('Usando medios de pago por defecto');
    guardarMediosPago(MEDIOS_DEFAULT);
    return MEDIOS_DEFAULT;
  }
  
  // Guardar medios de pago en localStorage
  function guardarMediosPago(medios) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(medios));
      console.log('Medios de pago guardados en localStorage');
      return true;
    } catch (error) {
      console.error('Error al guardar medios de pago:', error);
      return false;
    }
  }
  
  // Rellenar un selector con los medios de pago
  function rellenarSelector(selector, mediosPago) {
    if (!selector) return;
    
    console.log('Rellenando selector:', selector.id || 'sin id');
    
    // Limpiar opciones actuales
    selector.innerHTML = '';
    
    // Agregar opción por defecto
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Seleccione...';
    selector.appendChild(defaultOption);
    
    // Agregar opciones de medios de pago
    mediosPago.forEach(medio => {
      const option = document.createElement('option');
      option.value = medio;
      option.textContent = medio;
      selector.appendChild(option);
    });
    
    console.log(`Selector rellenado con ${mediosPago.length} opciones`);
  }
  
  // Inicializar los botones de gestión de medios de pago
  function inicializarBotonesGestion(mediosPago) {
    // Buscar botón para gestionar medios de pago
    const btnGestionar = document.getElementById('btn-gestionar-medios');
    if (!btnGestionar) return;
    
    // Buscar elementos del modal
    const modal = document.getElementById('modal-medios-pago');
    const closeModal = modal ? modal.querySelector('.close-modal') : null;
    const formNuevoMedio = document.getElementById('form-nuevo-medio');
    const listaMediosPago = document.getElementById('lista-medios-pago');
    
    if (!modal || !listaMediosPago) return;
    
    // Función para actualizar la lista de medios
    function actualizarListaMedios() {
      // Obtener medios actualizados
      const medios = obtenerMediosPago();
      
      // Limpiar lista
      listaMediosPago.innerHTML = '';
      
      // Agregar cada medio como elemento de lista
      medios.forEach(medio => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center';
        li.innerHTML = `
          <span>${medio}</span>
          <button type="button" class="btn btn-danger btn-sm" data-medio="${medio}">
            Eliminar
          </button>
        `;
        listaMediosPago.appendChild(li);
        
        // Configurar evento para eliminar
        const btnEliminar = li.querySelector('button');
        btnEliminar.addEventListener('click', () => {
          eliminarMedioPago(medio);
          actualizarListaMedios();
          
          // Actualizar también todos los selectores
          const selectores = document.querySelectorAll('select[id="medio-pago"]');
          selectores.forEach(selector => {
            rellenarSelector(selector, obtenerMediosPago());
          });
          
          mostrarNotificacion(`Medio de pago "${medio}" eliminado correctamente`, 'success');
        });
      });
    }
    
    // Función para eliminar un medio de pago
    function eliminarMedioPago(medio) {
      const medios = obtenerMediosPago();
      const index = medios.indexOf(medio);
      
      if (index !== -1) {
        medios.splice(index, 1);
        guardarMediosPago(medios);
        return true;
      }
      
      return false;
    }
    
    // Función para agregar un medio de pago
    function agregarMedioPago(medio) {
      if (!medio || typeof medio !== 'string' || medio.trim() === '') {
        return false;
      }
      
      const medios = obtenerMediosPago();
      
      // Verificar si ya existe
      if (medios.includes(medio)) {
        return false;
      }
      
      // Agregar y guardar
      medios.push(medio);
      guardarMediosPago(medios);
      return true;
    }
    
    // Función simple para mostrar notificaciones
    function mostrarNotificacion(mensaje, tipo = 'info') {
      const notificacion = document.createElement('div');
      notificacion.className = `notificacion notificacion-${tipo}`;
      notificacion.textContent = mensaje;
      
      document.body.appendChild(notificacion);
      
      setTimeout(() => {
        notificacion.classList.add('mostrar');
        
        setTimeout(() => {
          notificacion.classList.remove('mostrar');
          
          setTimeout(() => {
            document.body.removeChild(notificacion);
          }, 300);
        }, 3000);
      }, 100);
    }
    
    // Configurar botón para mostrar modal
    btnGestionar.addEventListener('click', () => {
      actualizarListaMedios();
      modal.classList.remove('hidden');
    });
    
    // Configurar botón para cerrar modal
    if (closeModal) {
      closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }
    
    // Configurar formulario para agregar nuevo medio
    if (formNuevoMedio) {
      formNuevoMedio.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const inputNuevoMedio = document.getElementById('nuevo-medio');
        if (inputNuevoMedio && inputNuevoMedio.value.trim()) {
          const nuevoMedio = inputNuevoMedio.value.trim();
          const resultado = agregarMedioPago(nuevoMedio);
          
          if (resultado) {
            actualizarListaMedios();
            
            // Actualizar también todos los selectores
            const selectores = document.querySelectorAll('select[id="medio-pago"]');
            selectores.forEach(selector => {
              rellenarSelector(selector, obtenerMediosPago());
            });
            
            inputNuevoMedio.value = '';
            mostrarNotificacion(`Medio de pago "${nuevoMedio}" agregado correctamente`, 'success');
          } else {
            mostrarNotificacion(`El medio de pago "${nuevoMedio}" ya existe`, 'warning');
          }
        }
      });
    }
  }
  
  // Iniciar cuando el DOM está completamente cargado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarMediosPago);
  } else {
    // Si ya está cargado (por ejemplo, si este script se carga al final)
    inicializarMediosPago();
  }
})();
