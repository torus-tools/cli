const {Command, flags} = require('@oclif/command')
const {cli} = require('cli-ux');
const open = require('open')
const Config = require('@torus-tools/config')
const colors = require('colors')

const ignorePaths = {
  '.env':true,
  '.git':true,
  '.github':true,
  '.gitignore':true,
  'package.json':true,
  'package-lock.json':true,
  'torus':true,
  '.torusignore': true
}

var global_defaults = 
`[default_providers]
registrar=other
bucket=aws
dns=aws
cdn=aws
ssl=aws

[default_options]
index=index.html
error=error.html`

const emptyTemplate = {
  "AWSTemplateFormatVersion": "2010-09-09",
  "Resources": {}    
}

class InitCommand extends Command {
  async run() {
    const {flags, args} = this.parse(InitCommand)
    if(flags.global) {
      if(flags.providers && flags.providers.length >0){
        let setups = {}
          for(let p of flags.providers){
            let prov = await Config.getProviderSetup[p]()
            setups[p] = prov
            global_defaults+='\n\n'+prov.config
          }
          //the createGlobal config should actually try to read the global config; if it exists it should parse the global config and add new providers to the existing config then convert the object back to toml and save.
          let gc = await Config.createGlobalConfig(global_defaults)
          await open(gc.path)
          let i=0;
          for(let p=0; p < flags.providers.length; p++){
            if(i>=p){
              let title = colors.underline.yellow(`${flags.providers[i]} setup\n`.toUpperCase())
              this.log(title+setups[flags.providers[i]].setup+'\n'+colors.yellow(setups[flags.providers[i]].config))
              await open(setups[flags.providers[i]].url)
              const res = await cli.prompt(`Finished setting up ${flags.providers[i]}?`)
              if(res === 'y' || res === 'Y' || res === 'yes' || res === 'Yes') i+=1
              this.log('\n')
            }
          }
        }
      else this.error('Please add atleast one provider with the -p flag. valid providers include:\naws\ngodaddy')
    }
    else {
      if(!flags.domain) this.error('Please provide a valid domain with the -d flag')
      else {
        let torusignore = ''
        for(let i in ignorePaths) if(ignorePaths[i]) torusignore+=i+'\n'
        let config = await Config.getGlobalSettings().catch(err=>this.error(err))
        config.domain = flags.domain
        await Config.createDir('./torus')
        await Config.createFile('./.env', '')
        await Config.createFile('./.torusignore', torusignore)
        await Config.createFile('./torus/template.json', JSON.stringify(emptyTemplate))
        await Config.createDir('./torus/changesets')
        await Config.createFile('./torus/config.json', JSON.stringify(config))
      }
    }
  }
}

InitCommand.description = `Configure torus globally in your machine, or on a per-project basis
...
The init command helps you configure torus in your site/project. Providing the -g (--global) flag helps you configure torus globally (for all of your projects). When using the torus CLI, you can always overwrite global settings by including a project config file. You can also overwrite global environment variables by including a .env file. If you are using the init command without the -g flag make sure to run it from the root of your project.  
`

InitCommand.args = []

InitCommand.flags = {
  global: flags.boolean({
    char: 'g',                    
    description: 'Create a global torus configuration file. The command will guide you through the steps to generate the required API keys for each of your desired providers, set up your global environment variables and your deisred default settings.',        
  }),
  providers: flags.string({
    char: 'p',                    
    description: 'Desired cloud/domain providers to be used with torus. You must have an existing account in all of the providers you choose.',
    options: ['aws', 'godaddy'],
    multiple: true,
    dependsOn: ['global']       
  }),
  domain: flags.string({
    char: 'd',                    
    description: 'The valid desired/existing domain of your site i.e. yoursite.com',    
  }),
  region: flags.string({
    char: 'r',                   
    description: 'Desired AWS region',
    options: Config.awsRegions,
    default: 'us-east-1'     
  }),
  user: flags.string({
    char: 'u',                    
    description: 'Desired name for the AWS IAM user',
    default: 'torus_admin'       
  }),
}

module.exports = InitCommand
