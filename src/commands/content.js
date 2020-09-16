const Config = require('@torus-tools/config')
Config.setGlobalEnv()
Config.setDotEnv()

const {Command, flags} = require('@oclif/command')
const {createFile} = require('@torus-tools/config')
const {cli} = require('cli-ux');
const Content = require('@torus-tools/content');
const Report = require('../report')
const colors = require('colors')

class ContentCommand extends Command {
  static strict = false
  static args = [
    {
      name: 'action',
      description: 'given action to carry out with the content of your site',
      options: ['list', 'download', 'upload', 'delete'],
      required: true
    },
    {
      name: 'files',
      description: 'local paths or object keys of the files/directories you want to upload/download to/from your bucket. For example suppose theres a directory img inside the cwd the path of image1.jpg would be img/image1.jpg. For local files the root is the current working directory unless specifiecd otherwise with the -i flag. By default, if no paths are provided all files/dirs in the root will be used.',
    }
  ]
  async run() {
    await createFile('.torusignore', '').catch(err=>{throw new Error(err)})
    const {args, flags} = this.parse(ContentCommand)
    
    var config = await Config.getProjectConfig().catch(err=> this.error(err))
    if(!flags.domain) flags.domain = config.domain? config.domain: this.error('Please provide a valid domain for your site by using the -d flag i.e. -d=yoursite.com')
    
    let filesArr = []
    for(let a=1; a<this.argv.length; a++) if(!this.argv[a].startsWith('-')) filesArr.push(this.argv[a]) 
    var files = filesArr.length>0? filesArr: null
    const customBar = cli.progress({
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      format: 'Downloading | '+colors.green('{bar}')+' | Files: {value}/{total} | ETA: {eta}s'
    })
    if(args.action === 'list') {
      let data = await Content.listContent(flags.domain).catch(err=>this.error(err))
      var contents = flags.sort ? data.Contents.sort((a, b) => b.LastModified - a.LastModified) : data.Contents
      let space = 70
      let body = Report.sepparator(space) + Report.getHeading('Bucket Contents', space) + Report.sepparator(space) + Report.blankLine(space) + Report.getReportItem(true, space, 'KEY', 'LAST MODIFIED', ' ')
      for(let obj of contents) body+=Report.getReportItem(false, space, obj.Key, obj.LastModified.toLocaleDateString('en-US')+' '+obj.LastModified.toLocaleTimeString('en-US'), '.')
      body+=Report.blankLine(space)+Report.sepparator(space)
      this.log(body)
    }
    else if(args.action === 'download') {
      await Content.downloadContent(flags.domain, flags.output, files, customBar)
    }
    else if(args.action === 'delete'){
      let answer = await cli.prompt(`Are you sure you want to delete ${args.files?files.join(', '):'all the files'} in the ${flags.domain} bucket`)
      if(answer === 'y' || answer === 'Y' || answer === 'yes'|| answer === 'Yes'){
        cli.action.start('Deleting files')
        await Content.deleteContent(flags.domain, files).catch(err => this.error(err))
        cli.action.stop()
      }
      else this.exit()
    }
    else if(args.action === 'upload'){
      if(!files) files = await Content.listFiles(null, flags.input)
      await Content.uploadContent(flags.domain, files, flags.reset, !flags.all, flags.input, cli)
    }
  }
}

ContentCommand.description = `List/download/upload/delete all of your content (or the specified files).
...
By default only modified files are uploaded; to upload all files provide the --all flag. To automatically update cache in cloudfront for the given files add the --reset flag.
`

ContentCommand.flags = {
  domain: flags.string({
    char: 'd',                    
    description: 'Domain of your site (i.e. yoursite.com).',      
  }),
  input: flags.string({
    char: 'i',                    
    description: 'Path of the root directory of your project (if different to the current working driectory).'    
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
  sort: flags.boolean({
    char: 's',                    
    description: 'Sorts listed files by last modified date.',
  }), 
}

module.exports = ContentCommand
