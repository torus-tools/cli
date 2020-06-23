module.exports = function csvToJson(csv){
  return new Promise((resolve, reject) => {
    let csvBody = csv.substr(csv.indexOf('\n')+1)
    let csvArr = csvBody.split('\n')
    let obj = {}
    for(let key of csvArr){
      let keyVal = key.split(',')
      if(key.includes(',"')) keyVal = key.split(',"')
      if(keyVal[1]) {
        let keytrim = keyVal[1].trim()
        obj[keyVal[0]] = keytrim.substr(0, keytrim.endsWith('"')?keytrim.length-1:keytrim.length)
      }
    }
    resolve(JSON.stringify(obj))
  })
}