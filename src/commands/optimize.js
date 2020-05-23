const {Command, flags} = require('@oclif/command')
const Optimize = require('arjan-optimize')
const Localize = require('arjan-localize')
const {cli} = require('cli-ux');
const HtmlMinifier = require('html-minifier');
const UglifyJS = require("uglify-js");
const fs = require('fs')
const postcss = require('postcss')
const cssnano = require('cssnano')
/* ({
  preset: ['default', {
      discardComments: {
          removeAll: true,
      },
  }]
}); */

class OptimizeCommand extends Command {
  async run() {
    const {flags, args} = this.parse(OptimizeCommand)
    await Localize.CreateDir('./dep_pack')
    let config = await Localize.createFile('./optimize_config.json', Optimize.optimizeConfig.toString())
    let config_json = JSON.parse(config)
    cli.action.start('optimizing static assets')
    let res = await main(args, flags, config_json).catch((err) => {console.log(err)})
    if(res) cli.action.stop()
    if(flags.webp) {
      //console.log('FILES ', res.htmlfiles)
      cli.action.start('replacing imgs for pictures')
      for(file of res.htmlfiles){
        let html = await fs.promises.readFile(file, 'utf8')
        for(img of res.images) html = await Optimize.replaceWebp(img, html, file)
        //console.log('HTML \n', html)
        if(flags.html){
          var result = HtmlMinifier.minify(html, config_json.html_minifier);
          await fs.promises.writeFile(`./dep_pack/${file}`, result)
          .then(() => console.log(`Minfied ${filepath} using html-minifier`))
        }
      }
      cli.action.stop()
    }
    else console.log('All Done!');
  }
}

function main(args, flags, options){
  return new Promise((resolve, reject) => {
    let classes = {};
    let stylesheets = [];
    let imageArr = [];
    let htmlArr = [];
    if(args.filename) optimizeFile(args.filename, flags, options)
    else {
      scanFolder("./", (filePath, stat) => {
        //let fileName = filePath.substring(filePath.lastIndexOf('/') + 1)
        optimizeFile(filePath, args, options)
      })
    }
    resolve({stylesheets:stylesheets, classes:classes, htmlfiles:htmlArr, images:imageArr})
  })
}

function optimizeFile(filePath, flags, options){
  let fileExtension = filePath.substring(filePath.lastIndexOf('.') + 1);
  return new Promise((resolve, reject) => {
    if(fileExtension =='html'){
      htmlArr.push(filePath);
      var html = await fs.promises.readFile(filePath, 'utf8').catch((err)=>reject(err))
      /* if(cleanCss){
        console.log('saving classes used in '+filePath)
        classes = await unusedCss.createClassList(html, classes)
        //console.log("CLASS LIST", classes)
      } */
      if(flags.html && !flags.webp){
        var result = HtmlMinifier.minify(html, options.html_minifier);
        await fs.promises.writeFile(`./dep_pack/${filePath}`, result).then(() => console.log(`Minfied ${filepath} using html-minifier`))
      }
    }
    else if(fileExtension =='css'){
      //save the css file in stylesheets array
      stylesheets.push(filePath)
      /* if(!cleanCss){
        //minify CSS   
      } */
      fs.promises.readFile(filePath).then(css =>{
        postcss([cssnano])
          .process(css, { from: filePath, to: `./dep_pack/${filePath}` })
          .then(result => {
            fs.promises.writeFile(`./dep_pack/${filePath}`, result.css)
            .then(() => console.log(`Minfied ${filepath} using cssnano`))
            /* if ( result.map ) {
              fs.promises.writeFile(`./dep_pack/${filePath}.map`, result.map)
            } */
          }).catch(err=>reject(err))
      }).catch(err=>reject(err))
    }
    else if(fileExtension =='js'){
      console.log(`compressing ${filePath} . . .`)
      var code = await fs.promises.readFile(filePath, 'utf8')
      var result = UglifyJS.minify(code, options.uglify_options);
      if (result.error) reject(result.error);
      else fs.promises.writeFile(`./dep_pack/${filePath}`, result.code)
      .then(console.log(`Minified ${filepath} using UglifyJS`))
      .catch((err)=>console.log(err))
    }
    else {
      await Optimize.compressImage(filePath, "dep_pack", imageArr, options.svgo)
      .then((img) => {
        if(img) {
          imageArr.push(filePath);
          if(webp) Optimize.compressWebp(filePath);
        }
        else {
          console.log(`file format ${fileExtension} not recognized by Arjan. Copying file as is.`)
          Optimize.copyFile(filePath, "dep_pack")
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
