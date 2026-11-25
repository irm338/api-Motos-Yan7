// Configura Express y conecta las capas de rutas y manejo de errores.
const express = require('express');
const rutasMoto = require('./routes/moto.routes');
const { manejarError, crearErrorHttp } = require('./middlewares/error.middleware');

// Construye la aplicación y permite sustituir el almacenamiento durante las pruebas.
function crearAplicacion(modeloMoto) {
  const aplicacion = express();

  // Interpreta JSON antes de ejecutar validaciones y controladores.
  aplicacion.use(express.json());
  aplicacion.use('/api/motos', rutasMoto(modeloMoto));

  // Convierte las rutas no registradas en errores con respuesta centralizada.
  aplicacion.use((solicitud, respuesta, siguiente) => {
    siguiente(crearErrorHttp('La ruta solicitada no existe.', 404));
  });

  // Mantiene un formato consistente para los errores de toda la aplicación.
  aplicacion.use(manejarError);
  return aplicacion;
}

module.exports = crearAplicacion;