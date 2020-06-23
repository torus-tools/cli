const plugins = require('./webpack.plugins')
const {scanFiles, getAltName} = require('./src/scanDir')

const getEntries = () =>{
  let entries = {}
  let files = scanFiles()
  for(let script of files.js) entries[getAltName(script)+'_js'] = './'+script
  for(let filePath of files.html) entries[getAltName(filePath)] = './lib/'+filePath.substr(0,filePath.lastIndexOf('.')) + '.js'
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
};