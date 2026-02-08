/**
 * Google Apps Script: Web App to serve the daily menu from Google Sheets (avoids CORS). */

const SPREADSHEET_ID = "1cWqP5M4GF-OMYO8ITm9474k7CwlNgVjk2L5CJ8M6MCs";

function doGet(e) {
  const params = e.parameter || {};
  const gidParam = params.gid;
  const dayParam = params.day;
  const monthParam = params.month;
  const yearParam = params.year;

  if (gidParam === undefined || gidParam === "" || dayParam === undefined || dayParam === "") {
    return jsonResponse({ error: "Missing gid or day" }, 400, params.callback);
  }

  const gid = parseInt(gidParam, 10);
  const day = parseInt(dayParam, 10);
  const month = monthParam !== undefined && monthParam !== "" ? parseInt(monthParam, 10) : null;
  const year = yearParam !== undefined && yearParam !== "" ? parseInt(yearParam, 10) : null;
  if (Number.isNaN(gid) || Number.isNaN(day) || day < 1 || day > 31) {
    return jsonResponse({ error: "Invalid gid or day" }, 400, params.callback);
  }

  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheets().find(function (s) {
      return s.getSheetId() === gid;
    });

    if (!sheet) {
      return jsonResponse({ error: "Sheet not found for this month" }, 404, params.callback);
    }

    const data = sheet.getDataRange().getValues();
    if (!data || data.length < 2) {
      return jsonResponse({ error: "No menu data in sheet" }, 404, params.callback);
    }

    const headers = data[0].map(function (cell) {
      return String(cell || "").trim();
    });
    function norm(h) {
      return h.toLowerCase().replace(/\s/g, "").replace(/í/g, "i").replace(/á/g, "a");
    }
    const dateHeaderNames = ["fecha", "dia", "date", "diadelmes"];
    var fechaCol = -1;
    for (var h = 0; h < headers.length; h++) {
      var n = norm(headers[h]);
      if (dateHeaderNames.indexOf(n) !== -1) {
        fechaCol = h;
        break;
      }
    }
    if (fechaCol === -1) {
      fechaCol = 0;
    }

    function dateMatches(value) {
      if (value instanceof Date) {
        var d = value.getDate();
        var m = value.getMonth() + 1;
        var y = value.getFullYear();
        if (year !== null && month !== null) return d === day && m === month && y === year;
        return d === day;
      }
      if (typeof value === "number") {
        if (value >= 1 && value <= 31) return value === day;
        var dt = new Date(value);
        if (!isNaN(dt.getTime())) {
          if (year !== null && month !== null) {
            return dt.getDate() === day && dt.getMonth() + 1 === month && dt.getFullYear() === year;
          }
          return dt.getDate() === day;
        }
        return false;
      }
      var str = String(value).trim();
      if (!str) return false;
      var num = parseInt(str, 10);
      if (!isNaN(num) && num >= 1 && num <= 31 && str === String(num)) return num === day;
      var parts = str.split("/");
      if (parts.length >= 3) {
        var m = parseInt(parts[0], 10);
        var d = parseInt(parts[1], 10);
        var y = parseInt(parts[2], 10);
        if (!isNaN(m) && !isNaN(d) && !isNaN(y)) {
          if (year !== null && month !== null) return d === day && m === month && y === year;
          return d === day;
        }
      }
      return false;
    }

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var value = row[fechaCol];
      if (value === undefined || value === null || value === "") continue;
      if (dateMatches(value)) {
        var rowData = [];
        for (var c = 0; c < headers.length; c++) {
          rowData.push(row[c] !== undefined && row[c] !== null ? String(row[c]).trim() : "");
        }
        return jsonResponse({ headers: headers, row: rowData }, 200, params.callback);
      }
    }

    return jsonResponse({ error: "No menu for this day" }, 404, params.callback);
  } catch (err) {
    return jsonResponse({ error: err.message || "Server error" }, 500, params.callback);
  }
}

function jsonResponse(body, statusCode, callback) {
  var json = JSON.stringify(body);
  if (callback && /^[a-zA-Z0-9_.]+$/.test(String(callback))) {
    return ContentService.createTextOutput(callback + "(" + json + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
