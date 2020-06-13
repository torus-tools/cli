const plugins = require('./webpack.plugins')
const {scanFiles, getAltName} = require('./src/scanDir')

const getEntries = () =>{
  let entries = {}
  let files = scanFiles()
  for(let filePath of files) entries[getAltName(filePath)] = './lib/'+filePath.substr(0,filePath.lastIndexOf('.')) + '.js'
  console.log(entries)
  return entries;
}


module.exports = {
  // https://webpack.js.org/concepts/entry-points/#multi-page-application
  entry: getEntries,

  // https://webpack.js.org/configuration/dev-server/
  devServer: {
    port: 8080
  },
  // https://webpack.js.org/concepts/plugins/
  plugins
};



/* module.exports = {

  // https://webpack.js.org/concepts/entry-points/#multi-page-application
  entry: {
    index: './lib/index.js',
    localize: './lib/localize.js',
    es_audit: './lib/es/audit.js',
    es_deploy: './lib/es/optimize.js'
  },

  // https://webpack.js.org/configuration/dev-server/
  devServer: {
    port: 8080
  },

  // https://webpack.js.org/concepts/plugins/
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: true,
      chunks: ['index'],
      filename: 'index.html'
    }),
    new HtmlWebpackPlugin({
      template: './localize.html',
      inject: true,
      chunks: ['localize'],
      filename: 'localize.html'
    }),
    new HtmlWebpackPlugin({
      template: './es/audit.html',
      inject: true,
      chunks: ['es_audit'],
      filename: 'audit.html'
    }),
    new HtmlWebpackPlugin({
      template: './es/deploy.html',
      inject: true,
      chunks: ['es_deploy'],
      filename: 'deploy.html'
    })
  ]
}; */