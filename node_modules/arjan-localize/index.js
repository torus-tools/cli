var {initBuild, addVar, createDir, createFile} = require('./lib/Build')
var CreateLocale = require('./lib/CreateLocale');
var TranslateLocale = require('./lib/TranslateLocale');
var TranslateHtml = require('./lib/TranslateHtml');
var TranslateSite = require('./lib/TranslateSite');
var exportCsv = require('./lib/exportCsv');
var importCsv = require('./lib/importCsv');

module.exports.Build = initBuild;
module.exports.AddVar = addVar;
module.exports.CreateDir = createDir;
module.exports.createFile = createFile;
module.exports.CreateLocale = CreateLocale;
module.exports.TranslateLocale = TranslateLocale;
module.exports.TranslateHtml = TranslateHtml;
module.exports.TranslateSite = TranslateSite;
module.exports.exportCsv = exportCsv;
module.exports.importCsv = importCsv;