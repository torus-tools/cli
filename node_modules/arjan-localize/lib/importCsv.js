//var fs = require("fs");

module.exports = function exportCsv(lang, csv){
  //let filename = filepath.substr(filepath.lastIndexOf('/'), filepath.lastIndexOf('.'))
  //let rawdata = fs.readFileSync(filepath, 'utf8')
  return new Promise((resolve, reject) => {
    //console.log(csv)
    let csvArr = csv.split('\n')
    let obj = {}
    for(let i=1; i<csvArr.length; i++){
      //console.log(csvArr[i])
      let keyVal = csvArr[i].split(',')
      if(keyVal[1] && keyVal[1].length > 1) keyVal[1] = keyVal[1].substr(1, keyVal[1].length -2);
      obj[keyVal[0]] = keyVal[1]
    }
    resolve(JSON.stringify(obj))
    //fs.writeFileSync(`locales/${lang}/${filename}.json`, obj)
  })
}