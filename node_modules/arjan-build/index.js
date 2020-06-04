const fs = require("fs");

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

function createFile(file, contents){
  return new Promise((resolve, reject) => {
    if(fs.existsSync(file)) fs.promises.readFile(file, 'utf8').then(data => resolve(data)).catch(err => reject(err))
    else {
      fs.promises.writeFile(file, contents)
      .then(() => resolve(contents))
      .catch(err => reject(err))
    }
  })
}

function createDir(dir){
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dir)) resolve(false)
    else {
      fs.promises.mkdir(dir)
      .then(resolve(true))
      .catch(err => reject(err))
    }
  })
}


function initBuild(profile, region){
  return new Promise((resolve, reject) => {
    let env_file = "";
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
    createFile('./.gitignore', '.env').then(() => resolve('Built')).catch(err => reject(err));
  })
}

//adds aws region to config and 
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

module.exports = {
  initBuild,
  createDir,
  createFile,
  createIamUser
}