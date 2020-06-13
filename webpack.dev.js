const fs = require('fs');
const path = require('path');
const plugins = require('./webpack.plugins')

const ignorePaths = {
  'node_modules':true,
  'dep_pack':true
}

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
}

const getAltName =(filePath)=> filePath.substr(0, filePath.lastIndexOf(".")).replace(/\//g, '_')

const getEntries =async()=>{
  let entries = {}
  let files = await scanFiles()
  for(let filePath of files){
    //console.log(getAltName(filePath))
    entries[getAltName(filePath)] = './lib/'+filePath.substr(0,filePath.lastIndexOf('.')) + '.js'
  }
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