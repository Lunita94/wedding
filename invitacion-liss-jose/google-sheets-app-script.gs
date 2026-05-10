const SHEET_NAME = "Confirmaciones";

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: "RSVP activo" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = getSheet();
  const data = e.parameter || {};

  sheet.appendRow([
    new Date(),
    data.couple || "",
    data.namesText || data.names || "",
    data.guestCount || "",
    data.attendanceText || data.attendance || "",
    data.confirmedAt || "",
    data.pageUrl || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Recibido",
      "Pareja",
      "Invitados",
      "Cantidad",
      "Respuesta",
      "Confirmado en",
      "Pagina"
    ]);
  }

  return sheet;
}
