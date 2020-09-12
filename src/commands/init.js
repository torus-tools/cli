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
  'node_modules':true,
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

var config = {
  options:{
    index:'index.html',
    error:'error.html'
  },
  providers: {
    registrar: 'other',
    bucket: 'aws',
    cdn: 'aws',
    dns: 'aws',
    ssl: 'aws'
  }
}

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
        for(let i in ignorePaths) if(ignorePaths[i]) torusignore+=i
        let global_config = await Config.readGlobalConfig()
        let obj = await Config.parseConfig(global_config)
        config.domain = flags.domain
        for(let p in config.providers) config.providers[p] = obj.default_providers[p]
        for(let o in obj.default_options) config.options[o] = obj.default_options[o]
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

InitCommand.description = `Describe the command here
...
Extra documentation goes here
`

InitCommand.args = []

InitCommand.flags = {
  global: flags.boolean({
    char: 'g',                    
    description: 'Global setup should by run atleast once after the first installation of torus',        
  }),
  providers: flags.string({
    char: 'p',                    
    description: 'desired cloud providers',
    options: ['aws', 'godaddy'],
    multiple: true,
    dependsOn: ['global']       
  }),
  domain: flags.string({
    char: 'd',                    
    description: 'Valid domain for your project',    
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
