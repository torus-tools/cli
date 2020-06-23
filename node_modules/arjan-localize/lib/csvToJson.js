module.exports = function csvToJson(csv){
  return new Promise((resolve, reject) => {
    let csvBody = csv.split('\n', 2)[1]
    let csvArr = csvBody.split('\n')
    let obj = {}
    for(let key of csvArr){
      let keyVal = key.split(',"')
      if(keyVal[1]) obj[keyVal[0]] = keyVal[1].substr(0, keyVal[1].length-1)
    }
    resolve(JSON.stringify(obj))
  })
}