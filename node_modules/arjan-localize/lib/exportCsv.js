var fs = require("fs");
//const elements = require('./HtmlElements');

//fs.readdirSync(from).forEach(function(filename){

module.exports = function exportCsv(lang, obj){
  return new Promise((resolve, reject) => {
    //let rawdata = fs.readFileSync(`./locales/${lang}/${filename}.json`)
    let locale = JSON.parse(obj)
    var csv = `ID,${lang}\n`
    for(key in locale) csv += `${key},"${locale[key]}"\n`
    //console.log('CSV ', csv)
    resolve(csv)
    //fs.writeFileSync(`${filename}.csv`, csv)
  })
}