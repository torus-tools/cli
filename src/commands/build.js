const {Command, flags} = require('@oclif/command')
const Localize = require('arjan-localize')
const fs = require('fs')

class BuildCommand extends Command {
  async run() {
    const {flags, args} = this.parse(BuildCommand)
    if(flags.localize) Localize.Build(args.region, args.profile)
    .then(data=> console.log(data))
    .catch(err => console.log(err))
  }
}

BuildCommand.description = `Describe the command here
...
Extra documentation goes here
`

BuildCommand.args = [
  {
    name: 'region',
    required: false,
    description: 'AWS Region',
    default: 'us-east-1'
  },
  {
    name: 'profile',
    required: false,
    description: 'AWS Profile',
    default: 'default'
  }
]

BuildCommand.flags = {
  localize: flags.boolean({
    char: 'l',                    
    description: 'builds required files/dirs for arjan localize',
    default: true        
  }),  
  optimize: flags.boolean({
    char: 'o',                    
    description: 'builds required files/dirs for arjan optimize',
    default: true        
  }),
  audit: flags.boolean({
    char: 'a',                    
    description: 'builds required files/dirs for arjan audit',
    default: true        
  }),
  deploy: flags.boolean({
    char: 'd',                    
    description: 'builds required files/dirs for arjan deploy',
    default: true        
  }),
}

module.exports = BuildCommand
