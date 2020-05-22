# Arjan Translate

Arjan translate is a localization and translation solution for static websites that works on any html single page or multipage site. It autamitacally creates json locale files for each of your site's versions and it uses AWS's neural machine translation service to render translations in up to 54 different languages. for more info. check out [AWS tarnslate](https://aws.amazon.com/translate/details/)

## Pre-requisites
1. You must have an AWS account and an IAM user with programatic access
2. You must have a local profile for your IAM user. 

AWS local profiles are stored in ~/.aws/credentials in mac/linux or in C:\Users\USER_NAME\.aws\credentials in windows. Create/edit this file by runing `sudo nano ~/.aws/credentials` then add the profile keys in the format shown bellow.

    [profilename]
    aws_access_key_id = <YOUR_ACCESS_KEY_ID>
    aws_secret_access_key = <YOUR_SECRET_ACCESS_KEY>

## Installation
`npm i arjan-translations`


## Usage
If you are translating a single page static website, the index file should be named with its language code, for example en.html instead of being called index.html 

For multi page static sites the origin folder should be named with its language code, for example /en 

    const arjanTranslate = require('arjan-translate')

    //REGION is the AWS region of your IAM role ex. 'use-east-1'
    //PROFILE is the name of your desired AWS IAM profile ex. 'deafult'
   
    arjanTranslate.Build('REGION', 'PROFILE', function(err, data){
      if(err) console.log(err)
      else {
        //FROM is the language code of your origin file ex. 'en'
        //TO is the language code of your destination file ex. 'es'
        arjanTranslate.TranslateSite('FROM', 'TO');
      }
    })