// Script de arreglo directo - se ejecuta después de todo lo demás
// Este script inyecta las opciones directamente en el HTML

// Esperar a que todo esté cargado (incluyendo otros scripts)
setTimeout(function() {
  console.log('FIX-DIRECTO: Iniciando solución de emergencia');

  // Obtener el selector de medios de pago
  const medioPagoSelect = document.getElementById('medio-pago');
  
  // Si no existe, intentar buscarlo de otra manera
  if (!medioPagoSelect) {
    console.log('FIX-DIRECTO: No se encontró el selector por ID, buscando por atributos');
  }
  
  // Lista fija de medios de pago
  const mediosDePago = [
    'Efectivo',
    'Tarjeta de Crédito',
    'Tarjeta de Débito',
    'Transferencia',
    'Sueldo',
    'Freelance',
    'Inversiones',
    'Otros'
  ];
  
  // Función para rellenar cualquier selector
  function rellenarSelectores() {
    // Buscar todos los selectores en la página
    const selectores = document.querySelectorAll('select');
    
    console.log('FIX-DIRECTO: Encontrados ' + selectores.length + ' selectores en total');
    
    // Intentar identificar posibles selectores de medios de pago
    selectores.forEach(function(select) {
      // Si tiene id de medio-pago o está vacío y podría ser un selector de medios
      if (select.id === 'medio-pago' || 
          (select.options.length === 0 || 
           (select.options.length === 1 && select.options[0].value === ''))) {
        
        console.log('FIX-DIRECTO: Rellenando selector:', select);
        
        // Limpiar opciones existentes
        select.innerHTML = '';
        
        // Opción por defecto
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Seleccione...';
        select.appendChild(defaultOption);
        
        // Agregar todas las opciones
        mediosDePago.forEach(function(medio) {
          const option = document.createElement('option');
          option.value = medio;
          option.textContent = medio;
          select.appendChild(option);
        });
        
        console.log('FIX-DIRECTO: Selector rellenado con ' + mediosDePago.length + ' opciones');
      }
    });
  }
  
  // Ejecutar ahora
  rellenarSelectores();
  
  // Y también después de un pequeño delay (por si hay carga asíncrona)
  setTimeout(rellenarSelectores, 1000);
  
}, 500); // Esperar 500ms para asegurarnos que todo esté cargado
