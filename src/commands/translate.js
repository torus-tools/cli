const {Command, flags} = require('@oclif/command')
const Translate = require('arjan-translate')
const fs = require('fs')

function localizeAndTranslate(html, file, translation, name, from, to){
  Translate.CreateLocale()  (html, name, from, to, function(err, data){
    if(err) console.log(err)
    else{
      var origin_html = data.html;
      fs.promises.writeFile(`locales/${from}/${from}.json`, JSON.stringify(data.locale));
      fs.promises.writeFile(file, origin_html)
      
      //only execute if the destination language is provided
      TranslateLocale(data.locale, name, from, to, data.size, function(err, data){
        if(err) console.log(err)
        else{
          fs.promises.writeFile(`locales/${to}/${to}.json`, JSON.stringify(data));
          TranslateHtml(origin_html, data)
          .then((data)=> {
            fs.promises.writeFile(translation, data)
            console.log('All Done!')
          })
          .catch(err => console.log(err))
        }
      })


    }
  })
}

function translateFunction(flags, args){
  let html = await fs.promises.readFile(args.filename)
  let json = await fs.promises.readFile(`./locales/${args.from}/${args.filemname}`)
  if(flags.create) localizeAndTranslate()
  else if(flags.update && flags.backwards) Translate.CreateLocale()
  else if(flags.update) Translate.TranslateHtml(html, json)
  else if(flags.import) Translate.importCsv()
  if(flags.export) Translate.exportCsv()
}


class TranslateCommand extends Command {
  async run() {
    const {args, flags} = this.parse(TranslateCommand)
    if(args.filename === 'all'){
      //recurse for all file
      //for each html file 
      //args.filename = filename
      //translateFunction(flags, args)
    }
    else translateFunction(flags, args)
  }
}

TranslateCommand.description = `Describe the command here
...
Extra documentation goes here
`
TranslateCommand.args = [
  {
    name: 'sitename',
    required: true,
    description: 'name of the site - must be unique.'
  },
  {
    name: 'filename',
    required: true,
    description: 'name of the file you want to translate (only html files accepted) - The default is all.',
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
