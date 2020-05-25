const {Command, flags} = require('@oclif/command')
const Audit = require('arjan-audit')
const {createFile} = require('arjan-localize')
const {cli} = require('cli-ux');
const defaults = {
  "dir":"./dep_pack",
  "file":"index.html",
  "port":8080,
  "threshold":0.8
}

class AuditCommand extends Command {
  async run() {
    //create the config.json file
    const {flags} = this.parse(AuditCommand)
    let config = await createFile('audit_config.json', JSON.stringify(defaults))
    let config_json = JSON.parse(config)
    //for each flag if not provided check the audit_config.json
    for(let f in AuditCommand.flags){
      if(!flags[f]) flags[f] = config_json[f]
    }
    cli.action.start('Running Lighthouse Audit')
    Audit(flags.dir, flags.file, flags.port, flags.threshold).then(data => {
      console.log(data)
      cli.action.stop()
    })
  }
}

AuditCommand.description = `Describe the command here
...
Extra documentation goes here
`

AuditCommand.flags = {
  dir: flags.string({
    char: 'd',                    
    description: 'Directory path to serve. default is root (relative to the path in which you run the command)',        
  }),
  file: flags.string({
    char: 'f',                    
    description: 'Path of the page you want to audit. default is index.html',        
  }),
  port: flags.string({
    char: 'p',                    
    description: 'Port used for the test server. Default is 8080.',        
  }),
  threshold: flags.string({
    char: 't',                    
    description: 'Integer value from 0 to 1 that represents what you consider to be an acceptable lighthouse score for your site. Its very similar to what you would consider an acceptable school test grade.',
  })
}

module.exports = AuditCommand
