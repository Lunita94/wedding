# Invitacion Liss y Jose

Archivos principales:

- `index.html`: estructura de la pagina y textos visibles.
- `styles.css`: colores, flores, layout y version responsive.
- `script.js`: cuenta regresiva, musica, animaciones y formulario.
- `google-sheets-app-script.gs`: codigo para conectar el RSVP con Google Sheets.
- `assets/magnolias-divisor-wine.svg`: divisor de magnolias en tonos vino.

Cambios comunes:

- Fecha/hora de la boda: editar `date` en `script.js`.
- Imagen de portada: editar `background-image` en `.hero-photo` dentro de `styles.css`.
- Cancion: cambiar el `src` del `<source>` dentro del `<audio id="song">` en `index.html`.
- Fotos: cambiar los tres videos locales en la seccion `Nuestros Momentos` por fotos reales cuando las agreguen a `../imagenes`.
- Mapas: reemplazar los enlaces `https://maps.google.com` y `https://waze.com/ul` en la seccion `Eventos`.
- Dress code: reemplazar `../imagenes/atuendo.png` por otra imagen si les pasan una referencia distinta.
- Flores divisorias: editar o reemplazar `assets/magnolias-divisor-wine.svg` si quieren otra cenefa.
- Google Sheets: pegar la URL del Web App en `googleScriptUrl` dentro de `script.js`.

## Conectar RSVP con Google Sheets

1. Crear una hoja nueva en Google Sheets.
2. Ir a `Extensiones > Apps Script`.
3. Borrar el contenido inicial de `Code.gs`.
4. Pegar el contenido de `google-sheets-app-script.gs`.
5. Guardar el proyecto.
6. Ir a `Implementar > Nueva implementacion`.
7. Elegir tipo `Aplicacion web`.
8. En `Ejecutar como`, elegir `Yo`. No elegir `Cualquiera que acceda a la aplicacion web`.
9. En `Quien tiene acceso`, elegir `Cualquier persona`. No elegir `Cualquier persona con cuenta de Google`.
10. Implementar y copiar la URL del Web App.
11. Pegar esa URL en `script.js`, en `googleScriptUrl`.

El formulario siempre guarda una copia en el navegador con `localStorage`. Cuando `googleScriptUrl` tenga la URL publicada, tambien enviara la respuesta a la hoja `Confirmaciones`.

## Error 401 en Apps Script

Si el navegador muestra `POST ... /exec 401`, Google esta bloqueando el Web App antes de ejecutar el codigo. Revisar esto:

1. En Apps Script ir a `Implementar > Gestionar implementaciones`.
2. Editar la implementacion activa.
3. Confirmar que el tipo sea `Aplicacion web`.
4. Confirmar `Ejecutar como: Yo`. Si dice `Cualquiera que acceda a la aplicacion web`, cambiarlo.
5. Confirmar `Quien tiene acceso: Cualquier persona`. No usar `Solo yo` ni `Cualquier persona con cuenta de Google`.
6. Crear una nueva version e implementar.
7. Autorizar permisos con la misma cuenta dueña del Sheet.
8. Copiar la URL que termina en `/exec`, no la que termina en `/dev`.
9. Abrir esa URL en una ventana de incognito.

Si esta bien publicado, al abrir la URL debe aparecer:

```json
{"ok":true,"message":"RSVP activo"}
```

Si en incognito sigue saliendo `401`, la implementacion sigue privada o la cuenta de Google Workspace no permite Web Apps publicas. En ese caso usar una cuenta Gmail personal para crear la hoja/script, o cambiar la politica del Workspace.
