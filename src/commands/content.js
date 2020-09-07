const {Command, flags} = require('@oclif/command')
const {uploadFile} = require('arjan-deploy')
const {cli} = require('cli-ux');
const fs = require('fs');
const path = require("path");

var ignorePaths = fs.existsSync('./arjan_config/arjan_ignore.json')?JSON.parse(fs.readFileSync('./arjan_config/arjan_ignore.json')):{};

function scanFiles(dir){
  let arrs = [];
  return new Promise(async (resolve, reject) => {
    scanDir(dir, (filePath, stat) => arrs.push(filePath))
    resolve(arrs)
  })
}
function scanDir(currentDirPath, callback) {
  fs.readdirSync(currentDirPath).forEach((name)=>{
    var filePath = path.join(currentDirPath, name);
    var stat = fs.statSync(filePath);
    if(!ignorePaths[filePath]) {
      if (stat.isFile()) callback(filePath, stat);
      else if (stat.isDirectory()) scanDir(filePath, callback)
    }
  });
}

class ContentCommand extends Command {
  static strict = false
  static args = [
    {
      name: 'domain',
      description: 'root domain of your site',
      required: true
    },
    {
      name: 'action',
      description: 'list/download/upload/delete files from a storage bucket',
      options: ['list', 'download', 'upload', 'delete'],
      required: true
    },
    {
      name: 'files',
      description: 'path of the file/s you want to upload. Providing none or / will upload all the files in your current directory.',
    }
  ]
  async run() {
    if(action === 'list'){}
    else if(action === 'download'){}
    else if(action === 'upload'){
      cli.action.start('uploading files')
      let files = []
      //let exports = false;
      for(let f=2; f<this.argv.length; f++) if(!this.argv[f].startsWith('-')) files.push(this.argv[f])
      const {args, flags} = this.parse(ContentCommand)
      //console.log(flags, args)
      //console.log(files)
      if(!args.files || args.files === '/') files = await scanFiles(flags.dir)
      for(let file of files) await uploadFile(args.domain, file, flags.dir)
      cli.action.stop()
    }
    else if(action === 'delete'){
      let answer = await cli.prompt(`Are you sure you want to delete ${args.files?files.join(', '):'all the files'} in ${args.domain}`)
      cli.action.start('Deleting files')
      if(answer === 'y' || answer === 'Y' || answer === 'yes'|| answer === 'Yes'){
        await deleteObjects(args.domain, args.files?args.files:null)
        .then(() => cli.action.stop()).catch(err => console.log(err))
      }
      else cli.action.stop()
    }
  }
}

ContentCommand.description = `Describe the command here
...
Extra documentation goes here
`

ContentCommand.flags = {
  dir: flags.string({
    char: 'd',                    
    description: 'path of a directory you want to upload to your site',
    default: './'      
  }), 
  updates: flags.boolean({
    char: 'u',                    
    description: 'only upload updated files',
    default: true      
  }),
  cache: flags.boolean({
    char: 'c',                    
    description: 'invalidate cache for updated files',
  }),  
}

module.exports = ContentCommand
