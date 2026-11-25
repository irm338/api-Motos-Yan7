# API de Motos Yan7

API REST para administrar un inventario de motos mediante operaciones CRUD. La aplicación está organizada por capas, valida los datos recibidos y mantiene las motos en un arreglo de JavaScript en memoria.

## Tecnologías

- Node.js 18 o posterior
- Express 5
- `node:test` para las pruebas automatizadas
- nodemon para desarrollo con reinicio automático

## Estructura del proyecto

```text
.
├── controllers/
│   └── moto.controller.js    # Lógica de los endpoints
├── dtos/
│   └── moto.dto.js           # Formato público de las motos
├── middlewares/
│   └── error.middleware.js   # Errores HTTP centralizados
├── models/
│   └── moto.model.js         # Almacenamiento y operaciones en memoria
├── routes/
│   └── moto.routes.js        # Rutas de la API
├── tests/
│   └── motos.test.js         # Pruebas HTTP con un modelo aislado
├── validators/
│   └── moto.validator.js     # Validación de solicitudes
├── app.js
├── package.json
└── server.js
```

## Instalación y ejecución

```bash
npm install
npm start
```

Para desarrollo con reinicio automático:

```bash
npm run dev
```

La API estará disponible en `http://localhost:3000/api/motos` de forma predeterminada. Puedes elegir otro puerto configurando la variable de proceso `PORT`. No requiere una base de datos ni servicios externos.

El inventario inicial contiene tres motos de ejemplo. Las altas, modificaciones y eliminaciones se conservan solo mientras el proceso está en ejecución; al reiniciar el servidor, se restaura el inventario de ejemplo.

## Modelo de datos

Cada moto usa los siguientes campos:

| Campo | Tipo | Requisito |
| --- | --- | --- |
| `id` | cadena | Lo asigna el almacenamiento en memoria y se devuelve en las respuestas |
| `marca` | cadena | Obligatorio, no puede estar vacío |
| `modelo` | cadena | Obligatorio, no puede estar vacío |
| `anio` | número entero | Opcional; debe ser positivo |
| `precio` | número | Opcional; debe ser positivo |
| `cilindrada` | número | Opcional; debe ser positiva |

Los valores de texto se recortan. Las propiedades adicionales no están permitidas. Las solicitudes de creación aceptan `marca` y `modelo` como mínimos; cada campo numérico, si se proporciona, debe ser positivo. `PUT` reemplaza la moto y requiere `marca` y `modelo`; los campos numéricos omitidos se eliminan. `PATCH` modifica únicamente los campos proporcionados.

## Endpoints

Todas las rutas usan el prefijo `/api/motos` y reciben o devuelven JSON, excepto la respuesta `204` de eliminación.

### `GET /api/motos`

Devuelve todas las motos.

**Respuesta `200`:**

```json
[
  {
    "id": "1",
    "marca": "Yamaha",
    "modelo": "MT-07",
    "anio": 2024,
    "precio": 8500,
    "cilindrada": 689
  }
]
```

### `GET /api/motos/:id`

Busca una moto por su identificador.

**Respuesta `200`:** devuelve el objeto de moto mostrado arriba. Un identificador inexistente devuelve `404`.

### `POST /api/motos`

Crea una moto.

**Petición:**

```json
{
  "marca": "Yamaha",
  "modelo": "MT-07",
  "anio": 2024,
  "precio": 8500,
  "cilindrada": 689
}
```

**Respuesta `201`:** devuelve la moto creada, incluyendo el `id` asignado.

### `PUT /api/motos/:id`

Reemplaza una moto existente. Se requieren `marca` y `modelo`; los campos numéricos son opcionales y deben ser positivos si se incluyen. Los campos numéricos omitidos se eliminan.

**Petición y respuesta `200`:** usa el mismo formato JSON de la creación. Un identificador inexistente devuelve `404`.

### `PATCH /api/motos/:id`

Actualiza únicamente los campos incluidos. Se debe proporcionar al menos un campo válido.

**Petición:**

```json
{
  "precio": 8200
}
```

**Respuesta `200`:** devuelve la moto actualizada.

### `DELETE /api/motos/:id`

Elimina una moto existente.

**Respuesta `204`:** sin cuerpo. Si la moto no existe, devuelve `404`.

## Errores

Los errores se devuelven en español y en formato JSON:

```json
{
  "error": "La solicitud contiene datos inválidos.",
  "detalles": ["El campo precio debe ser un número positivo."]
}
```

Se usan `400` para solicitudes inválidas, `404` para recursos o rutas inexistentes, `413` cuando el cuerpo supera el tamaño permitido y `500` para errores internos. Los detalles aparecen cuando ayudan a corregir la petición.

## Pruebas

```bash
npm test
```

Las pruebas ejercitan los endpoints HTTP con almacenes independientes en memoria.
