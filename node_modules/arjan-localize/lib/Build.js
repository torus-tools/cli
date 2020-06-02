require('dotenv').config();
var fs = require("fs");

let regionSet = [
  "us-east-2",
  "us-east-1",
  "us-west-1",
  "us-west-2",
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

function addVar(file, variable, value, callback){
  let rawdata = fs.readFileSync(`locales/${file}.json`, 'utf8'); 
  obj = JSON.parse(rawdata); 
  obj[variable] = value;
  jsonString = JSON.stringify(obj);
  fs.writeFileSync(`locales/${file}.json`, jsonString);
  if(callback && typeof callback === 'function') callback(null, 'Success');
  else return 'Success';
}

function optionError(err, callback){
  if(callback && typeof callback === 'function') callback(new Error(err))
  else throw new Error(err);
}

function initBuild(region, profile, callback){
  return new Promise((resolve, reject) => {
    let env_file = "";
    createDir('locales').catch(err => reject(err))
    createDir('exports').then(()=> createDir('exports/csv')).catch(err => reject(err))
    if(profile){
      if(/^[a-zA-Z0-9]*$/.test(profile)) env_file += `\nAWS_PROFILE=${profile}`
      else reject("AWS Profile invalid. Only alphanumeric characters accepted. No spaces.");
    }
    if(region){
      if(regionSet.includes(region)) env_file += `\nAWS_REGION=${region}`
      else reject("Invalid AWS region code")
    }
    createFile('./.env', env_file).catch(err => reject(err))
    createFile('./.gitignore', '.env').catch(err => reject(err))
    resolve('Built')
  })
}

 /*  try {
    createDir('locales', function(err, data){
    if(err) console.log(err)
    else console.log(data)
    });
    if(profile){
      if(/^[a-zA-Z0-9]*$/.test(profile)){
        env_file += `\nAWS_PROFILE=${profile}`
      }
      else{
        let err = "AWS Profile invalid. Only alphanumeric characters accepted. No spaces.";
        throw new Error(err);
      }
    }
    if(region){
      if(regionSet.includes(region)){
        env_file += `\nAWS_REGION=${region}`
      }
      else {
        let err = "Invalid AWS region code";
        throw new Error(err)  
      }
    }
    createFile('./.env', env_file, function(err, data){
      if(err) throw new Error(err)
      else {
        //console.log(data)
        createFile('./.gitignore', '.env', function(err, data){
          if(err) throw new Error(err)
          else {
            if(callback && typeof callback === 'function') callback(null, 'Success');
            else return 'Success'
          }
        })
      }
    });
  }
  catch(err){
    optionError(err, callback)
  } */


module.exports = {
  initBuild,
  createDir,
  createFile,
  optionError,
  addVar
}