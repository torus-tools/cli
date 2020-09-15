const Config = require('@torus-tools/config')
Config.setGlobalEnv()
Config.setDotEnv()

const {Command, flags} = require('@oclif/command');
const {cli} = require('cli-ux');
const notifier = require('node-notifier')
const fs = require('fs');
const path = require('path');
const colors = require('colors');
const open = require('open');

const AWS = require('aws-sdk');
const cloudformation = new AWS.CloudFormation({apiVersion: '2010-05-15'});

const {deleteContent} = require('@torus-tools/content');
const domains = require('@torus-tools/domains')
const Stack = require('@torus-tools/stack');

const torus_config = {
  domain:'loclaizehtml.com',
  options:{
    index:'index.html',
    error:'error.html'
  },
  last_deployment:'',
  providers: {
    registrar: 'other',
    bucket: 'aws',
    cdn: 'aws',
    dns: 'aws',
    ssl: 'aws'
  }
}

const supported_providers = {
  registrar:['aws', 'godaddy', 'other'],
  dns:['aws', 'godaddy'],
  bucket: ['aws'],
  cdn: ['aws'],
  ssl: ['aws']
}

function deleteObjectsAndRecords(domain, config, cli){
  return new Promise((resolve, reject) => {
    let done = false
    Stack.stackResourceExists(domain).then(stack=>{
      if(stack.RootBucket){
        cli.action.start('Deleting content')
        deleteContent(domain).then(()=>{
          cli.action.stop()
          done? resolve('All Done!'): done=true
        }).catch(err=>reject(err))
      } else done? resolve('All Done!'): done=true
      if(config.providers.dns === 'aws' && stack.HostedZone){
        cli.action.start('Deleting resource records')
        domains.aws.deleteAllRecords(domain).then(()=>{
          cli.action.stop()
          done? resolve('All Done!'): done=true
        }).catch(err=>reject(err))
      } else done? resolve('All Done!'): done=true
    })
  })
}

class StackCommand extends Command {
  async run() {
    console.time('Time Elapsed')
    for(let a in this.argv) if(this.argv[a].startsWith('-') && !this.argv[a].includes('=')) this.argv[a]+='=true'
    const {args, flags} = this.parse(StackCommand)
    var config = await Config.getProjectConfig().catch(err=> this.error(err))
    if(!flags.domain) flags.domain = config.domain? config.domain: this.error('Please provide a valid domain for your site by using the -d flag i.e. -d=yoursite.com')
    var stack = {}
    const stackName = flags.domain.split('.').join('') + 'Stack'
    if(flags.index) config.options.index = flags.index
    if(flags.error) config.options.error = flags.error
    switch(args.setup){
      case 'dev':
        stack['bucket'] = true;
        break
      case 'test':
        stack['bucket'] = true;
        stack['www'] = true;
        stack['dns'] = true;
        break
      case 'prod':
        stack['bucket'] = true;
        stack['www'] = true;
        stack['dns'] = true;
        stack['cdn'] = true;
        stack['ssl'] = true;
        break
    }
    for(let f in flags) {
      if(torus_config.providers[f]) {
        stack[f] = true
        if(supported_providers[f].includes(flags[f])) config.providers[f] = flags[f]
      }
    }
    //write the config
    if(args.action === 'pull'){
      cli.action.start('Updating torus/template.json')
      let template = await cloudformation.getTemplate({StackName: stackName}).promise().catch(err=>this.error(err))
      if(template) await fs.promises.writeFile('./torus/template.json', template.TemplateBody, 'utf8').catch(err=>this.error(err))
      cli.action.stop()
    }
    else if(args.action === 'delete'){
      cli.action.stop()
      this.warn(colors.yellow('This will delete all of the contnet, DNS records and resources associated to the stack for '+ flags.domain))
      let answer = await cli.prompt(`To proceed please enter the domain name ${flags.domain}`.red)
      if(answer === flags.domain){
        deleteObjectsAndRecords(flags.domain, config, cli).then(() => {
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
      let stackId = await Stack.stackExists(flags.domain)
      let templateString = ''
      if(stackId) {
        let temp = await cloudformation.getTemplate({StackName: stackId}).promise().catch(err => console.log(err))
        templateString = temp.TemplateBody
        template = JSON.parse(templateString)
      }
      for(let key in partialStack) if(stack[key]) partialStack[key] = true
      cli.action.stop()
      cli.action.start('generating templates')
      let partialRecords = stack.cdn? false : true
      var partTemplate = args.action==='push'? JSON.parse(fs.readFileSync('./torus/template.json', utf8)): await Stack.generateTemplate(flags.domain, partialStack, config, template, partialRecords, flags.overwrite).catch(err => {throw new Error(err)})
      var partialTemplate = JSON.parse(JSON.stringify(partTemplate))
      var fullTemplate = args.action==='push'? partialTemplate : await Stack.generateTemplate(flags.domain, stack, config, template, true, flags.overwrite).catch(err => {throw new Error(err)})
      cli.action.stop()
      if(stackId && JSON.stringify(fullTemplate.template) === templateString) this.error('No changes detected')
      else {
        let impo = null
        if(!stackId && fullTemplate.existingResources.length > 0){
          cli.action.start('importing resources')
          impo = await Stack.deployTemplate(flags.domain, fullTemplate, true)
          cli.action.stop()
        }
        let parts = await Stack.deployParts(flags.domain, stack, config, partialTemplate, partialStack, fullTemplate, impo?impo.template:template, flags.publish, cli)
        if(parts){
          //save the cloudformation full Template
          colors.yellow(console.timeEnd('Elapsed Time'))
          notifier.notify({
            title: 'Deployment Complete',
            message: `Torus has finished deploying the stack for ${flags.domain}`,
            icon: path.join(__dirname, '../../img/arjan_deploy_logo.svg'), // Absolute path (doesn't work on balloons)
            sound: true, // Only Notification Center or Windows Toasters
          })
          let url = stack.cdn?flags.domain: parts
          await open(url)
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
    name: 'setup',
    required: false,
    description: 'setup for the site - dev, test, production or custom',
    default: 'dev',
    options: ['dev', 'test', 'prod', 'custom']
  },
]

StackCommand.flags = {
  domain: flags.string({
    char: 'd',                    
    description: 'The domain of your site i.e. yoursite.com',        
  }),
  bucket: flags.string({
    char: 'b',                    
    description: 'Enables a cloud storage bucket to be used as the websites origin. You can provide this flag without the =string to use aws s3.',
    options: ['aws', 'true']         
  }),
  www: flags.string({
    char: 'w',                    
    description: 'creates a www reroute bucket.',
    options: ['true']          
  }),
  registrar: flags.string({                  
    description: 'The current domain name registrar of your sites domain. Using AWS or godaddy enables automatic namserver updates if the DNS provider is different to the registrar. Selecting other will require manual nameserver updates. true evaluates to other.',
    char: 'r',
    options: ['aws', 'godaddy', 'other', 'true']        
  }),
  dns: flags.string({                   
    description: 'Desired DNS provider for your site. The aws option adds a route53 hosted zone to your stack. You can provide this flag without the =string to use aws.',
    options: ['aws', 'godaddy', 'other', 'true']        
  }),
  cdn: flags.string({
    char: 'c',                    
    description: 'Add a CDN to your site. CDNs enable faster website load times by caching your content around the globe (the edge). You can provide this flag without the =string to use aws Cloudfront.',
    options: ['aws', 'true']         
  }),
  ssl: flags.string({
    char: 's',                    
    description: 'Enables https by creating and validating an SSL certificate for your site. You can provide this flag without the =string to use aws certificate manager.',        
    options: ['aws', 'true'],
    dependsOn: ['cdn']
  }),
  index: flags.string({
    char: 'i',
    description: 'name of the index document. Default is index.html',
  }),
  error: flags.string({
    char: 'e',
    description: 'name of the error document. Default is error.html',
  }),
  overwrite: flags.boolean({
    char: 'o',
    description: 'By default, torus always reads your template in the cloud and only adds changes (updated resources or additional resources). If you want to eliminate the resources that arent prvoided in the CLI flags you can add this flag.',
  }),
  publish: flags.boolean({
    char: 'p',
    description: 'Publish the sites content',
    default: true
  })
}

module.exports = StackCommand


