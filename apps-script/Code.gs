/**
 * Team Shuffler registration feed.
 *
 * Paste into the form-responses spreadsheet (Extensions -> Apps Script), then
 * Deploy -> New deployment -> Web app, "Execute as: Me", "Who has access: Anyone".
 * Put the resulting /exec URL into FEED_URL in src/config.js.
 *
 * Only whitelisted columns are returned, so contact details such as email addresses never leave the sheet.
 */

// Leave empty to use the first tab (where Google Forms writes responses).
var SHEET_NAME = '';

var ALLOWED_COLUMNS = [/timestamp/i, /full\s*name/i, /^name$/i, /github/i, /skill/i, /level/i, /experience/i, /primary/i, /area of interest/i, /track/i];
var BLOCKED_COLUMNS = [/e-?mail/i, /phone/i, /mobile/i, /address/i, /contact/i];

function doGet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
    if (!sheet) return json({ error: 'Sheet "' + SHEET_NAME + '" not found' });

    var values = sheet.getDataRange().getValues();
    if (!values.length) return json({ headers: [], rows: [] });

    var keep = [];
    values[0].forEach(function (header, i) {
      var h = String(header).trim();
      var allowed = ALLOWED_COLUMNS.some(function (re) { return re.test(h); });
      var blocked = BLOCKED_COLUMNS.some(function (re) { return re.test(h); });
      if (h && allowed && !blocked) keep.push(i);
    });

    var headers = keep.map(function (i) { return String(values[0][i]).trim(); });
    var rows = values.slice(1)
      .map(function (row) {
        return keep.map(function (i) {
          var v = row[i];
          return v instanceof Date ? v.toISOString() : v;
        });
      })
      .filter(function (row) {
        return row.some(function (v) { return v !== '' && v !== null; });
      });

    return json({ headers: headers, rows: rows });
  } catch (err) {
    return json({ error: String(err && err.message ? err.message : err) });
  }
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
