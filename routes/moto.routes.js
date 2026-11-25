// Registra las rutas CRUD de motos y sus validadores de entrada.
const express = require('express');
const modeloMotoPredeterminado = require('../models/moto.model');
const { crearControladorMoto } = require('../controllers/moto.controller');
const { validarDatosMoto } = require('../validators/moto.validator');

// Crea un enrutador con el almacenamiento predeterminado o con uno de prueba.
function crearRutasMoto(modeloMoto = modeloMotoPredeterminado) {
  const enrutador = express.Router();
  const controlador = crearControladorMoto(modeloMoto);

  // Consulta y crea elementos de la colección.
  enrutador.get('/', controlador.listarMotos);
  enrutador.post('/', validarDatosMoto('crear'), controlador.crearMoto);

  // Actualiza, consulta o elimina un elemento específico.
  enrutador.get('/:id', controlador.obtenerMoto);
  enrutador.put('/:id', validarDatosMoto('reemplazar'), controlador.reemplazarMoto);
  enrutador.patch('/:id', validarDatosMoto('actualizar'), controlador.actualizarMoto);
  enrutador.delete('/:id', controlador.eliminarMoto);

  return enrutador;
}

module.exports = crearRutasMoto;
