const {Command, flags} = require('@oclif/command')
const {createDir, createFile} = require('arjan-build')
const fs = require('fs')
const open = require('open')

const regionSet = [
  "us-east-2",
  "us-east-1",
  "us-west-1",
  "us-west-2",
  "af-south-1",
  "ap-east-1",
  "ap-south-1",
  "ap-northeast-2",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
  "ca-central-1",
  "cn-north-1",
  "cn-northwest-1",
  "eu-central-1",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "eu-north-1",
  "me-south-1",
  "sa-east-1",
  "us-gov-east-1",
  "us-gov-west-1"
];

function initBuild(profile, region){
  return new Promise((resolve, reject) => {
    let env_file = `ROOT=${process.cwd()}\n`;
    if(profile){
      if(/^[+=,.@_\-a-zA-Z0-9]*$/.test(profile)) env_file += `AWS_PROFILE=${profile}`;
      else reject("AWS Profile invalid. Only alphanumeric characters accepted. No spaces.");
    }
    if(region){
      if(regionSet.includes(region)) env_file += `\nAWS_REGION=${region}`;
      else reject("Invalid AWS region code");
    }
    createDir('arjan_config');
    createFile('./.env', env_file).catch(err => reject(err));
    createFile('./.gitignore', '.env').then(() => resolve('done')).catch(err => reject(err));
  })
}

function createIamUser(iamUserName, awsRegion) {
  return new Promise((resolve, reject) => {
    if(/^[+=,.@_\-a-zA-Z0-9]*$/.test(iamUserName)){
      var url = `https://console.aws.amazon.com/iam/home?region=${awsRegion}#/users$new?step=review&accessKey&userNames=${iamUserName}&permissionType=policies&policies=arn:aws:iam::aws:policy%2FAdministratorAccess`;
      if(awsRegion){
        if(regionSet.includes(awsRegion)) resolve(url);
        else reject('Invalid AWS region code')
      }
    }
    else reject('Invalid IAM user name. Only alphanumeric strings with the following special characters: plus (+), equal (=), comma (,), period (.), at (@), underscore (_), and hyphen (-).')
  })
}

class InitCommand extends Command {
  async run() {
    const {flags, args} = this.parse(InitCommand)
    if(flags.global) {
      let url = await createIamUser(args.profile, args.region)
      await open(url)
      console.log('Finish setting up your IAM user in the AWS console then update your local profile with the keys displayed. For more info see https://arjan.tools/en/docs.html')
    }
    else {
      let build = await initBuild(args.profile, args.region)
      console.log(build)
    }
  }
}

InitCommand.description = `Describe the command here
...
Extra documentation goes here
`

InitCommand.args = [
  {
    name: 'profile',
    required: false,
    description: 'AWS Profile',
    default: 'default'
  },
  {
    name: 'region',
    required: false,
    description: 'AWS Region',
    default: 'us-east-1'
  }
]

InitCommand.flags = {
  global: flags.boolean({
    char: 'g',                    
    description: 'Guides you through your first time setup. Including AWS IAM user creation.',        
  }),
}

module.exports = InitCommand
