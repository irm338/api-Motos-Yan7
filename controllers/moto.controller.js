// Implementa los casos de uso CRUD y transforma las motos antes de responder.
const { crearMotoDTO } = require('../dtos/moto.dto');
const { crearErrorHttp } = require('../middlewares/error.middleware');

// Recibe el modelo como dependencia para mantener los controladores comprobables.
function crearControladorMoto(modeloMoto) {
  // Devuelve una copia del inventario actual.
  async function listarMotos(solicitud, respuesta) {
    const motos = await modeloMoto.listarMotos();
    respuesta.status(200).json(motos.map(crearMotoDTO));
  }

  // Busca una moto y responde con 404 si no existe.
  async function obtenerMoto(solicitud, respuesta) {
    const moto = await modeloMoto.obtenerMotoPorId(solicitud.params.id);
    if (!moto) {
      throw crearErrorHttp('No se encontró la moto solicitada.', 404);
    }

    respuesta.status(200).json(crearMotoDTO(moto));
  }

  // Persiste una moto nueva y devuelve su DTO con código 201.
  async function crearMoto(solicitud, respuesta) {
    const moto = await modeloMoto.crearMoto(solicitud.body);
    respuesta.status(201).json(crearMotoDTO(moto));
  }

  // Reemplaza los datos de una moto; los campos numéricos omitidos quedan vacíos.
  async function reemplazarMoto(solicitud, respuesta) {
    const moto = await modeloMoto.reemplazarMoto(solicitud.params.id, solicitud.body);
    if (!moto) {
      throw crearErrorHttp('No se encontró la moto solicitada.', 404);
    }

    respuesta.status(200).json(crearMotoDTO(moto));
  }

  // Actualiza solo las propiedades recibidas y conserva las restantes.
  async function actualizarMoto(solicitud, respuesta) {
    const moto = await modeloMoto.actualizarMoto(solicitud.params.id, solicitud.body);
    if (!moto) {
      throw crearErrorHttp('No se encontró la moto solicitada.', 404);
    }

    respuesta.status(200).json(crearMotoDTO(moto));
  }

  // Elimina la moto encontrada y responde sin contenido.
  async function eliminarMoto(solicitud, respuesta) {
    const moto = await modeloMoto.eliminarMoto(solicitud.params.id);
    if (!moto) {
      throw crearErrorHttp('No se encontró la moto solicitada.', 404);
    }

    respuesta.status(204).end();
  }

  return {
    listarMotos,
    obtenerMoto,
    crearMoto,
    reemplazarMoto,
    actualizarMoto,
    eliminarMoto
  };
}

module.exports = { crearControladorMoto };