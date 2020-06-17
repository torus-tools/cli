const path = require('path');

const buildPath = path.resolve(__dirname, 'dep_pack');

var plugins = require('./webpack.plugins')

const {scanFiles, getAltName} = require('./src/scanDir')
//plugins.push(new CleanWebpackPlugin(buildPath))

const getEntries = () =>{
  let entries = {}
  let files = scanFiles()
  //for(let filePath of files.html) entries[getAltName(filePath)] = './lib/'+filePath.substr(0,filePath.lastIndexOf('.')) + '.js'
  for(let script of files.js) entries[script.substr(0,script.lastIndexOf('.'))] = './'+script
  console.log(entries)
  return entries;
}

module.exports = {
    mode:'production',
    entry: getEntries,
    output: {
        path: buildPath
    },
};