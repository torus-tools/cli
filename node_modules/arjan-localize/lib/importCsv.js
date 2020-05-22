var fs = require("fs");

module.exports = function exportCsv(lang, filepath){
  let filename = filepath.substr(filepath.lastIndexOf('/'), filepath.lastIndexOf('.'))
  let rawdata = fs.readFileSync(filepath, 'utf8')
  let csvArr = rawdata.split('\n')
  let obj = {}
  for(let i=1; i<csvArr.length; i++){
    let keyVal = csvArr[i].split(',')[0]
    obj[keyVal[0]] = keyVal[1]
  }
  fs.writeFileSync(`locales/${lang}/${filename}.json`, obj)
}