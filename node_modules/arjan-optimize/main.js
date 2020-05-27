const fs = require('fs');
var {copyFile, scanFolder} = require('./lib/recurse');
var unusedCss = require('./lib/unusedCss');
var compressImage =  require('./lib/compressImages');
var webP =  require('./lib/webp');
var UglifyJS = require("uglify-js");
var {minify} = require('html-minifier');

const cssnano = require('cssnano')
const postcss = require('postcss')

module.exports = async function index(webp, cleanCss){
  let res = await main(webp, cleanCss).catch((err) => {console.log(err)})
  /* if(cleanCss){
    console.log("Deleting unused CSS classes . . .");
    console.log('RESPONSE RESPONSE ', res)
    await unusedCss.deleteUnusedCss(res.stylesheets, res.classes)
    .then(console.log('All Done!'))
    .catch((err) => {console.log(err)})
  } */
  //console.log('RESPONSE RESPONSE ', res)
  if(webP) {
    //console.log('FILES ', res.htmlfiles)
    for(file of res.htmlfiles){
      let html = await fs.promises.readFile(file, 'utf8')
      for(img of res.images) html = await webP.replace(img, html, file)
      //console.log('HTML \n', html)
      var result = minify(html, {
        removeAttributeQuotes: false,
        removeComments: false,
        html5: true,
        minifyJS: false,
        collapseWhitespace: true,
        removeEmptyAttributes: true,
        removeEmptyElements: true
      });
      let fileSubPath = file.split('input/', 2)[1];
      await fs.promises.writeFile(`output/${fileSubPath}`, result)
    }
  }
  else console.log('All Done!');
}

function main(webp, cleanCss){
  return new Promise((resolve, reject) => {
    let classes = {};
    let stylesheets = [];
    let imageArr = [];
    let htmlArr = [];
    scanFolder("input/", async (filePath, stat) => {
      let fileSubPath = filePath.split('input/', 2)[1];
      let fileExtension = filePath.substring(filePath.lastIndexOf('.') + 1);
      //let fileName = filePath.substring(filePath.lastIndexOf('/') + 1)
      if(fileExtension =='html'){
        htmlArr.push(filePath);
        var html = await fs.promises.readFile(filePath, 'utf8').catch((err)=>reject(err))
        if(cleanCss){
          console.log('saving classes used in '+fileSubPath)
          classes = await unusedCss.createClassList(html, classes)
          //console.log("CLASS LIST", classes)
        }
        if(!webP){
          var result = minify(html, {
            removeAttributeQuotes: false,
            removeComments: false,
            html5: true,
            minifyJS: false,
            collapseWhitespace: true,
            removeEmptyAttributes: true,
            removeEmptyElements: true
          });
          await fs.promises.writeFile(`output/${fileSubPath}`, result)
        }
      }
      else if(fileExtension =='css'){
        //save the css file in stylesheets array
        stylesheets.push(filePath)
        /* if(!cleanCss){
          //minify CSS   
        } */
        fs.readFile(filePath, (err, css) => {
          postcss([cssnano])
            .process(css, { from: filePath, to: `output/${fileSubPath}` })
            .then(result => {
              fs.writeFile(`output/${fileSubPath}`, result.css, () => true)
              if ( result.map ) {
                fs.writeFile(`output/${fileSubPath}.map`, result.map, () => true)
              }
            })
        })
      }
      else if(fileExtension =='js'){
        console.log(`compressing ${fileSubPath} . . .`)
        var code = await fs.promises.readFile(filePath, 'utf8')
        var result = UglifyJS.minify(code);
        if (result.error) reject(result.error);
        else fs.promises.writeFile(`output/${fileSubPath}`, result.code)
        .then(console.log('compressed the js file'))
        .catch((err)=>console.log(err))
      }
      else {
        await compressImage(filePath, imageArr)
        .then((img) => {
          if(img) {
            imageArr.push(filePath);
            if(webp) webP.compress(filePath);
          }
          else {
            console.log(`file format ${fileExtension} not recognized by Arjan. Copying file as is.`)
            copyFile(fileSubPath)
          }
        }).catch((err) => console.log(err))   
      }    
    })
    resolve({stylesheets:stylesheets, classes:classes, htmlfiles:htmlArr, images:imageArr})
  })
}