/* const plugins = require('./webpack.plugins.dev')
const {scanFiles, getAltName} = require('./src/scanDir')

const getEntries = () =>{
  let entries = {}
  let files = scanFiles()
  //for(let filePath of files.html) entries[getAltName(filePath)] = 'filePath.substr(0,filePath.lastIndexOf('.')) + '.js'
  for(let script of files.html) {
      let base = script.substr(script.indexOf('/'), script.length)
      let name = base.substr(0, base.lastIndexOf('.'))
      entries[name] = './'+script
  }
  console.log(entries)
  return entries;
}

module.exports = {
  mode: 'development',
  entry: getEntries,
  devServer: {
    port: 8080,
    open: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader"
        ],
      },
      {
        test: /\.js$/,
        exclude: [
          /node_modules/,
          /src/,
          /test/,
        ],
        loader: 'babel-loader',
        options: {
            presets: ['@babel/preset-env']
        }
      },
    ]
  },
  plugins
}; */

const plugins = require('./webpack.plugins.dev')
const {scanFiles, getAltName} = require('./src/scanDir')

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
  devServer: {
    port: 8080,
    open: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader"
        ],
      },
      {
        test: /\.js$/,
        exclude: [
          /node_modules/,
          /src/,
          /test/,
        ],
        loader: 'babel-loader',
        options: {
            presets: ['@babel/preset-env']
        }
      },
    ]
  },
  plugins
};