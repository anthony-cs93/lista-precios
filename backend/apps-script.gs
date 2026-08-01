// APPS SCRIPT (script.gs) — Con validación de contraseña para escritura.
// 1. Cambia WRITE_PASSWORD por tu clave real.
// 2. Copia TODO este archivo a tu proyecto en script.google.com.
// 3. Republica el web app (Implementar > Nueva implementación > Web app, acceso "Cualquier persona").

const WRITE_PASSWORD = "mi_clave_secreta";

const COL_MAP = {
  "#": "id", "PRODUCTO": "nombre", "MEDIDA SEC.": "caracteristicas",
  "GRUPO": "categoria", "MARCA": "marca", "PROVEEDOR": "proveedor",
  "U.M.": "um", "PRECIO UNIT": "precio",
  "PRESENT. X MAYOR": "presentacion", "PRECIO X CJA": "precioCja",
  "PRECIO X MAYOR": "precioMayor"
};
const HROW = 4;

function findSheet() {
  for (const s of SpreadsheetApp.getActiveSpreadsheet().getSheets()) {
    const r = s.getRange(HROW, 1, 1, s.getLastColumn()).getValues()[0];
    if (r[0] === "#" && r[1] === "PRODUCTO") return s;
  }
  return null;
}

function parsePrice(v) {
  if (typeof v === "number") return v;
  if (!v) return 0;
  return parseFloat(String(v).replace("S/","").trim().replace(/\./g,"").replace(",",".")) || 0;
}

function toApp(headers, row) {
  const item = {};
  headers.forEach((h, i) => {
    const k = COL_MAP[h] || h;
    item[k] = k === "precio" ? parsePrice(row[i]) : row[i];
  });
  if (!item.imagen) item.imagen = "";
  if (!item.notas) item.notas = "";
  return item;
}

function toSheet(headers, body, nextId) {
  return headers.map(h => {
    const k = COL_MAP[h];
    if (!k) return "";
    if (k === "id") return nextId;
    if (k === "precio") return Number(body[k]) || 0;
    return body[k] !== undefined ? body[k] : "";
  });
}

function doGet() {
  const sheet = findSheet();
  if (!sheet) return json([]);
  const last = sheet.getLastRow();
  if (last < HROW + 1) return json([]);
  const cols = Object.keys(COL_MAP).length;
  const data = sheet.getRange(HROW, 1, last - HROW + 1, cols).getValues();
  const items = data.slice(1).filter(r => r[0]).map(r => toApp(data[0], r));
  items.sort((a, b) => Number(b.id) - Number(a.id));
  return json(items);
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = body._action;
  delete body._action;

  if (action === "verify") {
    return body._password === WRITE_PASSWORD
      ? json({ ok: true })
      : err("Contraseña incorrecta");
  }

  if (body._password !== WRITE_PASSWORD) return err("Contraseña incorrecta");
  delete body._password;

  if (action === "create") return handleCreate(body);
  if (action === "update") return handleUpdate(body);
  if (action === "delete") return handleDelete(body);
  return err("Acción desconocida");
}

function handleCreate(body) {
  const sheet = findSheet();
  if (!sheet) return err("Sheet not found");
  const headers = sheet.getRange(HROW, 1, 1, sheet.getLastColumn()).getValues()[0];
  const last = sheet.getLastRow();
  const prev = last >= HROW ? sheet.getRange(HROW + 1, 1, last - HROW, 1).getValues().flat() : [];
  const nextId = Math.max(0, ...prev.filter(Boolean).map(Number)) + 1;
  sheet.appendRow(toSheet(headers, body, nextId));
  return json({ success: true, id: nextId });
}

function handleUpdate(body) {
  const sheet = findSheet();
  if (!sheet) return err("Sheet not found");
  const last = sheet.getLastRow();
  const cols = sheet.getLastColumn();
  const data = sheet.getRange(HROW, 1, last - HROW + 1, cols).getValues();
  const headers = data[0];
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(body.id)) {
      headers.forEach((h, idx) => {
        const k = COL_MAP[h];
        if (k && k !== "id" && body[k] !== undefined) {
          sheet.getRange(HROW + i, idx + 1).setValue(k === "precio" ? Number(body[k]) : body[k]);
        }
      });
      break;
    }
  }
  return json({ success: true });
}

function handleDelete(body) {
  const sheet = findSheet();
  if (!sheet) return err("Sheet not found");
  const data = sheet.getRange(HROW, 1, sheet.getLastRow() - HROW + 1, 1).getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(body.id)) { sheet.deleteRow(HROW + i); break; }
  }
  return json({ success: true });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function err(msg) {
  return ContentService.createTextOutput(JSON.stringify({ error: msg })).setMimeType(ContentService.MimeType.JSON);
}
