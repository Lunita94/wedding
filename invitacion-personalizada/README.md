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

Cada familia abre su enlace, marca a las personas que asistiran y pulsa enviar. La hoja `Grupos` actualiza `Confirmados`, `Estado` y `Actualizado`; la hoja `Respuestas` conserva un historial por persona y por envio. Una vez registrada, la invitacion muestra la confirmacion y ya no permite un segundo envio.

Antes de compartir todas las invitaciones, probar un enlace en una ventana de incognito y confirmar que una respuesta aparezca en ambas hojas.
