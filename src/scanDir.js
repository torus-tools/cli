const fs = require('fs');
const path = require('path');
const Build = require('arjan-build')

const ignorePaths = {
  'node_modules':true,
  'dep_pack':true,
  'webpack.dev.js':true,
  'webpack.prod.js':true,
  'webpack.loaders.js':true,
  'webpack.plugins.js':true,
  'lib':true,
  'src':true,
  'test':true,
  'dist':true
}

function scanFiles(){
  let arrs = {html:[], css:[], js:[]};
    scanDir("./", (filePath, ext) => arrs[ext].push(filePath))
    return (arrs)
}

function scanDir(currentDirPath, callback) {
  fs.readdirSync(currentDirPath).forEach((name)=>{
    var filePath = path.join(currentDirPath, name);
    var stat = fs.statSync(filePath);
    if(!ignorePaths[filePath]) {
      if (stat.isFile()) {
        let ext = name.substr(name.lastIndexOf(".")+1, name.length)
        if(ext === 'html' || ext === 'css' || ext === 'js') callback(filePath, ext);
      }
      else if (stat.isDirectory()) {
        //i && !fs.existsSync(`}/${filePath}`)) fs.mkdirSync(`}/${filePath}`)
        scanDir(filePath, callback)
      }
    }
  });
}

function createFakes(input){
  return new Promise((resolve, reject) => {
    let files = scanFiles()
    for(let f in files.html){
      let pathBase = input?input+'/':'';
      let jsPath = pathBase+files.html[f].substr(0,files.html[f].lastIndexOf('.')) + '.js';
      Build.createFile(jsPath, '')
      .then(()=> {if(f>=files.html.length-1)resolve(true)}).catch(err => reject(err))
    }
  })
}

function injectStylesheets(files, input){
  return new Promise((resolve, reject)=>{
    let file_styles = {}
    for(let f in files){
      file_styles[files[f]]=[];
      let document = fs.readFileSync(files[f], 'utf8')
      let docarr = document.split('href=')
      for(let i=1; i<docarr.length; i++){
        let delim = docarr[i].substr(0,1)
        let link = docarr[i].split(delim)[1]
        if(link.endsWith('.css') && !link.startsWith('http')){
          file_styles[files[f]].push(link)
        }
      }
      //inject styles
      injectStyle(files[f], input, file_styles[files[f]])
      .then(()=>{if(f>=files.length-1)resolve(file_styles)})
      .catch(err=>reject(err))
    }
  })
}

function injectStyle(htmlPath, input, sheets){
  return new Promise((resolve, reject) => {
    let pathBase = input?input+'/':'';
    let jsPath = pathBase+htmlPath.substr(0,htmlPath.lastIndexOf('.')) + '.js';
    let ender = '//END_STYLE_INJECT'
    let script = fs.readFileSync(jsPath, 'utf8')
    let sheetstring = sheets.map(style => `require('../${style}')`).join('\n')+'\n//END_STYLE_INJECT\n';
    let contents = script.includes(ender)?sheetstring+script.split(ender)[1]:sheetstring+script;
    fs.promises.writeFile(jsPath, contents).then(()=> resolve(true))
  })
}

//function windowify(){}

const getAltName =(filePath)=> filePath.substr(0, filePath.lastIndexOf(".")).replace(/\//g, '_')

module.exports = {
  scanFiles,
  scanDir,
  getAltName,
  createFakes,
  injectStylesheets
}