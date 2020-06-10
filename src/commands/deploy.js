require('dotenv').config()
const AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
const cloudformation = new AWS.CloudFormation({apiVersion: '2010-05-15'});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const acm = new AWS.ACM({apiVersion: '2015-12-08'});

const {Command, flags} = require('@oclif/command');
const {cli} = require('cli-ux');
const Deploy = require('arjan-deploy');
const Build = require('arjan-build')
const fs = require('fs');
const path = require("path");
const open = require('open');



var ignorePaths = {
  "dep_pack": true, //must be ingored.
  "node_modules":true,
  ".git":true,
  ".env":true
}

function delay(ms){
  return new Promise((resolve) => {
    setTimeout(resolve(true), ms)
  })
}

function scanFiles(dir){
  let arrs = [];
  return new Promise(async (resolve, reject) => {
    scanDir(dir, (filePath, stat) => arrs.push(filePath))
    resolve(arrs)
  })
}
function scanDir(currentDirPath, callback) {
  fs.readdirSync(currentDirPath).forEach((name)=>{
    var filePath = path.join(currentDirPath, name);
    var stat = fs.statSync(filePath);
    if(!ignorePaths[filePath]) {
      if (stat.isFile()) callback(filePath, stat);
      else if (stat.isDirectory()) scanDir(filePath, callback)
    }
  });
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
    if(args.action === 'create' || args.action === 'update' || args.action === 'import'){
      cli.action.start('Setting up...')
      console.log('hello')
      await Build.createDir('arjan_config/changesets')
      let url = null;
      let upload = null;
      let newTemplate = await Deploy.generateTemplate(args.domain, flags.index, flags.error, flags.www, flags.cdn, flags.route53, flags.https)
      console.log(newTemplate)
      let temp = {TemplateBody:{}};
      let stackName = args.domain.split('.').join('') + 'Stack';
      let stackId = await Deploy.stackExists(stackName);
      let hostedZoneExists = await Deploy.hostedZoneExists(args.domain);
      if(stackId) temp = await cloudformation.getTemplate({StackName: stackId}).promise().catch(err => console.log(err))
      if(temp.TemplateBody === JSON.stringify(newTemplate.template)) cli.action.stop('No changes detected...')
      else {
        let wait = false;
        cli.action.stop()
        cli.action.start('Generating Template')
        let template = await Deploy.generateTemplate(args.domain, flags.index, flags.error, flags.www, false, flags.route53, false)
        if(template) cli.action.stop()
        if(temp.TemplateBody === JSON.stringify(template.template)) wait = true;
        else {
          cli.action.start(`Deploying ${stackName}. action:${args.action}`)
          let stack = args.action==='import'? await Deploy.deployStack(args.domain, template.template, template.existingResources, true) : await Deploy.deployStack(args.domain, template.template, template.existingResources, false);
          let changeSetObj = stack;
          if(!flags.upload && args.action !== 'create') fileUpload = true;
          changeSetObj['template'] = template.template;
          changeSetObj['existingResources'] = template.existingResources;
          fs.promises.writeFile(`arjan_config/changesets/${stack.changeSetName}.json`, JSON.stringify(changeSetObj));
          let waitAction = 'stackCreateComplete';
          if(stack.action === 'UPDATE') waitAction = 'stackUpdateComplete';
          else if(stack.action === 'IMPORT') waitAction = 'stackImportComplete';
          wait = await cloudformation.waitFor(waitAction, {StackName: stack.name}).promise()
          if(wait) {
            cli.action.stop()
            if(flags.upload){
              var stat = fs.statSync(flags.upload);
              let files = [];
              let dir = null;
              if(flags.upload === '*' || flags.upload === '/') files = await scanFiles('./').catch(err=>console.log(err))
              else if(stat.isFile()) files = [flags.upload]
              else if(stat.isDirectory()) {
                dir = flags.upload;
                files = await scanFiles(flags.upload).catch(err=>console.log(err))
              }
              files.forEach((file, index)=> {
                Deploy.uploadFile(args.domain, file, dir)
                .then(()=> {
                  //console.log(index, files.length)
                  if(index >= files.length-1) {
                    upload = true;
                    if(url) open(url);
                  }
                })
                .catch(err => console.log(err))
              })
            }
            else if(!flags.upload && stack.action === 'CREATE'){
              let fakeIndex = `<!DOCTYPE html><html><body><h1>Hello World</h1></body></html>`;
              let fakeError = `<!DOCTYPE html><html><body><h1>Error</h1></body></html>`;
              let indexParams = {Bucket: args.domain, Key: 'index.html', Body: fakeIndex, ContentType: 'text/html'};
              let errorParams = {Bucket: args.domain, Key: 'error.html', Body: fakeError, ContentType: 'text/html'};
              s3.putObject(errorParams).promise().catch(err => console.log(err))
              s3.putObject(indexParams).promise().then(()=> {
                upload = true
                if(url) open(url)
              }).catch(err => console.log(err))
            }
            if(flags.route53 && !hostedZoneExists){
              wait = false;
              let nameservers = await Deploy.newHostedZone(stackName).catch(err => console.log(err))
              if(nameservers){
                console.log('\nIn your Domain name registrar, change your DNS settings to custom DNS and add the following Nameservers: \n')
                for(let ns of nameservers) console.log("\x1b[32m", ns+'.','\n', "\x1b[0m")
                let answer = await cli.prompt('Have you finished updating your nameservers?')
                if(answer === 'y' || answer === 'Y' || answer === 'yes'|| answer === 'Yes') {
                  wait = true;
                  if(upload && !url) open(`http://${args.domain}`);
                }
                else console.log('Exiting.') //exit the cli
              }
              else console.log('error. no nameservers')
            }
            else if(!flags.route53) {
              url = `http://${args.domain}.s3-website-${process.env.AWS_REGION}.amazonaws.com`;
              console.log(`you may acces your site at ${url}`)
            }
          }
        }
        if(wait && flags.https){
          let certExists = await Deploy.certificateExists()
          let certwait = false;
          let certArn = null;
          if(!certExists){
            cli.action.start('Creating SSL certificate')
            certArn = await Deploy.requestAndValidateCertificate(args.domain, stackName, flags.route53).catch((err) => console.log(err))
            if(certArn) {
              cli.action.stop()
              cli.action.start('Validating certificate. This might take a while')
            }
            certwait = await acm.waitFor('certificateValidated', {CertificateArn:certArn}).promise().catch((err) => console.log(err))
            if(certwait) cli.action.stop('validated')
          }
          else certwait = true
          if(certwait && flags.cdn){
            //check that the cdn doesnt exist
            //REPEATED CODE
            cli.action.start('Deploying the cloudfront distribution')
            let data = await Deploy.generateTemplate(args.domain, flags.index, flags.error, flags.www, flags.cdn, flags.route53, certArn).catch((err) => console.log(err))
            await Deploy.deployStack(args.domain, data.template, data.existingResources, false)
            .then((stack) => {
              cli.action.stop()
              let changeSetObj = stack;
              changeSetObj['template'] = data.template;
              changeSetObj['existingResources'] = data.existingResources;
              fs.promises.writeFile(`arjan_config/changesets/${stack.changeSetName}.json`, JSON.stringify(changeSetObj));
              console.log('Cloudfront distribution in progress. It may take while until the https is reflected in your url...')
              console.log('In the meantime your site is fully functional :)')
            }).catch((err) => console.log(err));
          }
        }
        else if(wait && flags.cdn && !flags.https){
          //check that the cdn doesnt exist
          //REPEATED CODE
          cli.action.start('Deploying the cloudfront distribution')
          Deploy.generateTemplate(args.domain, flags.index, flags.error, flags.www, flags.cdn, flags.route53, flags.https)
          .then((data)=> Deploy.deployStack(args.domain, data.template, data.existingResources, false))
          .then((stack) => {
            cli.action.stop()
            let changeSetObj = stack;
            changeSetObj['template'] = data.template;
            changeSetObj['existingResources'] = data.existingResources;
            fs.promises.writeFile(`arjan_config/changesets/${stack.changeSetName}.json`, JSON.stringify(changeSetObj));
            console.log('Cloudfront distribution in progress.. It may take while...')
            console.log('In the meantime your site is fully functional :)')
          }).catch((err) => console.log(err));
        }
      }
    }
    else if(args.action === 'import'){

    }
    else if(args.action === 'delete'){
      let stackName = args.domain.split('.').join('') + 'Stack';
      cli.action.start('Removing any digital certificates associated to the domain')
      Deploy.deleteCertificate(args.domain).then(data => {
        cli.action.stop();
        console.log("\x1b[33mIf any, please delete all additional route53 records you may have created and not attached to your cloudformation stack", "\x1b[0m");
        cli.action.start(`Deleting ${stackName}`)
        cloudformation.deleteStack({StackName: stackName}).promise()
        .then(()=> {
          cli.action.stop('Success')
          console.log('Your cloudformation stack is being deleted')
        }).catch(err => console.log(err))
      }).catch(err => console.log(err))
    }
  }
}

DeployCommand.description = `Describe the command here
...
Extra documentation goes here
`
DeployCommand.args = [
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
    description: 'name of a specific file or directory to add to your site. To add all files/dirs from your root use / or *'
  })
}

module.exports = DeployCommand
