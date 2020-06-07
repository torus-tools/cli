/* require('dotenv').config();
var fs = require("fs");
var {createDir, createFile} = require('./Build');
var CreateLocale = require('./CreateLocale');
var TranslateLocale = require('./TranslateLocale');
var TranslateHtml = require('./TranslateHtml');

module.exports = function TranslateSite(from, to){
  //create locales directory
  createDir('locales', function(err, data){
    if(err) console.log(err)
    else{
      //create directory for origin locale
      createDir(`locales/${to}`);
      createDir(`locales/${from}`, function(err, data){
        if(err) console.log(err)
        else{
          //translate multipage site 
          if(fs.existsSync(from)){
            if(fs.statSync(from).isDirectory()){
              fs.readdirSync(from).forEach(function(filename){
                if(filename.includes(".html")){
                  let filePath = `${from}/${filename}.html`
                  let name = filename.split[0]
                  let translation = `${to}/${filename}.html`
                  let html = fs.readFileSync(filePath, 'utf8')
                  if(fs.statSync(filePath).isFile()){
                    fs.readFile(filePath, 'utf8', function(err, data){
                      if(err) console.log(err)
                      else {
                        translateFile(data, filePath, translation, name, from, to)
                      }
                    })
                  }
                }
              })
            }
          }
          //translate single page site
          else if(fs.existsSync(`${from}.html`)) {
            let name = from
            let file = `${from}.html`
            let translation = `${to}.html`
            createFile(`locales/${from}/${from}.json`, '{}')
            createFile(`locales/${to}/${to}.json`, '{}')
            let html = fs.readFileSync(file, 'utf8')
            if(fs.statSync(file).isFile()){
              fs.readFile(file, 'utf8', function(err, data){
                if(err) console.log(err)
                else {
                  translateFile(data, file, translation, name, from, to)
                }
              })
            }
          }
          //error no html site to translate
          else {
            let err = 'No html file or directory'
            console.log(err)
            throw new Error(err)
          }
        }
      });
    }
  })
}

function translateFile(html, file, translation, name, from, to){
  CreateLocale(html, name, from, to, function(err, data){
    if(err) console.log(err)
    else{
      var origin_html = data.html;
      fs.promises.writeFile(`locales/${from}/${from}.json`, JSON.stringify(data.locale));
      fs.promises.writeFile(file, origin_html)
      TranslateLocale(data.locale, name, from, to, data.size, function(err, data){
        if(err) console.log(err)
        else{
          fs.promises.writeFile(`locales/${to}/${to}.json`, JSON.stringify(data));
          TranslateHtml(origin_html, data)
          .then((data)=> {
            fs.promises.writeFile(translation, data)
            console.log('All Done!')
          })
          .catch(err => console.log(err))
        }
      })
    }
  })
} */