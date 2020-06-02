const {Command, flags} = require('@oclif/command');
const {cli} = require('cli-ux');
const Deploy = require('arjan-deploy');
const AWS = require('aws-sdk');
const cloudformation = new AWS.CloudFormation({apiVersion: '2010-05-15'});
const acm = new AWS.ACM({apiVersion: '2015-12-08'});
require('dotenv').config()

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
      else if(args.setup === 'prod'){
        flags.www = true;
        flags.route53 = true;
        flags.cdn = true;
        flags.https = true;
      }
    }
    if(args.action === 'create' || args.action === 'update'){
      cli.action.start('Setting up...')
      let newTemplate = await Deploy.generateTemplate(args.site, flags.index, flags.error, flags.www, flags.cdn, flags.route53, flags.https)
      let temp = {TemplateBody:{}};
      let stackName = args.site.split('.').join('') + 'Stack'
      let stackId = await Deploy.stackExists(stackName)
      if(stackId) temp = await cloudformation.getTemplate({StackName: stackId}).promise().catch(err => console.log(err))
      if(temp.TemplateBody === JSON.stringify(newTemplate.template)) cli.action.stop('No changes detected...')
      else {
        cli.action.stop()
        cli.action.start('Generating template')
        let template = await Deploy.generateTemplate(args.site, flags.index, flags.error, flags.www, false, flags.route53, false)
        let wait = false;
        if(template) cli.action.stop()
        if(temp.TemplateBody === JSON.stringify(template.template)) wait = true;
        else {
          cli.action.start('Deploying your stack')
          let stack = await Deploy.deployStack(args.site, template.template, template.existingResources, false)
          let waitAction = 'stackCreateComplete'
          if(stack.action === 'UPDATE') waitAction = 'stackUpdateComplete';
          else if(stack.action === 'IMPORT') waitAction = 'stackImportComplete';
          wait = await cloudformation.waitFor(waitAction, {StackName: stack.name}).promise()
          //optional file upload
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
              wait = false;
              let nameservers = await Deploy.newHostedZone(stackName).catch(err => console.log(err))
              if(nameservers){
                console.log('\nIn your Domain name registrar, change your DNS settings to custom DNS and add the following Nameservers: \n')
                for(let ns of nameservers) console.log("\x1b[32m", ns+'.','\n', "\x1b[0m")
                await delay(10000)
                let answer = await cli.prompt('Have you finished updating your nameservers?')
                if(answer === 'y' || answer === 'Y' || answer === 'yes'|| answer === 'Yes') wait = true;
                else console.log('Exiting.') //exit the cliyou can access your test site at the following url ...
              }
            }
            else console.log(` http://${args.site}.s3-website-${process.env.AWS_REGION}.amazonaws.com`)
          }
        }
        if(wait && flags.https){
          let certExists = await Deploy.certificateExists()
          let certwait = false;
          let certArn = null;
          if(!certExists){
            cli.action.start('Creating your digital certificate')
            certArn = await Deploy.createCertificate(args.site, stackName, flags.route53).catch((err) => console.log(err))
            if(certArn) {
              cli.action.stop()
              cli.action.start('validating your certificate')
            }
            certwait = await acm.waitFor('certificateValidated', {CertificateArn:certArn}).promise().catch((err) => console.log(err))
            if(certwait) cli.action.stop('validated')
          }
          else certwait = true
          if(certwait && flags.cdn){
            //check that the cdn doesnt exist
            cli.action.start('Deploying the cloudfront distribution')
            let data = await Deploy.generateTemplate(args.site, flags.index, flags.error, flags.www, flags.cdn, flags.route53, certArn).catch((err) => console.log(err))
            await Deploy.deployStack(args.site, data.template, data.existingResources, false)
            .then(() => {
              cli.action.stop()
              console.log('Cloudfront distribution in progress. It may take while until the https is reflected in your url...')
              console.log('In the meantime your site is fully functional :)')
            }).catch((err) => console.log(err));
          }
        }
        else if(wait && flags.cdn && !flags.https){
          //check that the cdn doesnt exist
          cli.action.start('Deploying the cloudfront distribution')
          Deploy.generateTemplate(args.site, flags.index, flags.error, flags.www, flags.cdn, flags.route53, flags.https)
          .then((data)=> Deploy.deployStack(args.site, data.template, data.existingResources, false))
          .then(() => {
            cli.action.stop()
            console.log('Cloudfront distribution in progress.. It may take while...')
            console.log('In the meantime your site is fully functional :)')
          }).catch((err) => console.log(err));
        }
      }
    }
    else if(args.action === 'delete'){
      let stackName = args.site.split('.').join('') + 'Stack';
      cli.action.start('Removing any digital certificates associated to the domain')
      Deploy.deleteCertificate(args.site).then(data => {
        cli.action.stop();
        console.log("\x1b[33mIf any, please delete all additional route53 records you may have created and not attached to your cloudformation stack", "\x1b[0m");
        cli.action.start('Deleting your stack')
        cloudformation.deleteStack({StackName: stackName}).promise()
        .then(()=> {
          cli.action.stop('Success')
          console.log('Your cloudformation stack is being deleted')
        }).catch(err => console.log(err))
      }).catch(err => console.log(err))
    }
    //else if(args.action === upload)
  }
}

DeployCommand.description = `Describe the command here
...
Extra documentation goes here
`
DeployCommand.args = [
  {
    name: 'site',
    required: true,
    description: 'name of the site i.e. yoursite.com'
  },
  {
    name: 'action',
    required: true,
    description: 'choose an action to perform. you can create, update, import your stack or upload files to your bucket.',
    options: ['create', 'update', 'import', 'delete', 'upload']
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
    char: 'u',
    description: 'name of a specific file you want to upload to your site. all uploads all of the files'
  })
}

module.exports = DeployCommand
