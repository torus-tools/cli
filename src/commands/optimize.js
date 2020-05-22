const {Command, flags} = require('@oclif/command')
const Optimize = require('arjan-optimize')
const Localize = require('arjan-localize')
const fs = require('fs')

class OptimizeCommand extends Command {
  async run() {
    const {flags, args} = this.parse(OptimizeCommand)
    await Localize.CreateDir('./dep_pack')
    await Localize.createFile('./optimize_config.json')
    let res = await main(args, flags).catch((err) => {console.log(err)})
    if(flags.webp) {
      //console.log('FILES ', res.htmlfiles)
      for(file of res.htmlfiles){
        let html = await fs.promises.readFile(file, 'utf8')
        for(img of res.images) html = await webP.replace(img, html, file)
        //console.log('HTML \n', html)
        if(flags.html){
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
    }
    else console.log('All Done!');
  }
}

function main(args, flags){
  return new Promise((resolve, reject) => {
    let classes = {};
    let stylesheets = [];
    let imageArr = [];
    let htmlArr = [];
    if(args.filename) optimizeFile(args.filename, args, flags)
    else {
      scanFolder("input/", (filePath, stat) => {
        //let fileName = filePath.substring(filePath.lastIndexOf('/') + 1)
        optimizeFile(filePath, args, flags)
      })
    }
    resolve({stylesheets:stylesheets, classes:classes, htmlfiles:htmlArr, images:imageArr})
  })
}

function optimizeFile(filePath, args, flags){
  let fileSubPath = filePath.split('input/', 2)[1];
  let fileExtension = filePath.substring(filePath.lastIndexOf('.') + 1);
  return new Promise((resolve, reject) => {
    if(fileExtension =='html'){
      htmlArr.push(filePath);
      var html = await fs.promises.readFile(filePath, 'utf8').catch((err)=>reject(err))
      /* if(cleanCss){
        console.log('saving classes used in '+fileSubPath)
        classes = await unusedCss.createClassList(html, classes)
        //console.log("CLASS LIST", classes)
      } */
      if(flags.html && !flags.webp){
        var result = minify(html, {
          removeAttributeQuotes: false,
          removeComments: false,
          html5: true,
          minifyJS: false,
          collapseWhitespace: true,
          removeEmptyAttributes: true,
          removeEmptyElements: true
        });
        await fs.promises.writeFile(`output/${fileSubPath}`, result).then(() => resolve('minified '+ filePath))
      }
      else resolve("")
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
}

OptimizeCommand.description = `Describe the command here
...
Extra documentation goes here
`
OptimizeCommand.args = [
  {
    name: 'sitename',
    required: true,
    description: 'name of the site i.e. yoursite.com'
  },
  {
    name: 'filename',
    required: false,
    description: 'name of the file i.e. index.html',
  }
]

OptimizeCommand.flags = {
  images: flags.boolean({
    char: 'i',                    
    description: 'compress images and if possible maintain the format. otherwise its converted to png.',        
  }),
  webp: flags.boolean({
    char: 'w',                    
    description: 'saves a webp version of each image, then replaces each image instance in the html files with a picture tag.',        
  }),
  /* responsive: flags.boolean({
    char: 'r',                    
    description: 'resizes images efficiently for each type of device (sm, md, lg), then replaces each image instance in the html files with a picture tag.'    
  }), */
  html: flags.boolean({
    char: 'h',                    
    description: 'compress html using html-minifier',        
  }),
  css: flags.string({
    char: 'c',
    description: 'minifiy css using cssnano',
  }),
  /* unusedcss: flags.string({
    char: 'u',
    description: 'remove unused css classes',
  }), */
  js: flags.string({
    char: 'j',
    description: 'minify js using uglify js'
  })
}

module.exports = OptimizeCommand
