// Valida tipos, campos permitidos y requisitos del cuerpo antes de acceder al modelo.
const { crearErrorHttp } = require('../middlewares/error.middleware');

const CAMPOS_PERMITIDOS = new Set(['marca', 'modelo', 'anio', 'precio', 'cilindrada']);
const CAMPOS_NUMERICOS = ['anio', 'precio', 'cilindrada'];

// Comprueba una solicitud de creación, reemplazo completo o actualización parcial.
function validarDatosMoto(modo) {
  return function validarSolicitudMoto(solicitud, respuesta, siguiente) {
    const datos = solicitud.body;
    const errores = [];

    // Rechaza cuerpos nulos, arreglos u otros valores que no representen un objeto JSON.
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
      return siguiente(crearErrorHttp('El cuerpo debe ser un objeto JSON.', 400));
    }

    // Evita aceptar propiedades que el modelo o el contrato de la API no reconocen.
    Object.keys(datos).forEach((campo) => {
      if (!CAMPOS_PERMITIDOS.has(campo)) {
        errores.push(`El campo ${campo} no está permitido.`);
      }
    });

    // Las operaciones de creación y reemplazo necesitan ambos campos de texto.
    if (modo !== 'actualizar') {
      ['marca', 'modelo'].forEach((campo) => {
        if (typeof datos[campo] !== 'string' || datos[campo].trim().length === 0) {
          errores.push(`El campo ${campo} es obligatorio y debe ser texto no vacío.`);
        }
      });
    } else if (Object.keys(datos).length === 0) {
      errores.push('Debe proporcionar al menos un campo para actualizar.');
    }

    // Comprueba los campos opcionales solo cuando aparecen en el cuerpo.
    CAMPOS_NUMERICOS.forEach((campo) => {
      if (datos[campo] === undefined) {
        return;
      }

      const esNumeroValido = typeof datos[campo] === 'number'
        && Number.isFinite(datos[campo])
        && datos[campo] > 0;
      if (!esNumeroValido) {
        errores.push(`El campo ${campo} debe ser un número positivo.`);
      } else if (campo === 'anio' && !Number.isInteger(datos[campo])) {
        errores.push('El campo anio debe ser un número entero.');
      }
    });

    // Recorta valores de texto para guardar y responder con datos normalizados.
    ['marca', 'modelo'].forEach((campo) => {
      if (typeof datos[campo] === 'string') {
        datos[campo] = datos[campo].trim();
      }
    });

    if (errores.length > 0) {
      return siguiente(crearErrorHttp('La solicitud contiene datos inválidos.', 400, errores));
    }

    siguiente();
  };
}

module.exports = { validarDatosMoto };
