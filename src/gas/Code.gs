/**
 * Google Apps Script Web App backend for the Evergreen Purchase Module.
 *
 * Deploy:
 *   1. Open (or create) the target Google Sheet — this becomes the database.
 *      Each entity gets its own tab; tabs are created automatically on first
 *      write if missing, with headers taken from the first record's keys.
 *   2. Extensions -> Apps Script, paste this file in as Code.gs.
 *   3. Deploy -> New deployment -> type "Web app".
 *        Execute as: Me
 *        Who has access: Anyone (see README note on adding a shared secret
 *        before wider rollout — this endpoint has no auth by default).
 *   4. Copy the Web App URL into the app's Developer Config page
 *      (Apps Script Exec URL) or VITE_SHEETS_API_URL at build time.
 *
 * Contract:
 *   GET  ?tab=<TabName>            -> { ok: true, data: [ {...row}, ... ] }
 *   GET  ?tab=<TabName>&ping=1     -> { ok: true } if the tab exists/reachable
 *   POST { action: 'upsert', tab, record: { id, ...fields } }
 *        -> { ok: true, data: record }
 *        Inserts a new row if `id` isn't found in the tab, otherwise
 *        overwrites the matching row in place.
 *
 * All responses are JSON. Errors come back as { ok: false, error: string }.
 */

function doGet(e) {
  try {
    var tab = e.parameter.tab
    if (!tab) return jsonResponse_({ ok: false, error: 'Missing tab parameter' })

    var sheet = SpreadsheetApp.getActive().getSheetByName(tab)
    if (e.parameter.ping) {
      return jsonResponse_({ ok: !!sheet })
    }
    if (!sheet) return jsonResponse_({ ok: true, data: [] })

    return jsonResponse_({ ok: true, data: readSheet_(sheet) })
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) })
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents)
    if (body.action !== 'upsert') {
      return jsonResponse_({ ok: false, error: 'Unsupported action: ' + body.action })
    }
    var tab = body.tab
    var record = body.record
    if (!tab || !record || !record.id) {
      return jsonResponse_({ ok: false, error: 'Missing tab or record.id' })
    }

    var sheet = SpreadsheetApp.getActive().getSheetByName(tab)
    if (!sheet) sheet = createSheetWithHeaders_(tab, Object.keys(record))

    upsertRow_(sheet, record)
    return jsonResponse_({ ok: true, data: record })
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) })
  }
}

// --- Helpers -----------------------------------------------------------------

function readSheet_(sheet) {
  var values = sheet.getDataRange().getValues()
  if (values.length < 2) return []
  var headers = values[0]
  var rows = values.slice(1)
  return rows
    .filter(function (row) {
      return row.some(function (cell) {
        return cell !== ''
      })
    })
    .map(function (row) {
      var record = {}
      headers.forEach(function (header, i) {
        record[header] = row[i]
      })
      return record
    })
}

function createSheetWithHeaders_(tabName, headers) {
  var sheet = SpreadsheetApp.getActive().insertSheet(tabName)
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
  sheet.setFrozenRows(1)
  return sheet
}

function upsertRow_(sheet, record) {
  var range = sheet.getDataRange()
  var values = range.getValues()
  var headers = values[0]

  // Grow the header row if the record introduces a new field.
  var missingKeys = Object.keys(record).filter(function (k) {
    return headers.indexOf(k) === -1
  })
  if (missingKeys.length) {
    headers = headers.concat(missingKeys)
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
  }

  var idColIndex = headers.indexOf('id')
  var rowValues = headers.map(function (h) {
    return h in record ? record[h] : ''
  })

  for (var r = 1; r < values.length; r++) {
    if (values[r][idColIndex] === record.id) {
      sheet.getRange(r + 1, 1, 1, rowValues.length).setValues([rowValues])
      return
    }
  }
  sheet.getRange(sheet.getLastRow() + 1, 1, 1, rowValues.length).setValues([rowValues])
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON)
}
