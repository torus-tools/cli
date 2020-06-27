const {Command, flags} = require('@oclif/command')
const {cli} = require('cli-ux');
const Build = require('arjan-build')
const fs = require('fs')
const open = require('open')

const ignorePaths = {
  '.env':true,
  '.git':true,
  '.gitignore':true,
  'package.json':true,
  'package_lock.json':true,
  'node_modules':true,
  'dep_pack':true,
  'arjan_config':true,
  "README.md":true,
  'forms':true,
  /* 'lib':true,
  'test':true,
  '.yo-repository':true,
  'bin':true,
  'src':true,
  'webpack.dev.js': true,
  'webpack.plugins.dev.js': true,
  'webpack.plugins.prod.js': true,
  'webpack.prod.js': true, */
}

class InitCommand extends Command {
  async run() {
    const {flags, args} = this.parse(InitCommand)
    cli.action.start('Setting up')
    if(flags.global) {
      let url = await Build.createIamUser(args.profile, args.region)
      await open(url)
      cli.action.stop()
      console.log('Finish setting up your IAM user in the AWS console then update your local profile with the keys displayed. For more info see https://arjan.tools/en/docs.html')
    }
    else {
      let build = await Build.initBuild(args.profile, args.region).catch(err=> console.log(err))
      let file = await Build.createFile('arjan_config/arjan_ignore.json', JSON.stringify(ignorePaths)).catch(err=>console.log(err))
      if(build && file) cli.action.stop()
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
