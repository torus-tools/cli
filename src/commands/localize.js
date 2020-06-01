const {Command, flags} = require('@oclif/command')
const Localize = require('arjan-localize')
const fs = require('fs')
const path = require("path");
const {cli} = require('cli-ux');
var ignorePaths = {
  "dep_pack": true, //must be ingored.
  "node_modules":true,
  ".git":true
}

function getLocaleAndFile(from, to, filePath){
  return new Promise((resolve, reject) => {
    let localename = filePath.substr(0, filePath.lastIndexOf(".")).replace('/', '_')
    let destname = to+'/'+filePath;
    if(localename === from) destname = to+'.html'
    else if(filePath.split('/')[0] === from) destname = to+filePath.split('/', 2)[1]
    //console.log(filePath)
    //console.log(destname)
    resolve({locale:localename, filepath:destname})  
  })
}

function setup(origin, translations){
  return new Promise((resolve, reject) => {
    Localize.CreateDir('locales')
    .then(() => {Localize.CreateDir(`locales/${origin}`)
      .then(()=>{
        if(translations) for(let t in translations) Localize.CreateDir(`locales/${translations[t]}`).then(()=> {if(t>=translations.length-1)resolve(true)})
        else resolve(true)
      }).catch(err => reject(err))
    }).catch(err => reject(err))
  })
}

function setupCsv(flags){
  return new Promise((resolve, reject) => {
    if(flags.export) {
      Localize.CreateDir('exports')
      .then(() => {
        Localize.CreateDir('exports/csv')
        .then(() => {
          Localize.CreateDir(`exports/csv/${flags.from}`)
          .then(()=> {
            if(flags.translate) Localize.CreateDir(`exports/csv/${flags.translate}`).then(()=> resolve(true))
            else resolve(true)
          }).catch(err => reject(err))
        }).catch(err => reject(err))
      }).catch(err => reject(err))
    }
  })
}

class LocalizeCommand extends Command {
  static strict = false
  static args = [
    {
      name: 'language',
      description: 'origin language of the file/s.',
      required: true
    },
    {
      name: 'files',
      description: 'name of the file you want to translate -only html files accepted. Use all to translate all of your html files (default).',
    }
  ]
  async run() {
    let files = []
    for(let f=1; f<this.argv.length; f++) if(!this.argv[f].startsWith('-')) files.push(this.argv[f])
    const {args, flags} = this.parse(LocalizeCommand)
    cli.action.start('Setting Up')
    let setting = await setup(args.language, flags.translate)
    await setupCsv(flags)
    if(setting) {
      for(let t of flags.translate) ignorePaths[t] = true;
      if(!args.files || args.files === '/') files = await scanFiles()
      if(flags.translate) for(let t of flags.translate) await createPath(files, args.language, t)
      //for(let file of files) await localize(file, flags, cli)
    }
  }
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
//create the appropriate filestructure for each file
function createPath(files, origin, output){
  return new Promise((resolve, reject) => {
    Localize.CreateDir(output)
    .then(async (data)=> {
      for(let f in files){
        //if(files[f].startsWith('./')) files[f] = files[f].substr(2);
        if(files[f].includes('/')){
          let dirs = files[f].split('/');
          await createPathDirs(dirs, output)
        }
        if(f >= files.length-1) resolve(true)
      }
    }).catch(err => reject(err))
  })
}

function createPathDirs(dirs, output){
  return new Promise((resolve, reject)=> {
    let path = output;
    for(let i=0; i<dirs.length-1; i++){
      path += '/'+dirs[i];
      console.log(path)
      Localize.CreateDir(path)
      .then(()=>{if(i >= dirs.length-2) resolve(true)})
      .catch(err => reject(err))
    }
  })
}

async function localize(filename, flags, cli){
  let fileContent = await fs.promises.readFile(filename, 'utf8')
  let name = await getLocaleAndFile(flags.from, flags.translate, filename).catch(err => console.log(err))
  let localename = name.locale;
  console.log(localename)
  let wait = false;
  if(flags.create) {
    cli.action.start(`Localizing and translating ${filename}`)
    await localizeAndTranslate(fileContent, filename, flags.from, flags.translate)
    .then(()=> {
      wait = true;
      cli.action.stop()
    }).catch(err => console.log(err))
  }
  else if(flags.update && flags.backwards){
    cli.action.start(`Updating contents of locales/${flags.from}/${localename}.json`)
    let locale = await Localize.CreateLocale(fileContent).catch(err => console.log(err))
    await fs.promises.writeFile(`./locales/${flags.from}/${localename}.json`, locale)
    .then(()=> {
      wait = true;
      cli.action.stop()
    }).catch(err => console.log(err)) 
  } 
  else if(flags.update) {
    cli.action.start(`Updating contents of ${filename}`)
    let json = await fs.promises.readFile(`./locales/${flags.from}/${filename}`, 'utf8').catch(err => console.log(err))
    let html = await Localize.TranslateHtml(fileContent, json).catch(err => console.log(err))
    await fs.promises.writeFile(filename, html)
    .then(()=>{
      wait = true;
      cli.action.stop()
    }).catch(err => console.log(err)) 
  }
  else if(flags.import){
    cli.action.start(`Importing CSV file content into locales/${flags.from}/${localename}.json`)
    let csv = await fs.promises.readFile(`exports/csv/${flags.from}/${localename}.csv`, 'utf8')
    let obj = await Localize.importCsv(flags.from, csv).catch(err => console.log(err))
    await fs.promises.writeFile(`./locales/${flags.from}/${localename}.json`, obj)
    .then(()=>{
      wait = true;
      cli.action.stop();
    }).catch(err => console.log(err))
  }
  else wait = true;
  if(flags.export && wait) {
    cli.action.start(`Exporting ./locales/${flags.from}/${localename}.json to a CSV file`)
    let fromjson = await fs.promises.readFile(`./locales/${flags.from}/${localename}.json`).catch(err => console.log(err))
    let fromcsv = await Localize.exportCsv(flags.from, fromjson).catch(err => console.log(err))
    await fs.promises.writeFile(`exports/csv/${flags.from}/${localename}.csv`, fromcsv).then(()=>cli.action.stop()).catch(err => console.log(err))
    if(flags.translate) {
      let tojson = await fs.promises.readFile(`./locales/${flags.translate}/${localename}.json`).catch(err => console.log(err))
      let tocsv = await Localize.exportCsv(flags.translate, tojson).catch(err => console.log(err))
      await fs.promises.writeFile(`exports/csv/${flags.translate}/${localename}.csv`, tocsv).then(()=>cli.action.stop()).catch(err => console.log(err))
    }
  }
}

function localizeAndTranslate(html, filePath, from, to){
  console.log('LOCALIZE AND TRANSLATE')
  return new Promise(async (resolve, reject) => {
    let data = await Localize.CreateLocale(html).catch(err => reject(err))
    var origin_html = data.html;
    let name = await getLocaleAndFile(from, to, filePath)
    await fs.promises.writeFile(`./locales/${from}/${name.locale}.json`, JSON.stringify(data.locale)).catch(err => reject(err));
    await fs.promises.writeFile(filePath, origin_html).catch(err => reject(err));
    if(to){
      let translatedLocale = await Localize.TranslateLocale(data.locale, from, to, data.size).catch(err => reject(err));
      await fs.promises.writeFile(`./locales/${to}/${name.locale}.json`, JSON.stringify(translatedLocale)).catch(err => reject(err))
      let translatedHtml = await Localize.TranslateHtml(origin_html, translatedLocale).catch(err => reject(err))
      await fs.promises.writeFile(name.filepath, translatedHtml).then(resolve(true)).catch(err => reject(err))
    }
    else resolve(true)
  })
}

LocalizeCommand.description = `Describe the command here
...
Extra documentation goes here
`
LocalizeCommand.flags = {
  translate: flags.string({
    char: 't',                    
    description: 'desired translation language. You may apply this flag multiple times to translate into multiple languages.',
    required: false,
    multiple: true     
  }),  
  create: flags.boolean({
    char: 'c',                    
    description: 'Create locale/s for your site. When used with translate flags, it generates a translated version of the locale and the HTML.',
    exclusive: ['update']         
  }),  
  update: flags.boolean({
    char: 'u',                    
    description: 'Update HTML file accoridng to changes made in the JSON locale.',
    exclusive: ['create']         
  }),
  backwards: flags.boolean({
    char: 'b',                    
    description: 'Update JSON locale accoridng to changes made in the HTML file. Must be used together with the update flag.',
    dependsOn: ['update']     
  }),
  export: flags.boolean({
    char: 'e',                    
    description: 'Creates a CSV file for your JSON locale.',
    exclusive: ['import']     
  }),
  import: flags.boolean({
    char: 'i',                    
    description: 'Update JSON locale from changes made in the CSV file',
    exclusive: ['export', 'create', 'update', 'backwards']    
  })
  /* html5: flags.string({
    char: 'h',                    
    description: 'creates translation sections according to HTML5 elements.',
    multiple: false      
  })*/
}

module.exports = LocalizeCommand
