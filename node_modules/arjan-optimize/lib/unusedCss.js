var fs = require('fs')

//finds used classes in the html files and adds them to a class list
function createClassList(htmlFile, classes){
  return new Promise((resolve, reject) => {
    if(htmlFile.includes("class=")){
      let htmlArr = htmlFile.split("class=")
      for(let i=1; i<=htmlArr.length; i++){
        let delim = `"`
        if(htmlArr[i].startsWith(`'`)) delim = `'`
        if(htmlArr[i].substr(1,1) !== htmlArr[i].substr(0,1)){
          let classesStr = htmlArr[i].split(delim)[1]
          if(!classesStr) console.log('Error. invalid class ' + htmlArr[i])
          let classesArr = classesStr.split(" ")
          for(let c of classesArr){
            //console.log('Class class ', c)
            if(!classes[c]) classes[c] = true
          }
        }
        if(i >= htmlArr.length-1) resolve(classes)
      }
    }
    else resolve(classes)
  })
}

//for all of the stylesheets it will parse classes and see if the class is present in the html. if not it will dlete the class from the stylesheet
function deleteUnusedCss(stylesheets, classes){
  console.log('CLASSES \n', classes)
  return new Promise((resolve, reject) => {
    for(let sheet of stylesheets){
      let stylesheet = fs.readFileSync(sheet, 'utf8')
      let styles = stylesheet.split("}")
      let i = 0;
      for(let style of styles){
        let classLine = style.split("{")[0]
        let classInstance = style+'}'
        if(classLine.includes(",")){
          console.log('Multi class item')
          /* let newsheet = stylesheet
          let classLineItems = classLine.split(",")
          let items = 0;
          let toDel = 0;
          for(let item of classLineItems) {
            findClasses(sheet, item, classes, (err, data) => {
              if(err) throw new Error(err)
              else{
                items+=1
                if(data) {
                  newsheet = stylesheet.replace(item, "")
                  toDel += 1
                }
              }
            })
          }
          if(items === toDel) {
            //console.log("deleteing ", classInstance)
            stylesheet = stylesheet.replace(classInstance, "")
          }
          else stylesheet = newsheet */
          //console.log(classLine)
        }
        else {
          findClasses(sheet, classLine, classes, (err, data) => {
            if(err) reject(err)
            else{
              if(data){
                //console.log('CLASS INSTANCE ', classInstance)
                stylesheet = stylesheet.replace(classInstance, "")
                //console.log('deleted class ', data)
              }
            }
          })
        }
        i+=1
      }
      let elems = styles.length -1
      let outputPath = 'output/' + sheet.split("input/", 2)[1]
      //console.log(stylesheet)
      if(i >= elems) fs.promises.writeFile(outputPath, stylesheet).then(()=> resolve(true)).catch((err) => reject(err))
    }
  })
}

//splits a class line item into classes sepparated by dots
function findClasses(stylesheet, classLine, classes, callback){
  let classArr = classLine.trim().split(" ")
  //console.log('STYLESHEET', stylesheet, classArr)
  c = classArr[0].replace('\n',"").trim()
  //console.log('CLASS ', c)
  //console.log(c)
  if(c.includes(".")){
      inst = c.substr(1, c.length)
      //console.log('INST ', inst)
      if(!classes[inst]) {
        //console.log(inst)
        callback(null, inst)
      }
  }
  callback(null, null)
}


module.exports = {
  createClassList,
  deleteUnusedCss,
  findClasses
}