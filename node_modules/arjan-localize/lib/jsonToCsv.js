module.exports = function exportCsv(lang, obj){
  return new Promise((resolve, reject) => {
    let locale = JSON.parse(obj)
    var csv = `key,${lang}\n`
    for(key in locale) csv += `${key},"${locale[key]}"\n`
    resolve(csv)
  })
}