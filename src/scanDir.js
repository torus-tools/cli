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

//create the appropriate filestructure for each file
function createFakePaths(files){
  return new Promise((resolve, reject) => {
    Build.createDir('./lib')
    .then(async (data)=> {
      for(let f in files){
        if(files[f].startsWith('./')) files[f] = files[f].substr(2);
        if(files[f].includes('/')){
          let dirs = files[f].split('/');
          let path = './lib';
          for(let i=0; i<dirs.length-1; i++){
            path += '/'+dirs[i];
            await Build.createDir(path).catch(err => reject(err))
            if(i >= dirs.length -2  && f >= files.length-1) resolve(true)
          }
        }
        else if(f >= files.length-1) resolve(true)
      }
    }).catch(err => reject(err))
  })
}

function createFakeScripts(){
  return new Promise((resolve, reject) => {
    //files should get html js and css files.
    let files = scanFiles()
    console.log(files)
    let stylesheets = files.css.map(style => `require('../${style}')`).join('\n')
    createFakePaths(files.html)
    .then(() => {
      for(let f in files.html){
        let filename = './lib/'+files.html[f].substr(0,files.html[f].lastIndexOf('.')) + '.js';
        Build.createFile(filename, files.html[f].includes('/')?'':stylesheets)
        .then(()=> {
          if(f>=files.html.length-1)resolve(true)
        }).catch(err => reject(err))
      }
    }).catch(err => reject(err))
  })
}

const getAltName =(filePath)=> filePath.substr(0, filePath.lastIndexOf(".")).replace(/\//g, '_')

module.exports = {
  scanFiles,
  scanDir,
  getAltName,
  createFakePaths,
  createFakeScripts
}