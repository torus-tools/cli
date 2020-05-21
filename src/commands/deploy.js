const {Command, flags} = require('@oclif/command');
import cli from 'cli-ux';
const Deploy = require('arjan-deploy');

function delay(ms){
  return new Promise((resolve) => {
    setTimeout(resolve(true), ms)
  })
}

class DeployCommand extends Command {
  async run() {
    const {args, flags} = this.parse(DeployCommand)
    if(args.setup){
      if(args.setup === 'test') {
        flags.www = true;
        flags.route53 = true;
      }
      else if(arg.setup === 'prod'){
        flags.www = true;
        flags.route53 = true;
        flags.cdn = true;
        flags.https = true;
      }
    }
    if(args.action === 'create' || args.action === 'update'){
      let newTemplate = await Deploy.generateTemplate(args.site, flags.index, flags.error, flags.www, flags.cdn, flags.route53, flags.https)
      let temp = {TemplateBody:{}};
      let stackName = args.site.split('.').join('') + 'Stack'
      let stackId = await Deploy.stackExists(stackName)
      if(stackId) temp = await cloudformation.getTemplate({StackName: stackId}).promise()
      if(temp.TemplateBody === JSON.stringify(newTemplate.template)) console.log('No changes detected...')
      else {
        let template = await Deploy.generateTemplate(args.site, flags.index, flags.error, flags.www, false, flags.route53, false)
        let wait = false;
        if(temp.TemplateBody === JSON.stringify(template.template)) wait = true;
        else {
          cli.action.start('Deploying your stack')
          let stack = await Deploy.deployStack(args.site, template.template, template.existingResources, false, false, false, flags.route53)
          let waitAction = 'stackCreateComplete'
          if(stack.action === 'UPDATE') waitAction = 'stackUpdateComplete';
          else if(stack.action === 'IMPORT') waitAction = 'stackImportComplete';
          wait = await cloudformation.waitFor(waitAction, {StackName: stack.name}).promise()
          if(wait) {
            cli.action.stop()
            if(flags.upload){
              cli.action.start('Uploading files to your s3 bucket')
              console.log('uploading Dir', 'uploadDir()')
              cli.action.stop()
            }
          }
          if(wait && stack.action === 'CREATE') {
            if(flags.route53){
              newHostedZone(stackName).then(data => console.log(data)).catch(err => console.log(err))
              wait = await delay(5000)
              console.log('I assume you have finished updating your nameservers...')
              //const answer = await cli.prompt('Have you finished updating all your nameservers?')
              //if(answer === 'y' || answer === 'Y' || answer === 'yes'|| answer === 'Yes')
            }
            else console.log('you can access your test site at the following url ...')
            //need to write a function to get the propper url of the s3 bucket
          }
        }
        if(wait && flags.https){
          //check that the certificate doesnt exist
          cli.action.start('Creating your digital certificate')
          let certArn = await Deploy.createCertificate(args.site, stackName, flags.route53)
          if(certArn) {
            cli.action.stop()
            cli.action.start('validating your certificate')
          }
          let certwait = await acm.waitFor('certificateValidated', {CertificateArn:certArn}).promise().catch((err) => console.log(err))
          if(certwait) cli.action.stop('validated')
          if(certwait && flags.cdn){
            //check that the cdn doesnt exist
            cli.action.start('Deploying the cloudfront distribution')
            let data = await Deploy.generateTemplate(args.site, flags.index, flags.error, flags.www, flags.cdn, flags.route53, arn).catch((err) => console.log(err))
            await Deploy.deployStack(args.site, data.template, data.existingResources, false, false, false, flags.route53)
            .then(() => {
              cli.action.stop()
              console.log('Cloudfront distribution in progress. It may take while until you notice the https on your url...')
              console.log('In the meantime your site is fully functional :)')
            }).catch((err) => console.log(err));
          }
        }
        else if(wait && flags.cdn && !flags.https){
          //check that the cdn doesnt exist
          cli.action.start('Deploying the cloudfront distribution')
          Deploy.generateTemplate(args.site, flags.index, flags.error, flags.www, flags.cdn, flags.route53, flags.https)
          .then((data)=> Deploy.deployStack(args.site, data.template, data.existingResources, false, false, false, flags.route53))
          .then(() => {
            cli.action.stop()
            console.log('Cloudfront distribution in progress.. It might take while...')
            console.log('In the meantime your site is fully functional :)')
          }).catch((err) => console.log(err));
        }
      }
    }
  }
}

DeployCommand.description = `Describe the command here
...
Extra documentation goes here
`
DeployCommand.args = [
  {
    name: 'sitename',
    required: true,
    description: 'name of the site i.e. yoursite.com'
  },
  {
    name: 'action',
    required: true,
    description: 'choose an action to perform. you can create, update, import your stack or upload files to your bucket.',
    options: ['create', 'update', 'import', 'upload']
  },
  {
    name: 'setup',
    required: false,
    description: 'setup for the site - dev, test, production or custom',
    default: 'dev',
    options: ['dev', 'test', 'prod', 'custom']
  },
]

DeployCommand.flags = {
  www: flags.boolean({
    char: 'w',                    
    description: 'creates a www s3 bucket that reroutes requests to the index.',        
  }),
  route53: flags.boolean({
    char: 'r',                    
    description: 'creates a Hosted Zone in route 53. Have your current DNS provider page open and ready to add a custom DNS.',        
  }),
  cdn: flags.boolean({
    char: 'c',                    
    description: 'creates a CloudFront distribution for your site.',        
  }),
  https: flags.boolean({
    char: 'h',                    
    description: 'creates and validates a TLS certificate for your site. If you arent using a route53 DNS you must create a CNAME record manually in your DNS.',        
  }),
  index: flags.string({
    char: 'i',
    description: 'name of the index document. default is index.html',
    default: 'index.html', 
  }),
  error: flags.string({
    char: 'e',
    description: 'name of the error document',
    default: 'error.html', 
  }),
  upload: flags.string({
    char: 'f',
    description: 'name of a specific file you want to upload to your site. all uploads all of the files'
  })
}

module.exports = DeployCommand
