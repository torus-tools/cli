require('dotenv').config();
//var fs = require("fs");
var AWS = require('aws-sdk');
var translate = new AWS.Translate({apiVersion: '2017-07-01'});
//var {createDir, createFile, addVar} = require('./Build');

module.exports = function TranslateLocale(input, filename, from, to, size, callback){
  /* createDir(`locales/${to}`, function(err, data){
    if(err) console.log(err)
    else{
      createFile(`locales/${to}/${filename}.json`, '{}') 
    }
  }); */
  var translation = {}
  let i = 0;
  //console.log(input)
  Object.keys(input).map(function(key, index){
    //if(key === 'a' || key === 'img') copy the object
    var params = {
      SourceLanguageCode: from,
      TargetLanguageCode: to,
      Text: input[key]
    };
    translate.translateText(params, function(err, data) {
      if (err) console.log(err, err.stack); 
      else {
        translation[key] = data.TranslatedText;
        i += 1;
        //loading(i, 'translating your file');
        if(i >= size){
          console.log("")
          callback(null, translation)
        }
      }
    })
  })   
}

/* function loading(x, message){
  var P = ["\\", "|", "/", "-"];
  x &= 3;
  process.stdout.write("\r" + message + ' ' + P[x++]);
} */