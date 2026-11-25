
// Prepara y pone en marcha la API usando únicamente el puerto configurado en el proceso.
const crearAplicacion = require('./app');

// Inicia el servidor HTTP sin pasos de conexión externos.
function iniciarServidor() {
  const puerto = Number(process.env.PORT) || 3000;
  const aplicacion = crearAplicacion();

  // Informa cuándo la API está disponible para recibir solicitudes.
  const servidor = aplicacion.listen(puerto, () => {
    console.log(`La API de motos está escuchando en el puerto ${puerto}.`);
  });

  // Registra los errores de apertura del puerto y señala el fallo al sistema operativo.
  servidor.on('error', (fallo) => {
    console.error('No se pudo iniciar el servidor HTTP.', fallo);
    process.exitCode = 1;
  });
}

iniciarServidor();
