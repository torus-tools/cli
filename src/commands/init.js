const {Command, flags} = require('@oclif/command')
const Build = require('arjan-build')
const fs = require('fs')
const open = require('open')

class InitCommand extends Command {
  async run() {
    const {flags, args} = this.parse(InitCommand)
    if(flags.global) {
      let url = await Build.createIamUser(args.profile, args.region)
      await open(url)
      console.log('Finish setting up your IAM user in the AWS console then update your local profile with the keys displayed. For more info see https://arjan.tools/en/docs.html')
    }
    else {
      let build = await Build.initBuild(args.profile, args.region)
      console.log(build)
    }
  }
}

InitCommand.description = `Describe the command here
...
Extra documentation goes here
`

InitCommand.args = [
  {
    name: 'profile',
    required: false,
    description: 'AWS Profile',
    default: 'default'
  },
  {
    name: 'region',
    required: false,
    description: 'AWS Region',
    default: 'us-east-1'
  }
]

InitCommand.flags = {
  global: flags.boolean({
    char: 'g',                    
    description: 'Guides you through your first time setup. Including AWS IAM user creation.',        
  }),
}

module.exports = InitCommand
