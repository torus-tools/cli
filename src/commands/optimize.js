require('dotenv').config()
const {Command, flags} = require('@oclif/command')
const fs = require('fs')
const Optimize = require('arjan-optimize')
const Build = require('arjan-build')
const {cli} = require('cli-ux');
const Report = require('../report')
const path = require("path");
const webpack = require('webpack');
const webpack_config = require('../../webpack.prod');
const {createFakes, injectStylesheets} = require('../scanDir')
const compiler = webpack(webpack_config);

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
  "test":true,
  'webpack.dev.js': true,
  'webpack.loaders.js': true,
  'webpack.plugins.js': true,
  'webpack.prod.js': true
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
    let config = await Build.createFile('./arjan_config/optimize_config.json', JSON.stringify(Optimize.optimizeConfig))
    let config_json = JSON.parse(config)
    await Build.createDir(flags.output)
    for(let f in OptimizeCommand.flags) if(!flags[f]) flags[f] = config_json[f]
    let arrs = {stylesheets:[], htmlfiles:[], scripts:[], images:[], file_sizes:{}}
    if(args.files && args.files !== '/') for(file of files) arrs = getFile(file, arrs)
    else arrs = await scanFiles().catch(err => console.log(err))
    await createFakes(flags.input)
    let file_sizes = arrs.file_sizes;
    await injectStylesheets(arrs.htmlfiles, 'js')
    .then(()=>{
      cli.action.stop()
      cli.action.start('Building deployment package')
      compiler.run((err, stats) => {
        if(err) console.log(err) 
        if(stats.errors) console.log(stats.errors)
        cli.action.stop()
        Object.keys(file_sizes).map(file => {
          if(fs.existsSync('dep_pack/'+file))file_sizes[file].compressed = fs.statSync('dep_pack/'+file).size
          else file_sizes[file].compressed = 0
        })
        let report = formatReport(file_sizes)
        console.log(report)
      });
    })
    
    /* for(let h in arrs.htmlfiles) {
      let html = await fs.promises.readFile(arrs.htmlfiles[h], 'utf8')
      if(flags.webp) html = await Optimize.replaceWebp(arrs.htmlfiles[h], html)
      if(flags.html){
        cli.action.start(`minifying html ${arrs.htmlfiles[h]} \x1b[31m${file_sizes[arrs.htmlfiles[h]].original} bytes \x1b[0m`)
        html = HtmlMinifier.minify(html, config_json.html_minifier);
        let filesize = await writeFile(`./dep_pack/${arrs.htmlfiles[h]}`, html)
        file_sizes[arrs.htmlfiles[h]].compressed = filesize;
        cli.action.stop(Report.getScoreColor(1-filesize/file_sizes[arrs.htmlfiles[h]].original, .1)+filesize+" bytes \x1b[0m")
      }
    } */
    
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
        //if(!fs.existsSync(`${output}/${filePath}`)) fs.mkdirSync(`${output}/${filePath}`)
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
  arrs.file_sizes = file_sizes;
  return arrs
}

OptimizeCommand.description = `Describe the command here
...
Extra documentation goes here
`

OptimizeCommand.flags = {
  input: flags.string({
    char: 'i',                    
    description: 'Name of the input directory that contains all the scripts for your project. Default is js. To use the root use ',      
  }),
  output: flags.string({
    char: 'o',                    
    description: 'desired output directory. Default is dep_pack',      
  }),
  css: flags.boolean({
    char: 'c',
    description: 'minifiy css using cssnano',
  }),
  /* 
  responsive: flags.boolean({
    char: 'r',                    
    description: 'resizes images efficiently for each type of device (sm, md, lg), then replaces each image instance in the html files with a picture tag.'    
  }), 
  img: flags.boolean({
    char: 'i',                    
    description: 'compress images and if possible maintain the format. otherwise its converted to png.',        
  }),
  webp: flags.boolean({
    char: 'w',                    
    description: 'saves a webp version of each image, then replaces each image instance in the html files with a picture tag.',        
  }),
  unusedcss: flags.boolean({
    char: 'u',
    description: 'remove unused css classes',
  }), */
}

module.exports = OptimizeCommand
