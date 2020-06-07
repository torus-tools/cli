require('dotenv').config()
const {Command, flags} = require('@oclif/command')
const fs = require('fs')
const Optimize = require('arjan-optimize')
const Build = require('arjan-build')
const {cli} = require('cli-ux');
const HtmlMinifier = require('html-minifier');
const csso = require('csso');
var Terser = require("terser");
const Report = require('../report')
const path = require("path");

const ignorePaths = {
  "dep_pack":true, //must be ignored.
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

function formatReport(files){
  let i = 40;
  let blankLine = "|" + " ".repeat(i) + "|\n";
  let sepparator = "|" + "-".repeat(i) + "|\n";
  let header = sepparator + blankLine + Report.getHeading("Optimization Report ") + blankLine;
  let file_count = 0;
  let original_size = 0;
  let compressed_size = 0;
  for(let file in files){
    file_count +=1;
    original_size += files[file].original;
    compressed_size += files[file].compressed;
  }
  let pcent = compressed_size/original_size;
  let body = sepparator + 
  blankLine + 
  Report.getReportItem(false, i, 'Total Files Compressed', file_count) + 
  blankLine + 
  Report.getReportItem(false, i, 'Before', original_size+' bytes') + 
  blankLine + 
  Report.getReportItem(false, i, 'After', compressed_size+' bytes', Report.getScoreColor(1-pcent, .1)) + 
  blankLine + 
  Report.getReportItem(false, i, 'Compression', Report.getScore(1-pcent, true, true), Report.getScoreColor(1-pcent, .1))
  let report = '\n'+header+body+blankLine+sepparator;
  return report;
}

class OptimizeCommand extends Command {
  static strict = false;
  static args = [
    {
      name: 'files',
      description: 'path of the files you want to optimize. Ommit the argument or use / to translate all of your html files (default).',
    }
  ]
  async run() {
    let files = [];
    for(let f=1; f<this.argv.length; f++) if(!this.argv[f].startsWith('-')) files.push(this.argv[f])
    const {flags, args} = this.parse(OptimizeCommand)
    cli.action.start('setting up')
    await Build.createDir('./dep_pack')
    let config = await Build.createFile('./arjan_config/optimize_config.json', JSON.stringify(Optimize.optimizeConfig))
    let config_json = JSON.parse(config)
    for(let f in OptimizeCommand.flags) if(!flags[f]) flags[f] = config_json[f]
    let arrs = {stylesheets:[], htmlfiles:[], scripts:[], images:[], file_sizes:{}}
    if(args.files && args.files !== '/') for(file of files) arrs = getFile(file, arrs)
    else arrs = await scanFiles().catch(err => console.log)
    let file_sizes = arrs.file_sizes;
    for(let s in arrs.scripts){
      if(flags.js){
        cli.action.start(`minifying js ${arrs.scripts[s]} \x1b[31m${file_sizes[arrs.scripts[s]].original} bytes \x1b[0m`)
        var code = await fs.promises.readFile(arrs.scripts[s], 'utf8')
        var result = await Terser.minify(code);
        if (result.error) cli.action.stop(`\x1b[31m Error ${arrs.scripts[s]} not copied. Terser: ${result.error.message}\x1b[0m`)
        else {
          let filesize = await writeFile(`./dep_pack/${arrs.scripts[s]}`, result.code).catch((err)=>console.log(err))
          file_sizes[arrs.scripts[s]].compressed = filesize;
          cli.action.stop(Report.getScoreColor(1-filesize/file_sizes[arrs.scripts[s]].original, .1)+filesize+" bytes \x1b[0m")
        }
      }
      else {
        cli.action.start(`Copying js ${arrs.scripts[s]}`)
        file_sizes[arrs.scripts[s]].compressed = file_sizes[arrs.scripts[s]].original;
        Optimize.copyFile(arrs.scripts[s], 'dep_pack').then(()=>cli.action.stop()).catch(err=>console.log(err))
      }
    }
    for(let c in arrs.stylesheets) {
      if(flags.css){
        cli.action.start(`minifying css ${arrs.stylesheets[c]} \x1b[31m${file_sizes[arrs.stylesheets[c]].original} bytes \x1b[0m`)
        let css = await fs.promises.readFile(arrs.stylesheets[c], 'utf8').catch(err=>console.log(err))
        var result = await csso.minify(css, {});
        let filesize = await writeFile(`./dep_pack/${arrs.stylesheets[c]}`, result.css).catch(err=>console.log(err))
        file_sizes[arrs.stylesheets[c]].compressed = filesize;
        cli.action.stop(Report.getScoreColor(1-filesize/file_sizes[arrs.stylesheets[c]].original, .1)+filesize+" bytes \x1b[0m")
      }
      else {
        cli.action.start(`Copying css ${arrs.stylesheets[c]}`)
        file_sizes[arrs.stylesheets[c]].compressed = file_sizes[arrs.stylesheets[c]].original;
        Optimize.copyFile(arrs.stylesheets[c], 'dep_pack').then(()=>cli.action.stop()).catch(err=>console.log(err))
      }
    }
    for(let h in arrs.htmlfiles) {
      let html = await fs.promises.readFile(arrs.htmlfiles[h], 'utf8')
      if(flags.webp) html = await Optimize.replaceWebp(arrs.htmlfiles[h], html)
      if(flags.html){
        cli.action.start(`minifying html ${arrs.htmlfiles[h]} \x1b[31m${file_sizes[arrs.htmlfiles[h]].original} bytes \x1b[0m`)
        html = HtmlMinifier.minify(html, config_json.html_minifier);
        let filesize = await writeFile(`./dep_pack/${arrs.htmlfiles[h]}`, html)
        file_sizes[arrs.htmlfiles[h]].compressed = filesize;
        cli.action.stop(Report.getScoreColor(1-filesize/file_sizes[arrs.htmlfiles[h]].original, .1)+filesize+" bytes \x1b[0m")
      }
      else {
        cli.action.start(`Copying html ${arrs.htmlfiles[h]}`)
        file_sizes[arrs.htmlfiles[h]].compressed = file_sizes[arrs.htmlfiles[h]].original;
        fs.promises.writeFile(`./dep_pack/${arrs.htmlfiles[h]}`, html).then(()=>cli.action.stop()).catch(err=>console.log(err))
      }
    }
    for(let i in arrs.images){
      if(flags.img) {
        cli.action.start(`compressing image ${arrs.images[i]} \x1b[31m${file_sizes[arrs.images[i]].original} bytes \x1b[0m`)
        let img = await Optimize.compressImages(arrs.images[i], "dep_pack", arrs.images, config_json.svgo)
        file_sizes[arrs.images[i]].compressed = img;
        cli.action.stop(Report.getScoreColor(1-img/file_sizes[arrs.images[i]].original, .1)+img+" bytes \x1b[0m")
      }
      else {
        cli.action.start(`Copying css ${arrs.images[i]}`)
        file_sizes[arrs.images[i]].compressed = file_sizes[arrs.images[i]].original;
        Optimize.copyFile(arrs.images[i], 'dep_pack').then(()=>cli.action.stop()).catch(err=>console.log(err))
      }
      if(flags.webp){
        cli.action.start(`converting image ${arrs.images[i]} to webP \x1b[31m${file_sizes[arrs.images[i]].original} bytes \x1b[0m`)
        let webp = await Optimize.compressWebp(arrs.images[i], "./dep_pack");
        file_sizes[arrs.images[i]].compressed = webp;
        cli.action.stop(Report.getScoreColor(1-webp/file_sizes[arrs.images[i]].original, .1)+webp+" bytes \x1b[0m")
      }
    }
    let report = formatReport(file_sizes)
    console.log(report)
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
    file_sizes[filePath] = {original:fileStat.size}
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

OptimizeCommand.flags = {
  img: flags.boolean({
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
