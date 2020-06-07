var CreateLocale = require('./lib/CreateLocale');
var TranslateLocale = require('./lib/TranslateLocale');
var TranslateHtml = require('./lib/TranslateHtml');
//var TranslateSite = require('./lib/TranslateSite');
var jsonToCsv = require('./lib/jsonToCsv');
var csvToJson = require('./lib/csvToJson');

module.exports.CreateLocale = CreateLocale;
module.exports.TranslateLocale = TranslateLocale;
module.exports.TranslateHtml = TranslateHtml;
//module.exports.TranslateSite = TranslateSite;
module.exports.jsonToCsv = jsonToCsv;
module.exports.csvToJson = csvToJson;