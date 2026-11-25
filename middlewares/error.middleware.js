// Crea errores HTTP reconocibles por el middleware centralizado.
function crearErrorHttp(mensaje, codigoEstado, detalles) {
  const error = new Error(mensaje);
  error.statusCode = codigoEstado;
  if (detalles) {
    error.detalles = detalles;
  }
  return error;
}

// Convierte errores de Express al contrato JSON de la API.
function manejarError(error, solicitud, respuesta, siguiente) {
  let codigoEstado = Number(error.statusCode || error.status) || 500;
  let mensaje = error.message || 'Ocurrió un error interno.';
  let detalles = error.detalles;

  // Informa errores de sintaxis del cuerpo JSON como solicitudes inválidas.
  if (error.type === 'entity.parse.failed') {
    codigoEstado = 400;
    mensaje = 'El cuerpo JSON no tiene un formato válido.';
  } else if (error.type === 'entity.too.large') {
    codigoEstado = 413;
    mensaje = 'El cuerpo de la solicitud supera el tamaño permitido.';
  } else if (error.type === 'charset.unsupported' || error.type === 'encoding.unsupported') {
    codigoEstado = 415;
    mensaje = 'La codificación de la solicitud no es compatible.';
  } else if (error.type === 'request.aborted' || error.type === 'request.size.invalid') {
    codigoEstado = 400;
    mensaje = 'No se pudo leer correctamente el cuerpo de la solicitud.';
  }

  // Evita exponer detalles internos cuando la respuesta corresponde a un fallo del servidor.
  if (codigoEstado >= 500) {
    console.error('Error interno al procesar una solicitud.', error);
    codigoEstado = 500;
    mensaje = 'Ocurrió un error interno.';
    detalles = undefined;
  }

  const cuerpo = { error: mensaje };
  if (detalles && detalles.length > 0) {
    cuerpo.detalles = detalles;
  }

  respuesta.status(codigoEstado).json(cuerpo);
}

module.exports = { crearErrorHttp, manejarError };