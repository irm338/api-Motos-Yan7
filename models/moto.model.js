// Mantiene ejemplos iniciales para que la API tenga datos desde el primer arranque.
const motosIniciales = [
  { id: '1', marca: 'Yamaha', modelo: 'MT-07', anio: 2024, precio: 8500, cilindrada: 689 },
  { id: '2', marca: 'Honda', modelo: 'CB500F', anio: 2023, precio: 6800, cilindrada: 471 },
  { id: '3', marca: 'Kawasaki', modelo: 'Z650', anio: 2024, precio: 7900, cilindrada: 649 }
];

// Devuelve copias para evitar que las capas consumidoras muten el estado directamente.
function copiarMoto(moto) {
  return { ...moto };
}

// Crea un almacén independiente para la aplicación o para cada prueba.
function crearAlmacenMotos(datosIniciales = motosIniciales) {
  const motos = datosIniciales.map(copiarMoto);
  let siguienteId = motos.reduce((mayorId, moto) => {
    const idNumerico = Number(moto.id);
    return Number.isInteger(idNumerico) ? Math.max(mayorId, idNumerico) : mayorId;
  }, 0) + 1;

  return {
    // Devuelve una copia del inventario completo.
    listarMotos() {
      return motos.map(copiarMoto);
    },

    // Busca una moto por su identificador.
    obtenerMotoPorId(id) {
      const moto = motos.find((elemento) => elemento.id === String(id));
      return moto ? copiarMoto(moto) : null;
    },

    // Agrega una moto y asigna un identificador consecutivo.
    crearMoto(datos) {
      const moto = { ...copiarMoto(datos), id: String(siguienteId++) };
      motos.push(moto);
      return copiarMoto(moto);
    },

    // Reemplaza todos los campos editables de la moto indicada.
    reemplazarMoto(id, datos) {
      const indice = motos.findIndex((elemento) => elemento.id === String(id));
      if (indice === -1) {
        return null;
      }

      motos[indice] = { ...copiarMoto(datos), id: motos[indice].id };
      return copiarMoto(motos[indice]);
    },

    // Modifica solo los campos recibidos y conserva los demás.
    actualizarMoto(id, datos) {
      const moto = motos.find((elemento) => elemento.id === String(id));
      if (!moto) {
        return null;
      }

      Object.assign(moto, copiarMoto(datos));
      return copiarMoto(moto);
    },

    // Elimina una moto y devuelve la copia eliminada.
    eliminarMoto(id) {
      const indice = motos.findIndex((elemento) => elemento.id === String(id));
      if (indice === -1) {
        return null;
      }

      return copiarMoto(motos.splice(indice, 1)[0]);
    }
  };
}

module.exports = {
  ...crearAlmacenMotos(),
  crearAlmacenMotos
};