var fs = require("fs");
const elements = require('./HtmlElements');

//fs.readdirSync(from).forEach(function(filename){

module.exports = function exportCsv(lang, filename){
  let rawdata = fs.readFileSync(`./locales/${lang}/${filename}.json`)
  let locale = JSON.parse(rawdata)
  var csv = `ID,${lang}\n`
  for(key in locale){
    csv += `${key},"${locale[key]}"\n`
  }
  fs.writeFileSync(`${filename}.csv`, csv)
}