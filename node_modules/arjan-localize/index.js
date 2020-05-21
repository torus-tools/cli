var {initBuild, addVar} = require('./lib/Build')
var CreateLocale = require('./lib/CreateLocale');
var TranslateLocale = require('./lib/TranslateLocale');
var TranslateHtml = require('./lib/TranslateHtml');
var TranslateSite = require('./lib/TranslateSite');

module.exports.Build = initBuild;
module.exports.AddVar = addVar;
module.exports.CreateLocale = CreateLocale;
module.exports.TranslateLocale = TranslateLocale;
module.exports.TranslateHtml = TranslateHtml;
module.exports.TranslateSite = TranslateSite;