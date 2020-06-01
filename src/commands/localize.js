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

function getPaths(from, to, filePath){
  return new Promise((resolve, reject) => {
    let create = false;
    let localename = getLocaleName(filePath)
    let destname = to+'/'+filePath;
    if(filePath.endsWith(`${from}.html`)) destname = to+'.html';
    else if(filePath.split('/')[0] === from) {
      destname = to+filePath.split('/', 2)[1];
      create = true;
    }
    else create = true;
    resolve({locale:localename, filepath:destname, create:create});  
  })
}

function getLocaleName(filePath){
  return filePath.substr(0, filePath.lastIndexOf(".")).replace(/\//g, '_')
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

function setupCsv(origin, translations){
  return new Promise((resolve, reject) => {
    Localize.CreateDir('exports').then(()=>{
      Localize.CreateDir('exports/csv')
      .then(() => {Localize.CreateDir(`exports/csv/${origin}`)
        .then(()=>{
          if(translations) for(let t in translations) Localize.CreateDir(`exports/csv/${translations[t]}`).then(()=> {if(t>=translations.length-1)resolve(true)})
          else resolve(true)
        }).catch(err => reject(err))
      }).catch(err => reject(err))
    }).catch(err => reject(err))
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
    cli.action.start('Setting Up')
    let files = []
    let exports = false;
    for(let f=1; f<this.argv.length; f++) if(!this.argv[f].startsWith('-')) files.push(this.argv[f])
    const {args, flags} = this.parse(LocalizeCommand)
    let setting = await setup(args.language, flags.translate)
    if(flags.export) exports = await setupCsv(args.language, flags.translate)
    else exports = true;
    if(setting && exports) {
      cli.action.stop()
      for(let t of flags.translate) ignorePaths[t] = true;
      if(!args.files || args.files === '/') files = await scanFiles()
      if(flags.translate) for(let t of flags.translate) await createPath(files, args.language, t)
      for(let file of files) await localize(file, args.language, flags, cli)
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
        if(files[f].startsWith('./')) files[f] = files[f].substr(2);
        let name = await getPaths(origin, output, files[f])
        //first check get the url of the file; if create is true, create the filestructure
        if(name.create && files[f].includes('/')){
          let dirs = files[f].split('/');
          let path = output;
          for(let i=0; i<dirs.length-1; i++){
            path += '/'+dirs[i];
            await Localize.CreateDir(path).catch(err => reject(err))
          }
        }
        if(f >= files.length-1) resolve(true)
      }
    }).catch(err => reject(err))
  })
}

async function localize(filename, language, flags, cli){
  let fileContent = await fs.promises.readFile(filename, 'utf8')
  let wait = false;
  if(flags.create) {
    cli.action.start(`Localizing and translating ${filename}`)
    wait = await localizeAndTranslate(fileContent, filename, language, flags.translate).catch(err => console.log(err))
  }
  else if(flags.update && flags.backwards){
    cli.action.start(`Updating contents of locales/${language}/${localename}.json`)
    let locale = await Localize.CreateLocale(fileContent).catch(err => console.log(err))
    await fs.promises.writeFile(`./locales/${language}/${localename}.json`, locale)
    .then(()=> {
      wait = true;
      cli.action.stop()
    }).catch(err => console.log(err)) 
  } 
  else if(flags.update) {
    cli.action.start(`Updating contents of ${filename}`)
    let json = await fs.promises.readFile(`./locales/${language}/${filename}`, 'utf8').catch(err => console.log(err))
    let html = await Localize.TranslateHtml(fileContent, json).catch(err => console.log(err))
    await fs.promises.writeFile(filename, html)
    .then(()=>{
      wait = true;
      cli.action.stop()
    }).catch(err => console.log(err)) 
  }
  else if(flags.import){
    cli.action.start(`Importing CSV file content into locales/${language}/${localename}.json`)
    let csv = await fs.promises.readFile(`exports/csv/${language}/${localename}.csv`, 'utf8')
    let obj = await Localize.importCsv(language, csv).catch(err => console.log(err))
    await fs.promises.writeFile(`./locales/${language}/${localename}.json`, obj)
    .then(()=>{
      wait = true;
      cli.action.stop();
    }).catch(err => console.log(err))
  }
  else wait = true;
  if(wait) cli.action.stop()
  if(flags.export && wait) {
    let localename = getLocaleName(filename)
    cli.action.start(`Exporting ./locales/${language}/${localename}.json to a CSV file`)
    let fromjson = await fs.promises.readFile(`./locales/${language}/${localename}.json`).catch(err => console.log(err))
    let fromcsv = await Localize.exportCsv(language, fromjson).catch(err => console.log(err))
    await fs.promises.writeFile(`exports/csv/${language}/${localename}.csv`, fromcsv).then(()=>cli.action.stop()).catch(err => console.log(err))
    if(flags.translate) {
      for(let t of flags.translate){
        let tojson = await fs.promises.readFile(`./locales/${t}/${localename}.json`, 'utf8').catch(err => console.log(err))
        let tocsv = await Localize.exportCsv(t, tojson).catch(err => console.log(err))
        await fs.promises.writeFile(`exports/csv/${t}/${localename}.csv`, tocsv).then(()=>cli.action.stop()).catch(err => console.log(err))
      }
    }
  }
}

function localizeAndTranslate(html, filePath, from, translations){
  return new Promise(async (resolve, reject) => {
    let oname = await getPaths(from, from, filePath)
    let data = await Localize.CreateLocale(html).catch(err => reject(err))
    var origin_html = data.html;
    await fs.promises.writeFile(`./locales/${from}/${oname.locale}.json`, JSON.stringify(data.locale)).catch(err => reject(err));
    await fs.promises.writeFile(filePath, origin_html).catch(err => reject(err));
    if(translations){
      for(let t in translations){
        let name = await getPaths(from, translations[t], filePath)
        let translatedLocale = await Localize.TranslateLocale(data.locale, from, translations[t], data.size).catch(err => reject(err));
        await fs.promises.writeFile(`locales/${translations[t]}/${name.locale}.json`, JSON.stringify(translatedLocale)).catch(err => reject(err))
        let translatedHtml = await Localize.TranslateHtml(origin_html, translatedLocale).catch(err => reject(err))
        await fs.promises.writeFile(name.filepath, translatedHtml).then(()=>{if(t>=translations.length-1)resolve(true)}).catch(err => reject(err))
      }
    }
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
