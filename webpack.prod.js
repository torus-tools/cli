const path = require('path');

const buildPath = path.resolve(__dirname, 'dep_pack/js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {scanFiles, getAltName} = require('./src/scanDir')
//plugins.push(new CleanWebpackPlugin(buildPath))
var plugins = require('./webpack.plugins.prod')
plugins.push(
    new MiniCssExtractPlugin({
        filename: "../css/[name].css",
        chunkFilename: "[id].[contenthash].css"
    })
)

const getEntries = () =>{
  let entries = {}
  let files = scanFiles()
  //for(let filePath of files.html) entries[getAltName(filePath)] = 'filePath.substr(0,filePath.lastIndexOf('.')) + '.js'
  for(let script of files.js) {
      let base = script.substr(script.indexOf('/'), script.length)
      let name = base.substr(0, base.lastIndexOf('.'))
      entries[name] = './'+script
  }
  return entries;
}

module.exports = {
    mode:'production',
    entry: getEntries,
    output: {
        path: buildPath
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                  MiniCssExtractPlugin.loader,
                    "css-loader"
                ]
            }
        ]
    },
    plugins
};