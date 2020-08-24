require('dotenv').config()
const AWS = require('aws-sdk');
const cloudformation = new AWS.CloudFormation({apiVersion: '2010-05-15'});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const acm = new AWS.ACM({apiVersion: '2015-12-08'});
const {Command, flags} = require('@oclif/command');

const {cli} = require('cli-ux');

const notifier = require('node-notifier')

const Deploy = require('arjan-deploy');
const Build = require('arjan-build')
const fs = require('fs');
const path = require("path");
const open = require('open');


const torus_config = {
  index:"index.html",
  error:"error.html",
  last_deployment:"",
  providers: {
    domain: 'godaddy',
    bucket: 'aws',
    cdn: 'aws',
    dns: 'aws',
    https: 'aws'
  }
}

const supported_providers = {
  domain:['aws', 'godaddy'],
  dns:['aws', 'godaddy'],
  bucket: ['aws'],
  cdn: ['aws'],
  https: ['aws']
}

class StackCommand extends Command {
  async run() {
    console.time('Time Elapsed')
    cli.action.start('Setting Up')
    for(let a in this.argv) if(this.argv[a].startsWith('-') && !this.argv[a].includes('=')) this.argv[a]+='=true'

    const {args, flags} = this.parse(StackCommand)
    var stack = {}
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

    console.log(config)
    console.log(stack)

    cli.action.stop()
    console.timeEnd('Time Elapsed')

    notifier.notify({
      title: 'Deployment Complete',
      message: `Torus has finished deploying the website for ${domain}`
    })

    /* if(args.action === 'delete'){
      // DELETE STACK
      console.log('Warning: this will delete all of the contnet, DNS records and resources associated to the stack for '+ args.domain)
      let answer = await cli.prompt(`Are you sure you want to delete the stack for ${args.domain}? enter the domain to confirm.`)
      if(answer === args.domain){
        cli.action.start(`Deleting content stored in the ${args.domain} bucket`)
        //delete records then set records to true. if content true delete stack
        //delete content then set content to true. if records is true delete stack

        Deploy.deleteObjects(args.domain).then(()=>{
          cli.action.stop()
          let stackName = args.domain.split('.').join('') + 'Stack';
          cli.action.start(`Deleting ${stackName}`)
          cloudformation.deleteStack({StackName: stackName}).promise()
          .then(()=> {
            cli.action.stop('Success')
            console.log('Your cloudformation stack is being deleted')
          }).catch(err => console.log(err))
        }).catch(err => console.log(err))
      }
    }
    else { 
      // CREATE/UPDATE/IMPORT STACK
      console.log('Setting up . . .')
      const start_time = new Date().getTime()
      var end_time = start_time
      var time_elapsed = 0

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
      
      console.log('finished setting up')
      console.log('generating templates . . .')

      const partTemplate = await generateTemplate(domain, partialStack, config, template, overwrite).catch(err => {throw new Error(err)})
      const partialTemplate = JSON.parse(JSON.stringify(partTemplate))
      const fullTemplate = await generateTemplate(domain, stack, config, template, overwrite).catch(err => {throw new Error(err)})
      if(partialTemplate && fullTemplate) console.log('finished generating templates')
      //console.log(JSON.stringify(partialTemplate))
      //console.log(JSON.stringify(fullTemplate))

      if(stackId && JSON.stringify(fullTemplate.template) === templateString) return('no changes detected')
      else {
        //import then update or create
        if(fullTemplate.existingResources.length > 1){
          console.log('importing existing resources . . .')
          let importsTemplate = initialTemplate
          for(elem of fullTemplate.existingResources) importsTemplate.Resources[elem['LogicalResourceId']] = fullTemplate.template.Resources[elem['LogicalResourceId']]
          deployTemplate(domain, importsTemplate, fullTemplate.existingResources, true)
          //wait for stackImport complete
          .then(()=> {
            console.log('finished importing resources')
            deployParts(domain, stack, config, partialTemplate, partialStack, fullTemplate, importsTemplate, content)
            .then(data => {
              end_time = new Date().getTime()
              time_elapsed = (end_time - start_time)/1000
              console.log('Time Elapsed: ', time_elapsed)
              return data
            }).catch(err=> {throw new Error(err)})
          }).catch(err=> {throw new Error(err)})
        }
        //update or create
        else{
          deployParts(domain, stack, config, partialTemplate, partialStack, fullTemplate, template, content)
          .then(data => {
            end_time = new Date().getTime()
            time_elapsed = (end_time - start_time)/1000
            console.log('Time Elapsed: ', time_elapsed)
            return data
          }).catch(err=> {throw new Error(err)})
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
    name: 'domain',
    required: true,
    description: 'name of the site i.e. yoursite.com'
  },
  {
    name: 'action',
    required: true,
    description: 'choose an action to perform. you can create, update, import your stack or upload files to your bucket.',
    options: ['create', 'update', 'import', 'delete']
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

