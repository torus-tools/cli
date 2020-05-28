const {Command, flags} = require('@oclif/command')
const Localize = require('arjan-localize')
const fs = require('fs')
const path = require("path");
const {cli} = require('cli-ux');
const ignorePaths = {
  "node_modules":true,
  ".git":true
}

function scanFolder(currentDirPath, callback) {
  return new Promise((resolve, reject) => {
    let dirArr = fs.readdirSync(currentDirPath)
    for(let name of dirArr){
      var filePath = path.join(currentDirPath, name);
      var stat = fs.statSync(filePath);
      if (stat.isFile()){
        let ext = name.substr(name.lastIndexOf(".")+1, name.length)
        if(ext === "html") {
          //console.log(filePath)
          callback(filePath, stat);
        }
      }
      else if (stat.isDirectory()) {
        if(!ignorePaths[filePath]) scanFolder(filePath, callback);
      }
    }
  });
}

function localizeAndTranslate(html, filePath, from, to){
  //console.log('localizing file')
  return new Promise(async (resolve, reject) => {
    let data = await Localize.CreateLocale(html).catch(err => reject(err))
    var origin_html = data.html
    let destname = to+'/'+filePath;
    let localename = filePath.substr(0, filePath.lastIndexOf(".")).replace('/', '_')
    await fs.promises.writeFile(`./locales/${from}/${localename}.json`, JSON.stringify(data.locale)).catch(err => reject(err));
    await fs.promises.writeFile(filePath, origin_html).catch(err => reject(err));
    if(to){
      let translatedLocale = await Localize.TranslateLocale(data.locale, from, to, data.size).catch(err => reject(err));
      await fs.promises.writeFile(`./locales/${to}/${localename}.json`, JSON.stringify(translatedLocale)).catch(err => reject(err))
      let translatedHtml = await Localize.TranslateHtml(origin_html, translatedLocale).catch(err => reject(err))
      if(localename === from) destname = to+'.html'
      else if(filePath.split('/')[0] === from) destname = to+filePath.split('/', 2)[1]  
      await fs.promises.writeFile(destname, translatedHtml).then(resolve(true)).catch(err => reject(err))
    }
    else resolve(true)
  })
}

async function localizeTranslateFile(flags, args, cli){
  let fileContent = await fs.promises.readFile(args.filename, 'utf8')
  let localename = args.filename.substr(0, args.filename.lastIndexOf(".")).replace('/', '_')
  let wait = false;
  if(flags.create) {
    cli.action.start(`Localizing and translating ${args.filename}`)
    await localizeAndTranslate(fileContent, args.filename, args.from, args.to)
    .then(()=> {
      wait = true;
      cli.action.stop()
    }).catch(err => console.log(err))
  }
  else if(flags.update && flags.backwards){
    cli.action.start(`Updating contents of locales/${args.from}/${localename}.json`)
    let locale = await Localize.CreateLocale(fileContent).catch(err => console.log(err))
    await fs.promises.writeFile(`./locales/${args.from}/${localename}.json`, locale)
    .then(()=> {
      wait = true;
      cli.action.stop()
    }).catch(err => console.log(err)) 
  } 
  else if(flags.update) {
    cli.action.start(`Updating contents of ${filename}`)
    let json = await fs.promises.readFile(`./locales/${args.from}/${args.filename}`, 'utf8').catch(err => console.log(err))
    let html = await Localize.TranslateHtml(fileContent, json).catch(err => console.log(err))
    await fs.promises.writeFile(args.filename, html)
    .then(()=>{
      wait = true;
      cli.action.stop()
    }).catch(err => console.log(err)) 
  }
  else if(flags.import){
    cli.action.start(`Importing CSV file content into locales/${args.from}/${localename}.json`)
    let csv = await fs.promises.readFile(`exports/csv/${args.from}/${localename}.csv`, 'utf8')
    let obj = await Localize.importCsv(args.from, csv).catch(err => console.log(err))
    await fs.promises.writeFile(`./locales/${args.from}/${localename}.json`, obj)
    .then(()=>{
      wait = true;
      cli.action.stop();
    }).catch(err => console.log(err))
  }
  else wait = true;
  if(flags.export && wait) {
    cli.action.start(`Exporting ./locales/${args.from}/${localename}.json to a CSV file`)
    let fromjson = await fs.promises.readFile(`./locales/${args.from}/${localename}.json`).catch(err => console.log(err))
    let fromcsv = await Localize.exportCsv(args.from, fromjson).catch(err => console.log(err))
    await fs.promises.writeFile(`exports/csv/${args.from}/${localename}.csv`, fromcsv).then(()=>cli.action.stop()).catch(err => console.log(err))
    if(args.to) {
      let tojson = await fs.promises.readFile(`./locales/${args.to}/${localename}.json`).catch(err => console.log(err))
      let tocsv = await Localize.exportCsv(args.to, tojson).catch(err => console.log(err))
      await fs.promises.writeFile(`exports/csv/${args.to}/${localename}.csv`, tocsv).then(()=>cli.action.stop()).catch(err => console.log(err))
    }
  }
}

class LocalizeCommand extends Command {
  async run() {
    const {args, flags} = this.parse(LocalizeCommand)
    await Localize.CreateDir('locales').then(() => {
      Localize.CreateDir(`locales/${args.from}`)
      if(args.to) Localize.CreateDir(`locales/${args.to}`)
    })
    if(flags.export) {
      Localize.CreateDir('exports')
      .then(() => {Localize.CreateDir('exports/csv')})
      .then(() => {
        Localize.CreateDir(`exports/csv/${args.from}`)
        if(args.to) Localize.CreateDir(`exports/csv/${args.to}`)
      }).catch(err => console.log(err))
    }
    if(args.filename !== `${args.from}.html`) await Localize.CreateDir(args.to)
    if(args.filename === 'all'){
      scanFolder('./', (filePath, stat)=> {
        args.filename = filePath
        //console.log('YUPIIIII')
        localizeTranslateFile(flags, args, cli)
      })
    }
    else localizeTranslateFile(flags, args, cli)
  }
}

LocalizeCommand.description = `Describe the command here
...
Extra documentation goes here
`
LocalizeCommand.args = [
  {
    name: 'filename',
    required: true,
    description: 'name of the file you want to translate -only html files accepted. Use all to translate all of your html files (default).',
    default: 'all'
  },
  {
    name: 'from',
    required: true,
    description: 'origin language of the file'
  },
  {
    name: 'to',
    required: false,
    description: 'desired translation language'
  }
]
LocalizeCommand.flags = {
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
