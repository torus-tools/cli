require('dotenv').config();
var AWS = require('aws-sdk');
var translate = new AWS.Translate({apiVersion: '2017-07-01'});

module.exports = function TranslateLocale(input, language, translation){
  return new Promise((resolve, reject) => {
    var size = Object.keys(input).length
    var translatedLocale= {}
    let i = 0;
    for(let key in input){
      //if(key === 'a' || key === 'img') copy the object
      var params = {
        SourceLanguageCode: language,
        TargetLanguageCode: translation,
        Text: input[key]
      };
      translate.translateText(params, function(err, data) {
        if (err) reject(err); 
        else {
          translatedLocale[key] = data.TranslatedText;
          i += 1;
          if(i >= size) resolve(translatedLocale)
        }
      })
    }
  })   
}