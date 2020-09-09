//const globalEnv = readEnv()
//initEnv(globalEnv)
require('dotenv').config()
const {Command, flags} = require('@oclif/command');
const AWS = require('aws-sdk');
const cloudformation = new AWS.CloudFormation({apiVersion: '2010-05-15'});
const {cli} = require('cli-ux');
const notifier = require('node-notifier')
const path = require('path');
const open = require('open');
const deleteObjects = require('arjan-deploy/lib/deleteObjects');
const Stack = require('@torus-tools/stack');
const fs = require('fs');

const torus_config = {
  domain:'loclaizehtml.com',
  index:'index.html',
  error:'error.html',
  last_deployment:'',
  providers: {
    domain: 'godaddy',
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

function deleteObjectsAndRecords(cli){
  return new Promise((resolve, reject) => {
    let done = false
    cli.action.start('deleting objects')
    deleteAllRecords.then(()=>{
      if(done) {
        cli.action.stop()
        resolve('All Done!')
      }
      else done=true
    }).catch(err=>reject(err))
    deleteObjects(cli).then(()=>{
      if(done) {
        cli.action.stop()
        resolve('All Done!')
      }
      else done=true
    }).catch(err=>reject(err))
  })
}

function DeployParts(domain, stack, config, partialTemplate, partialStack, fullTemplate, importsTemplate, content, cli){
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
}


class StackCommand extends Command {
  async run() {
    console.time('Time Elapsed')
    cli.action.start('Setting Up')
    for(let a in this.argv) if(this.argv[a].startsWith('-') && !this.argv[a].includes('=')) this.argv[a]+='=true'
    const {args, flags} = this.parse(StackCommand)
    var stack = {}
    //torus config should read from the file at torus/config.json. if the file doesnt exist it should create the file by reading from globalConfig and building it
    var config = torus_config
    if(args.setup){
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
    }
    if(flags.index) config.index = flags.index
    if(flags.error) config.error = flags.error
    for(let f in flags) {
      if(torus_config.providers[f]) {
        stack[f] = true
        if(supported_providers[f].includes(flags[f])) config.providers[f] = flags[f]
      }
    }
    cli.action.stop()

    if(args.action === 'pull'){
      cli.action.start('Updating torus/template.json')
      let stackName = args.domain.split('.').join('') + 'Stack'
      let template = await cloudformation.getTemplate({StackName: stackName}).promise().catch(()=>this.err(err))
      if(template) await fs.promises.writeFile('./torus/template.json', template.TemplateBody, 'utf8').catch(err=>this.error(err))
      cli.action.stop()
    }

    /* if(args.action === 'delete'){
      // DELETE STACK
      cli.action.stop()
      this.warn('Warning: this will delete all of the contnet, DNS records and resources associated to the stack for '+ args.domain)
      let answer = await cli.prompt(`To proceed please enter the domain name ${args.domain}`)
      if(answer === args.domain){
        deleteObjectsAndRecords(cli).then(() => {
          let stackName = args.domain.split('.').join('') + 'Stack';
          cli.action.start(`Deleting ${stackName}`)
          cloudformation.deleteStack({StackName: stackName}).promise().then(()=> {
            cli.action.stop('Success')
            console.log('Your cloudformation stack is being deleted')
          }).catch(err => console.log(err))
        }).catch(err => console.log(err))
      }
      else this.exit()
    }
    else { 

      // CREATE/UPDATE/IMPORT STACK
      let template = null
      let partialStack = {
        bucket: false,
        www: false,
        dns: false
      }
      let stackId = await stackExists.aws(domain)
      let templateString = ''
      if(stackId) {
        let temp = await cloudformation.getTemplate({StackName: stackId}).promise().catch(err => console.log(err))
        templateString = temp.TemplateBody
        template = JSON.parse(templateString)
      }
      for(let key in partialStack) if(stack[key]) partialStack[key] = true
      
      cli.action.stop()
      cli.action.start('Generating templates')

      const partTemplate = await generateTemplate(domain, partialStack, config, template, overwrite).catch(err => {throw new Error(err)})
      const partialTemplate = JSON.parse(JSON.stringify(partTemplate))
      const fullTemplate = await generateTemplate(domain, stack, config, template, overwrite).catch(err => {throw new Error(err)})
      if(partialTemplate && fullTemplate) cli.action.stop()

      //console.log(JSON.stringify(partialTemplate))
      //console.log(JSON.stringify(fullTemplate))

      if(stackId && JSON.stringify(fullTemplate.template) === templateString) {
        this.warn('No changes detected')
        this.exit()
      }
      else {
        //import then update or create
        if(fullTemplate.existingResources.length > 1){
          cli.action.start('Importing existing resources')
          let importsTemplate = initialTemplate
          for(elem of fullTemplate.existingResources) importsTemplate.Resources[elem['LogicalResourceId']] = fullTemplate.template.Resources[elem['LogicalResourceId']]
          deployTemplate(domain, importsTemplate, fullTemplate.existingResources, true)
          .then(()=> {
            cli.action.stop()
            DeployParts(domain, stack, config, partialTemplate, partialStack, fullTemplate, importsTemplate, content, cli)
          }).catch(err=> this.error(new Error(err)))
        }
        //update or create
        else{
          DeployParts(domain, stack, config, partialTemplate, partialStack, fullTemplate, template, content, cli)
        } 
      }
    } */

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
    options: ['create', 'update', 'import', 'delete', 'pull']
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
    description: 'change the default domain name registrar being used',        
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
  upload: flags.boolean({
    char: 'u',
    description: 'upload directory content into the site',
    default: true
  })
}

module.exports = StackCommand


