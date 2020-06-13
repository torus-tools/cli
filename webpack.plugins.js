const HtmlWebpackPlugin = require('html-webpack-plugin');
const {scanFiles, getAltName} = require('./src/scanDir')

const ignorePaths = {
  'node_modules':true,
  'dep_pack':true
}

const getHtmlPlugins =()=>{
  let files = scanFiles()
  console.log('FILEs ', files)
  htmlPlugins = []; 
  for(let filePath of files){
    htmlPlugins.push(
    new HtmlWebpackPlugin({
      template: './'+filePath,
      inject: true,
      chunks: [getAltName(filePath)],
      filename: filePath.includes('/') ? filePath.substr(filePath.lastIndexOf('/')+1, filePath.length) : filePath
    })
    )
  }
  return htmlPlugins
}

module.exports = getHtmlPlugins()