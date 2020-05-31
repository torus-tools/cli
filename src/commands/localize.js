const {Command, flags} = require('@oclif/command')
const Localize = require('arjan-localize')
const fs = require('fs')
const path = require("path");
const {cli} = require('cli-ux');
const ignorePaths = {
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
    console.log(filePath)
    console.log(destname)
    resolve({locale:localename, filepath:destname})  
  })
}


function setup(flags){
  return new Promise((resolve, reject) => {
    let dirs = false;
    let exports = false;
    Localize.CreateDir('locales')
    .then(() => {Localize.CreateDir(`locales/${flags.from}`)
      .then(()=>{
        if(flags.to) Localize.CreateDir(`locales/${flags.to}`).then(()=> resolve(true))
        else resolve(true);
      }).catch(err => reject(err))
    }).catch(err => reject(err))
    if(flags.export) {
      Localize.CreateDir('exports')
      .then(() => {Localize.CreateDir('exports/csv')})
      .then(() => {Localize.CreateDir(`exports/csv/${flags.from}`)})
      .then(()=> {
        if(flags.to) Localize.CreateDir(`locales/${flags.to}`).then(()=> exports = true)
      }).catch(err => reject(err))
    }
  })
}

class LocalizeCommand extends Command {
  static strict = false
  static args = [
    {
      name: 'filename',
      description: 'name of the file you want to translate -only html files accepted. Use all to translate all of your html files (default).',
    }
  ]
  async run() {
    let files = []
    for(let f of this.argv) if(!f.startsWith('-')) files.push(f)
    const {args, flags} = this.parse(LocalizeCommand)
    cli.action.start('Setting Up')
    let setting = await setup(flags)
    if(setting) {
      if(args.filename !== `${flags.from}.html`) await Localize.CreateDir(flags.to)
      if(!args.filename || args.filename === 'all') files = await scanFiles()
      for(let file of files){
        console.log(file)
        localize(file, flags, cli)
      }
    }
  }
}

function scanFiles(){
  let arrs = [];
  return new Promise(async (resolve, reject) => {
    scanDir("./", "./dep_pack", (filePath, stat) => arrs.push(filePath))
    resolve(arrs)
  })
}

function scanDir(currentDirPath, output, callback) {
  fs.readdirSync(currentDirPath).forEach((name)=>{
    var filePath = path.join(currentDirPath, name);
    var stat = fs.statSync(filePath);
    if(!ignorePaths[filePath]) {
      if (stat.isFile()) {
        let ext = name.substr(name.lastIndexOf(".")+1, name.length)
        if(ext === "html") callback(filePath, stat);
      }
      else if (stat.isDirectory()) {
        if(output && !fs.existsSync(`${output}/${filePath}`)) fs.mkdirSync(`${output}/${filePath}`)
        scanDir(filePath, output, callback)
      }
    }
  });
}

async function localize(filename, flags, cli){
  let fileContent = await fs.promises.readFile(filename, 'utf8')
  let name = await getLocaleAndFile(flags.from, flags.to, filename).catch(err => console.log(err))
  let localename = name.locale;
  let wait = false;
  if(flags.create) {
    cli.action.start(`Localizing and translating ${filename}`)
    await localizeAndTranslate(fileContent, filename, flags.from, flags.to)
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
    if(flags.to) {
      let tojson = await fs.promises.readFile(`./locales/${flags.to}/${localename}.json`).catch(err => console.log(err))
      let tocsv = await Localize.exportCsv(flags.to, tojson).catch(err => console.log(err))
      await fs.promises.writeFile(`exports/csv/${flags.to}/${localename}.csv`, tocsv).then(()=>cli.action.stop()).catch(err => console.log(err))
    }
  }
}

function localizeAndTranslate(html, filePath, from, to){
  return new Promise(async (resolve, reject) => {
    let data = await Localize.CreateLocale(html).catch(err => reject(err))
    var origin_html = data.html
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
  from: flags.string({
    char: 'f',                    
    description: 'origin language of the file.',
    required: true     
  }),
  to: flags.string({
    char: 't',                    
    description: 'desired translation language.',
    required: true     
  }),  
  create: flags.boolean({
    char: 'c',                    
    description: 'Create locales for your html website. if a destination language isnt provided it wont be translated.',
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
