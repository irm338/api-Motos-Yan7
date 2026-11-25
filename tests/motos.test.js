// Comprueba los endpoints HTTP y el almacenamiento en memoria sin servicios externos.
const { afterEach, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const crearAplicacion = require('../app');
const { crearAlmacenMotos } = require('../models/moto.model');

// Inicia un servidor efímero y entrega su dirección para las peticiones de prueba.
async function iniciarServidorDePrueba(almacenMotos) {
  const servidor = crearAplicacion(almacenMotos).listen(0);
  await new Promise((resolver) => servidor.once('listening', resolver));
  const direccion = servidor.address();
  return {
    servidor,
    url: `http://127.0.0.1:${direccion.port}/api/motos`
  };
}

let servidor;
let url;

// Crea un almacén vacío para cada caso y evita compartir datos entre pruebas.
beforeEach(async () => {
  const prueba = await iniciarServidorDePrueba(crearAlmacenMotos([]));
  servidor = prueba.servidor;
  url = prueba.url;
});

// Cierra el servidor aunque fallen las aserciones.
afterEach(async () => {
  await new Promise((resolver, rechazar) => {
    servidor.close((fallo) => (fallo ? rechazar(fallo) : resolver()));
  });
});

test('inicia con motos de ejemplo y las entrega en la respuesta HTTP', async () => {
  const prueba = await iniciarServidorDePrueba();

  try {
    const respuesta = await fetch(prueba.url);
    const motos = await respuesta.json();

    assert.equal(respuesta.status, 200);
    assert.equal(motos.length, 3);
    assert.equal(motos[0].marca, 'Yamaha');
    assert.equal(motos[1].marca, 'Honda');
    assert.equal(motos[2].marca, 'Kawasaki');
  } finally {
    await new Promise((resolver, rechazar) => {
      prueba.servidor.close((fallo) => (fallo ? rechazar(fallo) : resolver()));
    });
  }
});

test('crea y consulta una moto con los campos permitidos', async () => {
  const respuestaCreacion = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      marca: ' Yamaha ',
      modelo: 'MT-07',
      anio: 2024,
      precio: 8500,
      cilindrada: 689
    })
  });
  const motoCreada = await respuestaCreacion.json();

  assert.equal(respuestaCreacion.status, 201);
  assert.equal(motoCreada.marca, 'Yamaha');
  assert.equal(motoCreada.modelo, 'MT-07');
  assert.equal(motoCreada.anio, 2024);
  assert.equal(motoCreada.id, '1');

  const respuestaListado = await fetch(url);
  assert.equal(respuestaListado.status, 200);
  assert.deepEqual(await respuestaListado.json(), [motoCreada]);

  const respuestaConsulta = await fetch(`${url}/${motoCreada.id}`);
  assert.equal(respuestaConsulta.status, 200);
  assert.deepEqual(await respuestaConsulta.json(), motoCreada);
});

test('rechaza datos inválidos con detalles en español', async () => {
  const respuesta = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ marca: '   ', modelo: 'MT-07', precio: -1, color: 'rojo' })
  });
  const cuerpo = await respuesta.json();

  assert.equal(respuesta.status, 400);
  assert.equal(cuerpo.error, 'La solicitud contiene datos inválidos.');
  assert.ok(cuerpo.detalles.some((detalle) => detalle.includes('marca')));
  assert.ok(cuerpo.detalles.some((detalle) => detalle.includes('precio')));
  assert.ok(cuerpo.detalles.some((detalle) => detalle.includes('color')));
});

test('rechaza JSON mal formado y actualizaciones parciales vacías', async () => {
  const respuestaJson = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"marca":'
  });
  assert.equal(respuestaJson.status, 400);
  assert.equal((await respuestaJson.json()).error, 'El cuerpo JSON no tiene un formato válido.');

  const respuestaParcial = await fetch(`${url}/1`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: '{}'
  });
  assert.equal(respuestaParcial.status, 400);
  assert.ok((await respuestaParcial.json()).detalles[0].includes('al menos un campo'));
});

test('actualiza parcialmente, reemplaza y elimina una moto existente', async () => {
  const respuestaCreacion = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ marca: 'Honda', modelo: 'CB500' })
  });
  const motoCreada = await respuestaCreacion.json();

  const respuestaParcial = await fetch(`${url}/${motoCreada.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ precio: 6200 })
  });
  assert.equal(respuestaParcial.status, 200);
  assert.equal((await respuestaParcial.json()).precio, 6200);

  const respuestaReemplazo = await fetch(`${url}/${motoCreada.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ marca: 'Honda', modelo: 'CB500X', cilindrada: 471 })
  });
  const motoReemplazada = await respuestaReemplazo.json();
  assert.equal(respuestaReemplazo.status, 200);
  assert.equal(motoReemplazada.modelo, 'CB500X');
  assert.equal(motoReemplazada.precio, undefined);

  const respuestaEliminacion = await fetch(`${url}/${motoCreada.id}`, { method: 'DELETE' });
  assert.equal(respuestaEliminacion.status, 204);
  assert.equal(await respuestaEliminacion.text(), '');
});

test('responde 404 cuando la moto o la ruta no existen', async () => {
  const respuestaMoto = await fetch(`${url}/id-inexistente`);
  assert.equal(respuestaMoto.status, 404);
  assert.equal((await respuestaMoto.json()).error, 'No se encontró la moto solicitada.');

  const respuestaRuta = await fetch(`${url}/no-existe/ruta`);
  assert.equal(respuestaRuta.status, 404);
  assert.equal((await respuestaRuta.json()).error, 'La ruta solicitada no existe.');
});
