const HtmlWebpackPlugin = require('html-webpack-plugin');
const {scanFiles, getAltName} = require('./src/scanDir')

const getHtmlPlugins =()=>{
  let files = scanFiles()
  htmlPlugins = []; 
  for(let filePath of files.html){
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