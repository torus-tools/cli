const {Command, flags} = require('@oclif/command')
const {createDir, createFile} = require('arjan-build')
const {cli} = require('cli-ux');
const open = require('open')
const Config = require('@torus-tools/config')
const colors = require('colors')

/* const ignorePaths = {
  '.env':true,
  '.git':true,
  '.github':true,
  '.gitignore':true,
  'package.json':true,
  'package-lock.json':true,
  'node_modules':true,
  'dep_pack':true,
  'arjan_config':true,
  "README.md":true,
  'forms':true,
} */

var global_defaults = 
`[default_providers]
domain=other
bucket=aws
dns=aws
cdn=aws
https=aws

[default_options]
index=index.html
error=error.html`

class InitCommand extends Command {
  async run() {
    const {flags, args} = this.parse(InitCommand)
    if(flags.global) {
      let setups = {}
      //let global_setup = global_defaults
      //console.log(flags.providers)
      for(let p of flags.providers){
        //console.log('PROVIDER ', p)
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
    else {
      if(!flags.domain) this.error('Please provide a valid domain with the -d flag')
      //creates a torus directory
      //creates the torus/config.json file
      //creates an empty .env file
      //create a .torusignore file
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
