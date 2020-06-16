/* const { CleanWebpackPlugin } = require('clean-webpack-plugin'); 
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');
const plugins = require('./webpack.plugins')
plugins.push(
  new MiniCssExtractPlugin({
    filename: "[name].[contenthash].css",
    chunkFilename: "[id].[contenthash].css"
  })
)
plugins.push(new CleanWebpackPlugin(buildPath))
const {scanFiles, getAltName} = require('./src/scanDir')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin')
const buildPath = path.resolve(__dirname, 'dist');

const getEntries = () =>{
  let entries = {}
  let files = scanFiles()
  for(let script of files.js) entries[getAltName(script)+'_js'] = './'+script
  for(let filePath of files.html) entries[getAltName(filePath)] = './lib/'+filePath.substr(0,filePath.lastIndexOf('.')) + '.js'
  console.log(entries)
  return entries;
}

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dep_pack'),
  },
};
module.exports = {
  mode: 'production',
  entry: getEntries,
  module: {
    rules: [
      {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
              presets: ['@babel/preset-env']
          }
      },
      {
          test: /\.css$/,
          use: [
              MiniCssExtractPlugin.loader,
              "css-loader"
          ]
      }
    ]
  },
  plugins,
  optimization: {
    minimize: true,
    minimizer: [
        new TerserPlugin({
            cache: true,
            parallel: true,
            sourceMap: true
        }),
        new OptimizeCssAssetsPlugin({})
    ]
}
}; */