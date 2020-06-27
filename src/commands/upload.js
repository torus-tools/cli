const {Command, flags} = require('@oclif/command')
const {uploadFile} = require('arjan-deploy')
const {cli} = require('cli-ux');
const fs = require('fs');
const path = require("path");

var ignorePaths = JSON.parse(fs.readFileSync('./arjan_config/arjan_ignore.json'));

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

class UploadCommand extends Command {
  static strict = false
  static args = [
    {
      name: 'domain',
      description: 'root domain of your site',
      required: true
    },
    {
      name: 'files',
      description: 'path of the file/s you want to upload. Providing none or / will upload all the files in your current directory.',
    }
  ]
  async run() {
    cli.action.start('uploading files')
    let files = []
    //let exports = false;
    for(let f=1; f<this.argv.length; f++) if(!this.argv[f].startsWith('-')) files.push(this.argv[f])
    const {args, flags} = this.parse(UploadCommand)
    //console.log(flags, args)
    //console.log(files)
    let dir = './'
    if(flags.dir) dir = flags.dir;
    if(!args.files || args.files === '/') files = await scanFiles(dir)
    for(let file of files) await uploadFile(args.domain, file, flags.dir)
    cli.action.stop()
  }
}

UploadCommand.description = `Describe the command here
...
Extra documentation goes here
`

UploadCommand.flags = {
  dir: flags.string({
    char: 'd',                    
    description: 'path of a directory you want to upload to your site',      
  }),  
}

module.exports = UploadCommand
