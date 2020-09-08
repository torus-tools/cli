const {Command, flags} = require('@oclif/command')
const {uploadFile} = require('arjan-deploy')
const {createDir, createFile} = require('arjan-build')
const {cli} = require('cli-ux');
const fs = require('fs');
const path = require("path");
const Content = require('@torus-tools/content');
const { getFiles } = require('@torus-tools/content/lib/storage/upload');

/* var ignorePaths = fs.existsSync('./arjan_config/arjan_ignore.json')?JSON.parse(fs.readFileSync('./arjan_config/arjan_ignore.json')):{};

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
 */
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
      description: 'given action to carry out with the content of your site',
      options: ['list', 'download', 'upload', 'delete'],
      required: true
    },
    {
      name: 'files',
      description: 'path/s of the files/directories you want to upload. Providing none will select all files in your current working directory.',
    }
  ]
  async run() {
    await createFile('.torusignore', '').catch(err=>{throw new Error(err)})
    const {flags} = this.parse(ContentCommand)
    let filesArr = []
    for(let a=2; a<this.argv.length; a++) if(!this.argv[a].startsWith('-')) filesArr.push(this.argv[a]) 
    const files = filesArr.length>0? filesArr: null
    console.log(filesArr, flags)
    /* if(action === 'list') await Content.listContent(args.domain)
    else if(action === 'download') await Content.downloadContent(args.domain, flags.output, files, cli)
    else if(action === 'upload'){
      cli.action.start('uploading files')
      //if(!files) files = await getFiles
      //await uploadFile(args.domain, files, flags.dir)
      cli.action.stop()
    }
    else if(action === 'delete'){
      let answer = await cli.prompt(`Are you sure you want to delete ${args.files?files.join(', '):'all the files'} in ${args.domain}`)
      cli.action.start('Deleting files')
      if(answer === 'y' || answer === 'Y' || answer === 'yes'|| answer === 'Yes'){
        await Content.deleteContent(args.domain, files)
        .then(() => cli.action.stop()).catch(err => console.log(err))
      }
    } */
  }
}

ContentCommand.description = `List/download/upload/delete all of your content (or the specified files).
...
By default only modified files are uploaded; to upload all files provide the --all flag. To automatically update cache in cloudfront for the given files add the --reset flag.
`

ContentCommand.flags = {
  input: flags.string({
    char: 'i',                    
    description: 'Path of the root directory of your project (if different to the current working driectory).',
    default: './'      
  }), 
  output: flags.string({
    char: 'o',                    
    description: 'Path to save downloaded content into. Default is the current working directory.',
    default: './'      
  }),
  all: flags.boolean({
    char: 'a',                    
    description: 'Upload all files. By default only updated files are uploaded.',    
  }),
  reset: flags.boolean({
    char: 'r',                    
    description: 'Reset the cache in all edge locations for the given files.',
  }),  
}

module.exports = ContentCommand
