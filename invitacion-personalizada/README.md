# Invitacion personalizada de Liss y Jose

Esta carpeta es la copia de trabajo creada a partir de la pagina original. Los archivos `inicio.html`, `estilos.css` e `iniciofunc.js` fuera de esta carpeta no se modifican.

## Flujo simple para las invitaciones

La administracion es por familia o grupo: una fila representa una invitacion y puede contener varias personas. La pagina convierte los nombres de esa fila en casillas individuales para confirmar asistencia.

En la hoja `Grupos`, las columnas se crean automaticamente y solo hay que completar estas cuatro:

```text
Familia o grupo | Personas invitadas | WhatsApp | Activo
```

Ejemplo:

```text
Familia Ramirez | Ana Ramirez, Carlos Ramirez, Sofia Ramirez | 88887777 | Si
```

- Separar los nombres con comas o con saltos de linea.
- El telefono puede escribirse con ocho digitos de Costa Rica; el script agrega `506`. Para otro pais, incluir el codigo internacional completo.
- `Activo` se puede dejar vacio o poner `Si`. Escribir `No` desactiva esa invitacion.

El script completa por si solo el token, el enlace personal, el enlace directo de WhatsApp, el estado y los nombres confirmados. La hoja antigua `Invitados`, si existe, no se modifica.

## Configuracion inicial

1. Publicar esta carpeta completa en Netlify. Deben subir tambien `imagenes` y `Musica`.
2. Abrir el Google Sheet y entrar a `Extensiones > Apps Script`.
3. Reemplazar el contenido de `Code.gs` por [google-sheets-app-script.gs](google-sheets-app-script.gs).
4. En ese archivo, reemplazar `SITE_URL` por la URL publicada de Netlify.
5. Guardar e implementar como Aplicacion web: ejecutar como `Yo` y acceso `Cualquier persona`.
6. Recargar el Sheet y ejecutar `Boda > Preparar hojas`.
7. Llenar una fila por familia o grupo en `Grupos`.
8. Ejecutar `Boda > Generar enlaces y WhatsApp`.

La columna `Abrir WhatsApp` abre el chat del telefono indicado con un mensaje y el enlace ya preparados. Solo queda revisar el mensaje y pulsar enviar.

## Confirmaciones

El sobre muestra `Para la familia` y el nombre del grupo guardado en la hoja, sin listar los nombres individuales. Al tocar el sello, sale la tarjeta y permanece visible sin limite de tiempo. El boton `Abrir invitacion` lleva a la portada de la pagina. Cada familia marca a las personas que asistiran o elige `No podemos asistir`. Esta ultima opcion desmarca a todos los invitados, y seleccionar a un invitado desmarca la negativa. No se puede enviar el formulario sin elegir alguna opcion.

La hoja `Grupos` actualiza `Confirmados`, `Estado` y `Actualizado`. Si nadie asiste, `Confirmados` dice `No podemos asistir` y `Respuestas` recibe una sola fila por el grupo. Si asisten personas, `Respuestas` conserva el detalle por invitado.

Una vez registrada, la invitacion sigue permitiendo leer la pagina, pero no enviar ni modificar la respuesta. Apps Script bloquea los segundos envios bajo un bloqueo compartido, incluso si el enlace se abre desde otro dispositivo. La pagina verifica el recibo de guardado antes de mostrar el agradecimiento.

## Publicar estos cambios

1. En el Google Sheet, abrir `Extensiones > Apps Script` y actualizar `Code.gs` con [google-sheets-app-script.gs](google-sheets-app-script.gs). La URL `SITE_URL` ya apunta a `https://bodalissyjose.netlify.app/`.
2. Actualizar la implementacion existente con una nueva version desde `Implementar > Gestionar implementaciones`. Conservar el identificador de implementacion y su URL `/exec`, ejecutando como `Yo` y con acceso `Cualquier persona`.
3. Volver a desplegar esta carpeta completa en Netlify.

No es necesario preparar las hojas de nuevo ni generar otros tokens. Las respuestas que ya tienen `Estado = Respondido` tambien quedan bloqueadas.

Antes de compartir todas las invitaciones, probar un enlace en una ventana de incognito y confirmar que una respuesta aparezca en ambas hojas.
