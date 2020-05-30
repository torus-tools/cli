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
    cli.action.start('setting up')
    await Localize.CreateDir('./dep_pack')
    let config = await Localize.createFile('./optimize_config.json', JSON.stringify(Optimize.optimizeConfig))
    let config_json = JSON.parse(config)
    let arrs = await scanFiles().catch((err) => {console.log(err)})
    console.log(arrs)
    let file_sizes = arrs.file_sizes;
    for(let i in arrs.images){
      //if(i >= arrs.images.length) cli.action.stop()
      cli.action.start(`compressing image ${arrs.images[i]} : ${file_sizes[arrs.images[i]].original}`)
      let img = await Optimize.compressImages(arrs.images[i], "dep_pack", options.svgo)
      if(flags.webp){
        let webp = await Optimize.compressWebp(arrs.images[i], "./dep_pack");
        file_sizes[arrs.images[i]] = {compressed:webp}
        cli.action.stop(webp)
      }
      else {
        file_sizes[arrs.images[i]] = {compressed:img}
        cli.action.stop(img)
      }
    }
    for(let s in arrs.scripts){
      //if(s >= arrs.scripts.length) cli.action.stop()
      cli.action.start(`minifying js ${arrs.scripts[s]} : ${file_path[arrs.scripts[s]].original}`)
      var code = await fs.promises.readFile(arrs.scripts[s], 'utf8')
      var result = await Terser.minify(code);
      if (result.error) cli.action.stop(`\x1b[31m Error ${arrs.scripts[s]} not copied. Terser: ${result.error.message}\x1b[0m`)
      else {
        let filesize = await writeFile(`./dep_pack/${arrs.scripts[s]}`, result.code).catch((err)=>console.log(err))
        file_sizes[arrs.scripts[s]] = {compressed:filesize}
        cli.action.stop(filesize)
      }
    }
    for(let c in arrs.stylesheets) {
      //if(c >= arrs.stylesheets.length) cli.action.stop()
      cli.action.start(`minifying css ${arrs.stylesheets[c]} : ${file_path[arrs.stylesheets[c]].original}`)
      let css = await fs.promises.readFile(filePath, 'utf8').catch(err=>console.log(err))
      var result = await csso.minify(css, {});
      let filesize = await writeFile(`./dep_pack/${filePath}`, result.css).catch(err=>console.log(err))
      file_sizes[filePath] = {compressed:filesize}
      cli.action.stop(filesize)
    }
    for(let h in arrs.htmlFiles) {
      //if(h >= arrs.htmlFiles.length) cli.action.stop()
      cli.action.start(`minifying html ${arrs.htmlFiles[h]} : ${file_path[arrs.htmlFiles[h]].original}`)
      let html = await fs.promises.readFile(arrs.htmlFiles[h], 'utf8')
      if(flags.webp) html = await Optimize.replaceWebp(img, html, arrs.htmlFiles[h])
      if(flags.html) html = HtmlMinifier.minify(html, config_json.html_minifier);
      let filesize = await writeFile(`./dep_pack/${arrs.htmlFiles[h]}`, html)
      cli.action.stop(filesize)
    }
  }
}

function writeFile(filePath, contents){
  return new Promise((resolve, reject) => {
    fs.promises.writeFile(filePath, contents)
    .then(() => {
      fs.promises.stat(filePath)
      .then(stat => resolve(stat.size))
      .catch(err => reject(err))
    }).catch(err => reject(err))
  })
}

function scanFiles(){
  let arrs = {stylesheets:[], htmlfiles:[], scripts:[], images:[], file_sizes:{}}
  return new Promise(async (resolve, reject) => {
    scanDir("./", "./dep_pack", (filePath, stat) => {
      arrs = getFile(filePath, arrs)
    })
    //console.log(arrs)
    resolve(arrs)
  })
}

function scanDir(currentDirPath, output, callback) {
  fs.readdirSync(currentDirPath).forEach((name)=>{
    var filePath = path.join(currentDirPath, name);
    var stat = fs.statSync(filePath);
    if(!ignorePaths[filePath]) {
      if (stat.isFile()) callback(filePath, stat);
      else if (stat.isDirectory()) {
        if(!fs.existsSync(`${output}/${filePath}`)) fs.mkdirSync(`${output}/${filePath}`)
        scanDir(filePath, output, callback)
      }
    }
  });
}

function getFile(filePath, arrs){
  let file_sizes = arrs.file_sizes
  let fileExtension = filePath.substring(filePath.lastIndexOf('.') + 1);
  let fileStat = fs.statSync(filePath)
  if(fileExtension =='html'){
    arrs.htmlfiles.push(filePath);
    if(flags.html && !flags.webp) file_sizes[filePath] = {original:fileStat.size}
  }
  else if(fileExtension =='css'){
    arrs.stylesheets.push(filePath)
    file_sizes[filePath] = {original:fileStat.size}
  }
  else if(fileExtension =='js'){
    arrs.scripts.push(filePath)
    file_sizes[filePath] = {original:fileStat.size}
  }
  else if(Optimize.imgFormats.includes(fileExtension)) {
    arrs.images.push(filePath);
    file_sizes[filePath] = {original:fileStat.size}
  }
  else {
    Optimize.copyFile(filePath, "./dep_pack")
  }
  arrs.file_sizes = file_sizes;
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
