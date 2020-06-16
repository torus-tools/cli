const path = require('path');
//const { CleanWebpackPlugin } = require('clean-webpack-plugin'); 
//const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin')
const buildPath = path.resolve(__dirname, 'dep_pack');
var plugins = require('./webpack.plugins')
plugins.push(
  new MiniCssExtractPlugin({
    filename: "[name].css",
    chunkFilename: "[id].[contenthash].css"
  })
)
const {scanFiles, getAltName} = require('./src/scanDir')
//plugins.push(new CleanWebpackPlugin(buildPath))

const getEntries = () =>{
  let entries = {}
  let files = scanFiles()
  for(let script of files.js) entries[script.substr(0,script.lastIndexOf('.'))] = './'+script
  for(let filePath of files.html) entries[filePath.substr(0,filePath.lastIndexOf('.'))] = './lib/'+filePath.substr(0,filePath.lastIndexOf('.')) + '.js'
  console.log(entries)
  return entries;
}

module.exports = {
    mode: 'production',
    entry: getEntries,
    output: {
        filename: '[name].js',
        path: buildPath
    },

    // https://webpack.js.org/concepts/loaders/
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

    // https://webpack.js.org/concepts/plugins/
    plugins,

    // https://webpack.js.org/configuration/optimization/
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                cache: true,
                parallel: true,
            }),
            new OptimizeCssAssetsPlugin({})
        ]
    }
};