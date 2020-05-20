const {Command, flags} = require('@oclif/command')
const Translate = require('arjan-localize')
const fs = require('fs')
const ignorePaths = {
  "node_modules":true,
}

function scanFolder(currentDirPath, callback) {
  return new Promise((resolve, reject) => {
    let dirArr = fs.readdirSync(currentDirPath)
    for(let name of dirArr){
      console.log(name)
      var filePath = path.join(currentDirPath, name);
      var stat = fs.statSync(filePath);
      if (stat.isFile()){
        let ext = name.substr(name.lastIndexOf("."), name.length)
        if(ext === "html") callback(filePath, stat);
      }
      else if (stat.isDirectory()) {
        if(ignorePaths[filePath]) console.log("ignoring ", fileSubPath)
        else {
          if(!fs.existsSync(`output/${fileSubPath}`)) fs.mkdirSync(`output/${fileSubPath}`)
          scanFolder(filePath, callback);
        }
      }
    }
    resolve(name)
  });
}

function localizeAndTranslate(html, filePath, from, to){
  return new Promise(async (resolve, reject) => {
    let data = await Translate.CreateLocale(html).catch(err => reject(err))
    var origin_html = data.html
    let destname = to+'/'+filePath;
    let localename = filePath.substr(filePath.lastIndexOf("."), filePath.length).replace('/', '_')
    await fs.promises.writeFile(`locales/${from}/${localename}.json`, JSON.stringify(data.locale)).catch(err => reject(err));
    await fs.promises.writeFile(filePath, origin_html).catch(err => reject(err));
    if(to){
      let translatedLocale = await Translate.TranslateLocale(data.locale, from, to, data.size).catch(err => reject(err));
      await fs.promises.writeFile(`locales/${to}/${localename}.json`, JSON.stringify(translatedLocale)).catch(err => reject(err))
      let translatedHtml = await TranslateHtml(origin_html, translatedLocale).catch(err => reject(err))
      if(localename === from) destname = to+'.html'
      else if(filePath.split('/')[0] === from) destname = to+filePath.split('/', 2)[1]  
      await fs.promises.writeFile(destname, translatedHtml).then(resolve(true)).catch(err => reject(err))
    }
    else resolve(true)
  })
}

async function localizeTranslateFile(flags, args){
  let fileContent = await fs.promises.readFile(args.filename, 'utf8')
  let json = await fs.promises.readFile(`./locales/${args.from}/${args.filename}`, 'utf8')
  if(flags.create) await localizeAndTranslate(fileContent, args.filename, args.from, args.to)
  else if(flags.update && flags.backwards) await Translate.CreateLocale(fileContent)
  else if(flags.update) await Translate.TranslateHtml(fileContent, json)
  else if(flags.import) Translate.importCsv(args.from, fileContent)
  if(flags.export) {
    Translate.exportCsv(args.from, json)
    if(args.to) Translate.exportCsv(args.to, json)
  }
}

class TranslateCommand extends Command {
  async run() {
    const {args, flags} = this.parse(TranslateCommand)
    if(args.filename === 'all'){
      scanFolder('./', (filePath, stat)=> {
        args.filename = filePath
        localizeTranslateFile(flags, args)
      })
    }
    else localizeTranslateFile(flags, args)
  }
}

TranslateCommand.description = `Describe the command here
...
Extra documentation goes here
`
TranslateCommand.args = [
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
TranslateCommand.flags = {
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

module.exports = TranslateCommand
