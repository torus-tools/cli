require('dotenv').config()
const AWS = require('aws-sdk');
const cloudformation = new AWS.CloudFormation({apiVersion: '2010-05-15'});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const acm = new AWS.ACM({apiVersion: '2015-12-08'});
const {Command, flags} = require('@oclif/command');
const {cli} = require('cli-ux');
const Deploy = require('arjan-deploy');
//const Stack = require('torus-stack')
const open = require('open');
const deployStack = require('arjan-deploy/lib/deployStack');
const Listr = require('listr');

function stuff(word){
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(word)
    }, 1000);
  })
}


class StackCommand extends Command {
  async run() {
    const {args, flags} = this.parse(StackCommand)
    if(args.setup){
      if(args.setup === 'dev') flags.bucket = true;
      else if(args.setup === 'test') {
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
    if(args.action === 'delete'){
      //delete the stack
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
      const tasks = new Listr([
        {
          title: 'Setting Up',
          task: (ctx) => stuff(ctx).then((res) => {
            //console.log(res)
            //console.log(ctx)
          })
        },
        {
          title: 'Generating templates',
          task: (ctx) => {
              return new Listr([
                  {
                      title: 'Partial Template',
                      task: () => stuff({partial_template:'hello'}).then(data => {
                          ctx.partial_template = data
                      })
                  },
                  {
                      title: 'Full Template',
                      task: () => stuff({full_template:'hi'}).then(data => {
                        ctx.full_template = data
                    })
                  }
              ], {concurrent: true});
          }
        },
        {
            title: 'Importing existing resources',
            enabled: ctx => ctx.full_template && ctx.full_template.existing_resources,
            task: (ctx) => stuff(ctx).then((res) => {
              //console.log('RES ', res)
              //console.log('CTX ', ctx)
            })
        },
        {
          title: 'Deploying partial stack',
          //enabled: ctx => ctx.full_template.existing_resources,
          task: (ctx, task) => stuff(ctx).then((res) => {
            task.title = `deploying storage bucket ${flags.route53?'and DNS':''}`
            //console.log(res)
            //console.log(ctx)
          })
        },
        {
          title: 'Deploying full stack',
          task: (ctx, task) => stuff(ctx).then((res) => {
            task.title = `deploying CDN, uploading content, updating DNS`
            return new Listr([
              {
                  title: 'Updating Nameservers',
                  task: () => stuff(['1', '2']).then(data => {
                      ctx.nameservers = data
                  })
              },
              {
                  title: 'Uploading Content',
                  task: () => stuff('done')
              },
              {
                title: 'Deploying CDN',
                task: () => {
                  return new Listr([
                    {
                        title: 'Deploying CDN',
                        task: () => stuff('cdn').then(data => {
                            ctx.cdn = true
                        })
                    },
                    {
                        title: 'Creating DNS records',
                        task: () => stuff({full_template:'hi', existing_resources:{"hi":"hello"}}).then(data => {
                          ctx.full_template = data
                      })
                    }
                  ]);
                }
              },
            ], {concurrent: true});
          })
        }
      ]);
      await tasks.run().then(data => console.log(data.nameservers)).catch(err => console.log(err))
    }
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

module.exports = StackCommand

