const {Command, flags} = require('@oclif/command')
const Translate = require('arjan-translate')

class TranslateCommand extends Command {
  async run() {
    const {args, flags} = this.parse(TranslateCommand)
    const n = flags.name || 'world'

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
    description: 'name of the file you want to translate - The default is all.',
    default: 'all'
  },
  {
    name: 'from',
    required: true,
    description: 'origin language of the file'
  },
  {
    name: 'to',
    required: true,
    description: 'desired translation language'
  },
  {
    name: 'action',
    required: false,
    description: 'desired translation language'
  }
]
TranslateCommand.flags = {
  backwards: flags.string({
    char: 'b',                    
    description: 'Email address that will be used to send emails',
    multiple: false,
    required: false         
  }),
  format: flags.string({
    char: 'f',                    
    description: 'Email address that will be used to send emails',
    multiple: false,
    required: false         
  })
}

module.exports = TranslateCommand
