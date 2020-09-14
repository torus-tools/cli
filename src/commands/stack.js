const Config = require('@torus-tools/config')
Config.setGlobalEnv()
Config.setDotEnv()

const {Command, flags} = require('@oclif/command');
const {cli} = require('cli-ux');
const notifier = require('node-notifier')
const fs = require('fs');
const path = require('path');
const colors = require('colors')

const AWS = require('aws-sdk');
const cloudformation = new AWS.CloudFormation({apiVersion: '2010-05-15'});

const {deleteContent} = require('@torus-tools/content');
const domains = require('@torus-tools/domains')
const Stack = require('@torus-tools/stack');

const torus_config = {
  domain:'loclaizehtml.com',
  index:'index.html',
  error:'error.html',
  last_deployment:'',
  providers: {
    domain: 'other',
    bucket: 'aws',
    cdn: 'aws',
    dns: 'aws',
    https: 'aws'
  }
}

const supported_providers = {
  domain:['aws', 'godaddy', 'other'],
  dns:['aws', 'godaddy'],
  bucket: ['aws'],
  cdn: ['aws'],
  https: ['aws']
}

function deleteObjectsAndRecords(domain, config, cli){
  return new Promise((resolve, reject) => {
    let done = false
    cli.action.start('Deleting content')
    deleteContent(domain).then(()=>{
      cli.action.stop()
      if(done) resolve('All Done!')
      else done=true
    }).catch(err=>reject(err))
    if(config.providers.dns === 'aws'){
      cli.action.start('Deleting resource records')
      domains.aws.deleteAllRecords(domain).then(()=>{
        cli.action.stop()
        if(done) resolve('All Done!')
        else done=true
      }).catch(err=>reject(err))
    }
    else done=true
  })
}

/* function DeployParts(domain, stack, config, partialTemplate, partialStack, fullTemplate, importsTemplate, content, cli){
  deployParts(domain, stack, config, partialTemplate, partialStack, fullTemplate, importsTemplate, content, cli)
  .then(data => {
    console.timeEnd('Time Elapsed')
    notifier.notify({
      title: 'Deployment Complete',
      message: `Torus has finished deploying the website for ${args.domain}`,
      icon: path.join(__dirname, '../../img/arjan_deploy_logo.svg'), // Absolute path (doesn't work on balloons)
      sound: true, // Only Notification Center or Windows Toasters
    })
  }).catch(err=> this.error(new Error(err)))
} */


class StackCommand extends Command {
  async run() {
    console.time('Time Elapsed')
    for(let a in this.argv) if(this.argv[a].startsWith('-') && !this.argv[a].includes('=')) this.argv[a]+='=true'
    const {args, flags} = this.parse(StackCommand)
    var stack = {}
    let stackName = args.domain.split('.').join('') + 'Stack'
    //torus config should read from the file at torus/config.json. if the file doesnt exist it should create the file by reading from globalConfig and building it
    
    var config = await Config.getProjectConfig().catch(err=> this.error(err))
    if(!flags.domain) config.domain? config.domain: this.error('Please provide a valid domain for your site by using the -d flag i.e. -d=yoursite.com')

    if(args.setup === 'dev') stack['bucket'] = true;
    else if(args.setup === 'test') {
      stack['bucket'] = true;
      stack['www'] = true;
      stack['dns'] = true;
    }
    else if(args.setup === 'prod'){
      stack['bucket'] = true;
      stack['www'] = true;
      stack['dns'] = true;
      stack['cdn'] = true;
      stack['https'] = true;
    }
    if(flags.index) config.index = flags.index
    if(flags.error) config.error = flags.error
    for(let f in flags) {
      if(torus_config.providers[f]) {
        stack[f] = true
        if(supported_providers[f].includes(flags[f])) config.providers[f] = flags[f]
      }
    }

    if(args.action === 'pull'){
      cli.action.start('Updating torus/template.json')
      let template = await cloudformation.getTemplate({StackName: stackName}).promise().catch(err=>this.error(err))
      if(template) await fs.promises.writeFile('./torus/template.json', template.TemplateBody, 'utf8').catch(err=>this.error(err))
      cli.action.stop()
    }
    else if(args.action === 'delete'){
      cli.action.stop()
      this.warn(colors.yellow('This will delete all of the contnet, DNS records and resources associated to the stack for '+ args.domain))
      let answer = await cli.prompt(`To proceed please enter the domain name ${args.domain}`.red)
      if(answer === args.domain){
        deleteObjectsAndRecords(args.domain, config, cli).then(() => {
          cli.action.start(`Deleting ${stackName}`)
          cloudformation.deleteStack({StackName: stackName}).promise().then(()=> {
            cli.action.stop()
            this.log(colors.cyan('Stack deletion initiated'))
          }).catch(err => this.error(err))
        }).catch(err => this.error(err))
      }
      else this.exit()
    }
    else {
      // CREATE/UPDATE/IMPORT STACKS
      console.time('Elapsed Time')
      //create/overwrite the project config. Perhaps it would also be good to add the stack in the config
      //would also be goood to save the template in torus/template.json file after the import, partialStack, and fullStack executions
      fs.promises.writeFile('./torus/config.json', JSON.stringify(config)).catch(err=>this.error(err))
      cli.action.start('setting up')
      let template = null
      let partialStack = {
        bucket: false,
        www: false,
        dns: false
      }
      let stackId = await Stack.stackExists(args.domain)
      let templateString = ''
      if(stackId) {
        let temp = await cloudformation.getTemplate({StackName: stackId}).promise().catch(err => console.log(err))
        templateString = temp.TemplateBody
        template = JSON.parse(templateString)
      }
      //console.log('TEMPLATE ', template)
      for(let key in partialStack) if(stack[key]) partialStack[key] = true
      cli.action.stop()
      cli.action.start('generating templates')
      let partialRecords = stack.cdn? false : true
      var partTemplate = args.action==='push'? JSON.parse(fs.readFileSync('./torus/template.json', utf8)): await Stack.generateTemplate(args.domain, partialStack, config, template, partialRecords, flags.overwrite).catch(err => {throw new Error(err)})
      var partialTemplate = JSON.parse(JSON.stringify(partTemplate))
      var fullTemplate = args.action==='push'? partialTemplate : await Stack.generateTemplate(args.domain, stack, config, template, true, flags.overwrite).catch(err => {throw new Error(err)})
      cli.action.stop()
      //console.log(stack)
      if(stackId && JSON.stringify(fullTemplate.template) === templateString) this.error('No changes detected')
      else {
        //console.log('TEMPLATE 1 ', template)
        let impo = null
        if(!stackId && fullTemplate.existingResources.length > 0){
          cli.action.start('importing resources')
          impo = await Stack.deployTemplate(args.domain, fullTemplate, true)
          cli.action.stop()
        }
        //console.log('TEMPLATE 2 ', template)
        let parts = await Stack.deployParts(args.domain, stack, config, partialTemplate, partialStack, fullTemplate, impo?impo.template:template, flags.publish, cli)
        if(parts){
          //save the cloudformation full Template
          colors.yellow(console.timeEnd('Elapsed Time'))
          notifier.notify({
            title: 'Deployment Complete',
            message: `Torus has finished deploying the stack for ${args.domain}`,
            icon: path.join(__dirname, '../../img/arjan_deploy_logo.svg'), // Absolute path (doesn't work on balloons)
            sound: true, // Only Notification Center or Windows Toasters
          })
          let url = stack.cdn?args.domain: parts
          this.log('URL ', url)
          cli.open(url)
        }
      }
    }
  }
}

StackCommand.description = `Deploy static sites to AWS
...
Deploy static sites to the AWS Cloud using Cloudformation templates.
`
StackCommand.args = [
  {
    name: 'action',
    required: true,
    description: 'choose an action to perform. you can create, update, import your stack or upload files to your bucket.',
    options: ['create', 'update', 'import', 'delete', 'pull', 'push']
  },
  {
    name: 'domain',
    required: true,
    description: 'name of the site i.e. yoursite.com'
  },
  {
    name: 'setup',
    required: false,
    description: 'setup for the site - dev, test, production or custom',
    default: 'dev',
    options: ['dev', 'test', 'prod', 'custom']
  },
]

StackCommand.flags = {
  bucket: flags.string({
    char: 'b',                    
    description: 'creates an s3 bucket with a public policy',        
  }),
  www: flags.string({
    char: 'w',                    
    description: 'creates an s3 bucket with a public policy',        
  }),
  domain: flags.string({                  
    description: 'change the domain name registrar being used',
    char: 'r'        
  }),
  dns: flags.string({
    char: 'd',                    
    description: 'creates a Hosted Zone in route 53. Have your current DNS provider page open and ready to add a custom DNS.',        
  }),
  cdn: flags.string({
    char: 'c',                    
    description: 'creates a CloudFront distribution for your site.',        
  }),
  https: flags.string({
    char: 'h',                    
    description: 'creates and validates a TLS certificate for your site. If you arent using a route53 DNS you must create a CNAME record manually in your DNS.',        
  }),
  index: flags.string({
    char: 'i',
    description: 'name of the index document. default is index.html',
  }),
  error: flags.string({
    char: 'e',
    description: 'name of the error document',
  }),
  overwrite: flags.boolean({
    char: 'o',
    description: 'overwrite all existing resources with newly generated resources',
  }),
  publish: flags.boolean({
    char: 'p',
    description: 'Publish the sites content',
    default: true
  })
}

module.exports = StackCommand


