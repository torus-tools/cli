const path = require('path')
const plugins = require('./webpack.plugins.dev')
const {scanFiles, getAltName} = require('../scanDir')

const getEntries = () =>{
  let entries = {}
  let files = scanFiles()
  for(let script of files.js) entries[getAltName(script)+'_js'] = './'+script
  for(let filePath of files.html) entries[getAltName(filePath)] = './lib/'+filePath.substr(0,filePath.lastIndexOf('.')) + '.js'
  //console.log(entries)
  return entries;
}

module.exports = {
  mode: 'development',
  entry: getEntries,

  resolveLoader: {
    modules: [path.resolve(__dirname, '../../node_modules')],
  },
  module: {
    rules: [
      //JS
      {
        test: /\.js$/,
        exclude: [
          /node_modules/,
          /src/,
          /test/,
        ],
        loader: 'babel-loader',
        options: {
            presets: [path.resolve(__dirname, '../../node_modules/@babel/preset-env')]
        }
      },
      //CSS
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader"
        ],
      },
      //SASS
      {
        test: /\.s[c|a]ss$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: 'sass-loader',
            options: {
              //sourceMap,
            },
          },
        ],
      },
      //LESS
      {
        test: /\.less$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: 'less-loader',
            options: {
              //sourceMap,
            },
          },
        ],
      }
    ]
  },
  plugins
};