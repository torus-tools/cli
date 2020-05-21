const {Command, flags} = require('@oclif/command');
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
      let newTemplate = await generateTemplate(args.site, flags.index, flags.error, flags.www, flags.cdn, flags.route53, flags.https)
      let temp = {TemplateBody:{}};
      let stackName = args.site.split('.').join('') + 'Stack'
      let stackId = await stackExists(stackName)
      if(stackId) temp = await cloudformation.getTemplate({StackName: stackId}).promise()
      if(temp.TemplateBody === JSON.stringify(newTemplate.template)) console.log('No changes detected...')
      else {
        let template = await generateTemplate(args.site, flags.index, flags.error, flags.www, false, flags.route53, false)
        let wait = false;
        if(temp.TemplateBody === JSON.stringify(template.template)) wait = true;
        else {
          cli.action.start('Deploying your stack')
          let stack = await deployStack(args.site, template.template, template.existingResources, false, false, false, flags.route53)
          let waitAction = 'stackCreateComplete'
          if(stack.action === 'UPDATE') waitAction = 'stackUpdateComplete';
          else if(stack.action === 'IMPORT') waitAction = 'stackImportComplete';
          wait = await cloudformation.waitFor(waitAction, {StackName: stack.name}).promise()
          if(wait) {
            cli.action.stop()
            
            console.log('uploading Dir', 'uploadDir()')
          }
          if(wait && stack.action === 'CREATE') {
            if(flags.route53){
              newHostedZone(stackName).then(data => console.log(data)).catch(err => console.log(err))
              wait = await delay(3000)
            }
            else console.log('you can access your test site at the following url ...')
            //need to write a function to get the propper url of the s3 bucket
          }
        }
        if(wait && flags.https){
          //check that the certificate doesnt exist
          let certArn = await createCertificate(args.site, stackName, flags.route53)
          let wait = await acm.waitFor('certificateValidated', {CertificateArn:certArn}).promise().catch((err) => console.log(err))
          if(wait && flags.cdn){
            //check that the cdn doesnt exist
            let data = await generateTemplate(args.site, flags.index, flags.error, flags.www, flags.cdn, flags.route53, arn).catch((err) => console.log(err))
            await deployStack(args.site, data.template, data.existingResources, false, false, false, flags.route53)
            .then(() => console.log('Creating your cloudfront distribution. It might take while for your url to become https... In the meantime your site is fully functional :)'))
            .catch((err) => console.log(err));
          }
        }
        else if(wait && flags.cdn && !flags.https){
          //check that the cdn doesnt exist
          generateTemplate(args.site, flags.index, flags.error, flags.www, flags.cdn, flags.route53, flags.https)
          .then((data)=> deployStack(args.site, data.template, data.existingResources, false, false, false, flags.route53))
          .then(() => console.log('Creating your cloudfront distribution. It might take while... In the meantime your site is fully functional :)'))
          .catch((err) => console.log(err));
        }
      }
    }
    else if(args.action === 'upload'){
      if(flags.filename) Deploy.uploadFile(args.sitename, flags.filename, flags.cdn)
      else Deploy.uploadSite(args.sitename, flags.filename, flags.cdn)
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
  filename: flags.string({
    char: 'f',
    description: 'name of a specific file you want to upload to your site',
  })
}

module.exports = DeployCommand
