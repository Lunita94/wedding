const GROUP_SHEET = "Grupos";
const RESPONSE_SHEET = "Respuestas";
const SITE_URL = "https://bodalissyjose.netlify.app/";
const DEFAULT_COUNTRY_CODE = "506";

const GROUP_HEADERS = [
  "Token",
  "Familia o grupo",
  "Personas invitadas",
  "WhatsApp",
  "Activo",
  "Confirmados",
  "Estado",
  "Actualizado",
  "Enlace personal",
  "Abrir WhatsApp",
];

const RESPONSE_HEADERS = [
  "Recibido",
  "Envio",
  "Token",
  "Familia",
  "Invitado",
  "Asistencia",
  "Pagina",
];

const GROUP_COLUMN = Object.freeze({
  TOKEN: 0,
  FAMILY: 1,
  GUESTS: 2,
  PHONE: 3,
  ACTIVE: 4,
  CONFIRMED: 5,
  STATUS: 6,
  UPDATED: 7,
  LINK: 8,
  WHATSAPP_LINK: 9,
});

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Boda")
    .addItem("Preparar hojas", "setupWeddingSheets")
    .addItem("Generar enlaces y WhatsApp", "generateShareLinks")
    .addToUi();
}

function setupWeddingSheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const groupSheet = getOrCreateSheet_(spreadsheet, GROUP_SHEET, GROUP_HEADERS);
  const responseSheet = getOrCreateSheet_(
    spreadsheet,
    RESPONSE_SHEET,
    RESPONSE_HEADERS,
  );

  groupSheet.setFrozenRows(1);
  responseSheet.setFrozenRows(1);
  groupSheet.autoResizeColumns(1, GROUP_HEADERS.length);
  responseSheet.autoResizeColumns(1, RESPONSE_HEADERS.length);
  SpreadsheetApp.getUi().alert("Hojas listas: Grupos y Respuestas.");
}

function generateShareLinks() {
  if (SITE_URL.includes("REEMPLAZAR-POR-TU-SITIO")) {
    throw new Error(
      "Actualiza SITE_URL con la direccion publicada de la invitacion.",
    );
  }

  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(GROUP_SHEET);
  if (!sheet || sheet.getLastRow() < 2) {
    throw new Error("Agrega primero los grupos en la hoja Grupos.");
  }

  const rowCount = sheet.getLastRow() - 1;
  const rows = sheet.getRange(2, 1, rowCount, GROUP_HEADERS.length).getValues();
  const siteUrl = SITE_URL.replace(/\/?$/, "/");
  const incompleteRows = [];

  const updatedRows = rows.map((row, index) => {
    const updated = row.slice();
    const family = String(updated[GROUP_COLUMN.FAMILY]).trim();
    const guests = splitGuestNames_(updated[GROUP_COLUMN.GUESTS]);
    const hasContent =
      family || guests.length || String(updated[GROUP_COLUMN.PHONE]).trim();

    if (!hasContent) return updated;
    if (!family || !guests.length) {
      incompleteRows.push(index + 2);
      return updated;
    }

    const token =
      String(updated[GROUP_COLUMN.TOKEN]).trim() || Utilities.getUuid();
    const invitationUrl = `${siteUrl}?i=${encodeURIComponent(token)}`;
    const message = `Hola, ${family}. Nos encantara contar con ustedes en nuestra boda. Por favor confirmen su asistencia aqui: ${invitationUrl}`;

    updated[GROUP_COLUMN.TOKEN] = token;
    updated[GROUP_COLUMN.LINK] = invitationUrl;
    updated[GROUP_COLUMN.WHATSAPP_LINK] = createWhatsAppLink_(
      updated[GROUP_COLUMN.PHONE],
      message,
    );
    if (!String(updated[GROUP_COLUMN.STATUS]).trim())
      updated[GROUP_COLUMN.STATUS] = "Pendiente";
    return updated;
  });

  if (incompleteRows.length) {
    throw new Error(
      `Completa Familia o grupo y Personas invitadas en las filas: ${incompleteRows.join(", ")}.`,
    );
  }

  sheet.getRange(2, 1, rowCount, GROUP_HEADERS.length).setValues(updatedRows);
  SpreadsheetApp.getUi().alert(
    "Enlaces personales y mensajes de WhatsApp generados.",
  );
}

function doGet(e) {
  const data = e.parameter || {};
  const action = String(data.action || "status");
  let response;

  if (action === "invitation") {
    response = getInvitation_(String(data.token || ""));
  } else if (action === "receipt") {
    response = getReceipt_(
      String(data.token || ""),
      String(data.submissionId || ""),
    );
  } else {
    response = { ok: true, message: "RSVP activo" };
  }

  return createOutput_(response, String(data.prefix || ""));
}

function doPost(e) {
  try {
    const data = e.parameter || {};
    if (String(data.action) !== "confirm") {
      return createOutput_({ ok: false, error: "Accion no valida" });
    }

    const token = String(data.token || "").trim();
    const submissionId = String(data.submissionId || "").trim();
    const selectedGuestIds = JSON.parse(data.selectedGuestIds || "[]");
    const attendance = String(data.attendance || "");
    const pageUrl = String(data.pageUrl || "");

    if (
      !isValidToken_(token) ||
      !submissionId ||
      !Array.isArray(selectedGuestIds) ||
      !["si", "no"].includes(attendance)
    ) {
      return createOutput_({ ok: false, error: "Datos no validos" });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      return createOutput_(
        saveResponse_(
          token,
          selectedGuestIds.map(String),
          submissionId,
          pageUrl,
          attendance,
        ),
      );
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    return createOutput_({
      ok: false,
      error: "No se pudo guardar la respuesta",
    });
  }
}

function getInvitation_(token) {
  if (!isValidToken_(token)) return { ok: false };

  const group = findGroupByToken_(token);
  if (!group || !isActive_(group.row[GROUP_COLUMN.ACTIVE]))
    return { ok: false };

  const guests = splitGuestNames_(group.row[GROUP_COLUMN.GUESTS]);
  if (!guests.length) return { ok: false };

  const confirmedNames = new Set(
    splitGuestNames_(group.row[GROUP_COLUMN.CONFIRMED]).map(normalizeName_),
  );
  const responded = hasResponded_(group.row[GROUP_COLUMN.STATUS]);

  return {
    ok: true,
    family: String(group.row[GROUP_COLUMN.FAMILY]).trim(),
    responded,
    guests: guests.map((name, index) => ({
      id: String(index + 1),
      name,
      attendance: confirmedNames.has(normalizeName_(name)) ? "si" : "no",
    })),
  };
}

function saveResponse_(
  token,
  selectedGuestIds,
  submissionId,
  pageUrl,
  attendance,
) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const groupSheet = spreadsheet.getSheetByName(GROUP_SHEET);
  const responseSheet = spreadsheet.getSheetByName(RESPONSE_SHEET);

  if (!groupSheet || !responseSheet) {
    return { ok: false, error: "Ejecuta setupWeddingSheets primero" };
  }

  if (hasReceipt_(responseSheet, token, submissionId))
    return { ok: true, duplicate: true };

  const group = findGroupByToken_(token);
  if (!group || !isActive_(group.row[GROUP_COLUMN.ACTIVE])) {
    return { ok: false, error: "Invitacion no encontrada" };
  }
  if (hasResponded_(group.row[GROUP_COLUMN.STATUS])) {
    return {
      ok: false,
      alreadyResponded: true,
      error: "Esta invitacion ya fue respondida",
    };
  }

  const guests = splitGuestNames_(group.row[GROUP_COLUMN.GUESTS]);
  const validIds = new Set(guests.map((_, index) => String(index + 1)));
  const selected = new Set(selectedGuestIds);
  const declined = attendance === "no";

  if (
    !["si", "no"].includes(attendance) ||
    (declined && selected.size > 0) ||
    (!declined && selected.size === 0)
  ) {
    return { ok: false, error: "Selecciona invitados o indica que no pueden asistir" };
  }

  if ([...selected].some((id) => !validIds.has(id))) {
    return { ok: false, error: "Invitados no validos" };
  }

  const receivedAt = new Date();
  const confirmedNames = guests.filter((_, index) =>
    selected.has(String(index + 1)),
  );
  const family = String(group.row[GROUP_COLUMN.FAMILY]).trim();
  const responseRows = declined
    ? [[
        receivedAt,
        submissionId,
        token,
        family,
        "Todo el grupo",
        "No podemos asistir",
        pageUrl,
      ]]
    : guests.map((name, index) => [
        receivedAt,
        submissionId,
        token,
        family,
        name,
        selected.has(String(index + 1)) ? "Si" : "No",
        pageUrl,
      ]);

  groupSheet
    .getRange(group.number, GROUP_COLUMN.CONFIRMED + 1, 1, 3)
    .setValues([[
      declined ? "No podemos asistir" : confirmedNames.join(", "),
      "Respondido",
      receivedAt,
    ]]);

  responseSheet
    .getRange(
      responseSheet.getLastRow() + 1,
      1,
      responseRows.length,
      RESPONSE_HEADERS.length,
    )
    .setValues(responseRows);

  return { ok: true };
}

function getReceipt_(token, submissionId) {
  if (!isValidToken_(token) || !submissionId)
    return { ok: false, received: false };
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(RESPONSE_SHEET);
  const received = sheet ? hasReceipt_(sheet, token, submissionId) : false;
  return {
    ok: true,
    received,
    invitation: received ? undefined : getInvitation_(token),
  };
}

function findGroupByToken_(token) {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(GROUP_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return null;

  const rows = sheet
    .getRange(2, 1, sheet.getLastRow() - 1, GROUP_HEADERS.length)
    .getValues();
  const index = rows.findIndex(
    (row) => String(row[GROUP_COLUMN.TOKEN]).trim() === token,
  );
  return index === -1 ? null : { row: rows[index], number: index + 2 };
}

function hasReceipt_(sheet, token, submissionId) {
  if (sheet.getLastRow() < 2) return false;
  const rows = sheet.getRange(2, 2, sheet.getLastRow() - 1, 2).getValues();
  return rows.some(
    (row) => String(row[0]) === submissionId && String(row[1]) === token,
  );
}

function getOrCreateSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return sheet;
  }

  const currentHeaders = sheet
    .getRange(1, 1, 1, headers.length)
    .getValues()[0]
    .map(String);
  if (headers.some((header, index) => currentHeaders[index] !== header)) {
    throw new Error(
      `La hoja ${name} tiene un formato diferente. Usa una hoja nueva o ajusta los encabezados.`,
    );
  }
  return sheet;
}

function splitGuestNames_(value) {
  return String(value || "")
    .split(/[,\n]/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function normalizeName_(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase();
}

function createWhatsAppLink_(phone, message) {
  const normalizedPhone = normalizePhone_(phone);
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

function normalizePhone_(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length === 8 ? `${DEFAULT_COUNTRY_CODE}${digits}` : digits;
}

function createOutput_(payload, prefix) {
  const safePrefix = /^rsvpJsonp\d+$/.test(prefix) ? prefix : "";
  const content = safePrefix
    ? `${safePrefix}(${JSON.stringify(payload)})`
    : JSON.stringify(payload);
  const mimeType = safePrefix
    ? ContentService.MimeType.JAVASCRIPT
    : ContentService.MimeType.JSON;
  return ContentService.createTextOutput(content).setMimeType(mimeType);
}

function isValidToken_(token) {
  return /^[a-zA-Z0-9-]{20,80}$/.test(token);
}

function hasResponded_(value) {
  return String(value).trim().toLowerCase() === "respondido";
}

function isActive_(value) {
  return !["no", "false", "0", "inactivo"].includes(
    String(value).trim().toLowerCase(),
  );
}
