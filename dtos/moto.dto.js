// Define la forma pública de las motos y evita exponer detalles del almacenamiento.
function crearMotoDTO(moto) {
  const dto = {
    id: String(moto.id),
    marca: moto.marca,
    modelo: moto.modelo
  };

  // Conserva en la respuesta solo los campos numéricos que realmente existen.
  ['anio', 'precio', 'cilindrada'].forEach((campo) => {
    if (moto[campo] !== undefined) {
      dto[campo] = moto[campo];
    }
  });

  return dto;
}

module.exports = { crearMotoDTO };