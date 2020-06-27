const {Command, flags} = require('@oclif/command')
const {deleteObjects} = require('arjan-deploy')
const {cli} = require('cli-ux');
const ignorePaths = {
  "dep_pack": true, //must be ingored.
  "node_modules":true,
  ".git":true
}

class DeleteCommand extends Command {
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
    let files = [];
    for(let f=1; f<this.argv.length; f++) if(!this.argv[f].startsWith('-')) files.push(this.argv[f])
    const {args} = this.parse(DeleteCommand)
    let answer = await cli.prompt(`Are you sure you want to delete ${args.files?files.join(', '):'all the files'} in ${args.domain}`)
    cli.action.start('Deleting files')
    if(answer === 'y' || answer === 'Y' || answer === 'yes'|| answer === 'Yes'){
      await deleteObjects(args.domain, args.files?args.files:null)
      .then(() => cli.action.stop()).catch(err => console.log(err))
    }
    else cli.action.stop()
  }
}

DeleteCommand.description = `Describe the command here
...
Extra documentation goes here
`

DeleteCommand.flags = {}

module.exports = DeleteCommand
