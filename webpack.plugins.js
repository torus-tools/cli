const HtmlWebpackPlugin = require('html-webpack-plugin');
const {scanFiles, getAltName} = require('./src/scanDir')

const getHtmlPlugins =()=>{
  let files = scanFiles()
  htmlPlugins = []; 
  for(let filePath of files.html){
    htmlPlugins.push(
    new HtmlWebpackPlugin({
      template: './'+filePath,
      inject: 'body',
      chunks: [filePath.substr(0,filePath.lastIndexOf('.'))],
      filename: '../'+filePath
    })
    )
  }
  return htmlPlugins
}

module.exports = getHtmlPlugins()