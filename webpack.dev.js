const HtmlWebpackPlugin = require('html-webpack-plugin');

function scanFiles(){
  let arrs = [];
  return new Promise(async (resolve, reject) => {
    scanDir("./", (filePath, stat) => arrs.push(filePath))
    resolve(arrs)
  })
}
function scanDir(currentDirPath, callback) {
  fs.readdirSync(currentDirPath).forEach((name)=>{
    var filePath = path.join(currentDirPath, name);
    var stat = fs.statSync(filePath);
    if(!ignorePaths[filePath]) {
      if (stat.isFile()) {
        let ext = name.substr(name.lastIndexOf(".")+1, name.length)
        function scanFiles(){
          let arrs = [];
          return new Promise(async (resolve, reject) => {
            scanDir("./", (filePath, stat) => arrs.push(filePath))
            resolve(arrs)
          })
        }
        function scanDir(currentDirPath, callback) {
          fs.readdirSync(currentDirPath).forEach((name)=>{
            var filePath = path.join(currentDirPath, name);
            var stat = fs.statSync(filePath);
            if(!ignorePaths[filePath]) {
              if (stat.isFile()) {
                let ext = name.substr(name.lastIndexOf(".")+1, name.length)
                if(ext === "html") callback(filePath, stat);
              }
              else if (stat.isDirectory()) {
                //i && !fs.existsSync(`}/${filePath}`)) fs.mkdirSync(`}/${filePath}`)
                scanDir(filePath, callback)
              }
            }
          });
        }      scanDir(filePath, callback)
      }
    }
  });
}

/* async function returnHtmlpack(){
  for(let item in await scanFiles()){
    return new HtmlWebpackPlugin({
      template: './index.html',
      inject: true,
      chunks: ['index'],
      filename: item,
    })
  }
} */

module.exports = {

  // https://webpack.js.org/concepts/entry-points/#multi-page-application
  entry: {
    index: './src/webpack.js',
    audit: './src/audit.js'
  },

  // https://webpack.js.org/configuration/dev-server/
  devServer: {
    port: 8080
  },

  // https://webpack.js.org/concepts/plugins/
  plugins: [
    new HtmlWebpackPlugin({
      template: './es/index.html',
      inject: true,
      chunks: ['index'],
      filename: 'index.html'
    }),
    new HtmlWebpackPlugin({
      template: './es/audit.html',
      inject: true,
      chunks: ['audit'],
      filename: 'audit.html'
    })
  ]
};
