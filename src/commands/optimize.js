const {Command, flags} = require('@oclif/command')
const fs = require('fs')
const Optimize = require('arjan-optimize')
const Localize = require('arjan-localize')
const {cli} = require('cli-ux');
const HtmlMinifier = require('html-minifier');
const csso = require('csso');
var Terser = require("terser");

/* ({
  preset: ['default', {
      discardComments: {
          removeAll: true,
      },
  }]
}); */
const path = require("path");

const ignorePaths = {
  "dep_pack":true,
  "node_modules":true,
  "package.json":true,
  "package_lock.json":true,
  ".env":true,
  ".git":true,
  ".gitignore":true,
  "README.md":true,
  "forms":true,
  "locales":true,
  "exports":true,
  ".yo-repository":true,
  "bin":true,
  "src":true,
  "test":true
}

class OptimizeCommand extends Command {
  async run() {
    const {flags, args} = this.parse(OptimizeCommand)
    cli.action.start('optimizing static assets')
    await Localize.CreateDir('./dep_pack')
    let config = await Localize.createFile('./optimize_config.json', JSON.stringify(Optimize.optimizeConfig))
    let config_json = JSON.parse(config)
    //console.log(config_json)
    let res = await main(args, flags, config_json).catch((err) => {console.log(err)})
    if(res) cli.action.stop()
    if(flags.webp) {
      //console.log('FILES ', res.htmlfiles)
      cli.action.start('replacing imgs for pictures')
      for(let file of res.htmlfiles){
        let html = await fs.promises.readFile(file, 'utf8')
        for(let img of res.images) html = await Optimize.replaceWebp(img, html, file)
        if(flags.html){
          //console.log("\x1b[31m", config_json.html_minifier,"\x1b[0m")
          var result = HtmlMinifier.minify(html, config_json.html_minifier);
          await fs.promises.writeFile(`./dep_pack/${file}`, result)
          .then(() => console.log(`Minfied ${file} using html-minifier`))
        }
      }
      cli.action.stop()
    }
    else console.log('All Done!');
  }
}

function main(args, flags, options){
  let arrs = {stylesheets:[], classes:{}, htmlfiles:[], images:[], file_sizes: {}}
  return new Promise((resolve, reject) => {
    if(args.filename) optimizeFile(args.filename, flags, options, imageArr)
    else {
      scanFolder("./", "./dep_pack", (filePath, stat) => {
        //let fileName = filePath.substring(filePath.lastIndexOf('/') + 1)
        optimizeFile(filePath, flags, options, arrs).then(data => arrs = data)
      })
    }
    resolve(arrs)
  })
}

//below we create a function called recurseFolder that takes in two parameters, the current folder and a callback function
function scanFolder(currentDirPath, output, callback) {
    fs.readdirSync(currentDirPath).forEach((name)=>{
      var filePath = path.join(currentDirPath, name);
      var stat = fs.statSync(filePath);
      if(ignorePaths[filePath]) console.log("ignoring ", filePath)
      else {
        if (stat.isFile()) callback(filePath, stat);
        else if (stat.isDirectory()) {
          if(!fs.existsSync(`${output}/${filePath}`)) fs.mkdirSync(`${output}/${filePath}`)
          scanFolder(filePath, output, callback)
        }
      }
    });
}

async function optimizeFile(filePath, flags, options, arrs){
    let fileExtension = filePath.substring(filePath.lastIndexOf('.') + 1);
    let fileStats = await fs.promises.stat(filePath)
    if(fileExtension =='html'){
      arrs.htmlfiles.push(filePath);
      var html = await fs.promises.readFile(filePath, 'utf8').catch((err)=>console.log(err))
      if(flags.html && !flags.webp){
        var result = HtmlMinifier.minify(html, options.html_minifier);
        await fs.promises.writeFile(`./dep_pack/${filePath}`, result).then(() => {
          let newStat = fs.statSync(`./dep_pack/${filePath}`);
          arrs.file_sizes[filePath] = {original:fileStats.size, compressed:newStat.size}
        }).catch(err=>console.log(err))
      }
    }
    else if(fileExtension =='css' && flags.css){
      //save the css file in stylesheets array
      arrs.stylesheets.push(filePath)
      let css = await fs.promises.readFile(filePath, 'utf8').catch(err=>console.log(err))
      var result = await csso.minify(css, {});
      fs.promises.writeFile(`./dep_pack/${filePath}`, result.css)
      .then(() => {
        let newStat = fs.statSync(`./dep_pack/${filePath}`);
        arrs.file_sizes[filePath] = {original:fileStats.size, compressed:newStat.size}
      }).catch(err=>console.log(err))
    }
    else if(fileExtension =='js' && flags.js){
      var code = await fs.promises.readFile(filePath, 'utf8')
      var result = await Terser.minify(code);
      if (result.error) console.log("\x1b[31m", `Error ${filePath} not copied. UglifyJS: ${result.error.message}`, "\x1b[0m")
      else fs.promises.writeFile(`./dep_pack/${filePath}`, result.code)
      .then(() => {
        let newStat = fs.statSync(`./dep_pack/${filePath}`);
        arrs.file_sizes[filePath] = {original:fileStats.size, compressed:newStat.size}
      }).catch((err)=>console.log(err))
    }
    else if(flags.images) {
      await Optimize.compressImages(filePath, "dep_pack", arrs.images, options.svgo)
      .then((img) => {
        if(img) {
          arrs.images.push(filePath);
          arrs.file_sizes[filePath] = {original:img.original_size, compressed:img.compressed_size}
          if(flags.webp){
            Optimize.compressWebp(filePath, "./dep_pack")
            .then(data => arrs.file_sizes[filePath].compressed = data.compressed_size)
            .catch(err => console.log(err))
          }
        }
        else {
          console.log(`file format ${fileExtension} not recognized by Arjan. Copying file as is.`)
          Optimize.copyFile(filePath, "./dep_pack")
        }
      }).catch((err) => console.log(err))   
    }
    else {
      console.log(`file format ${fileExtension} not recognized by Arjan. Copying file as is.`)
      Optimize.copyFile(filePath, "./dep_pack")
    }
    return arrs
}

OptimizeCommand.description = `Describe the command here
...
Extra documentation goes here
`
OptimizeCommand.args = [
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
  css: flags.boolean({
    char: 'c',
    description: 'minifiy css using cssnano',
  }),
  /* unusedcss: flags.boolean({
    char: 'u',
    description: 'remove unused css classes',
  }), */
  js: flags.boolean({
    char: 'j',
    description: 'minify js using uglify js'
  })
}

module.exports = OptimizeCommand
