//var fs = require("fs");
const elements = require('./HtmlElements');

module.exports = function TranslateHtml(html, json){
  return new Promise((resolve, reject) => {
    var body = html;
    if(html.includes('</head>')) body = html.split('</head>')[1]
    let html2 = html
    for(key of elements){
      let elem = `<${key}`
      if(body.includes(elem)){
        let arr = body.split(elem)
        for(i = 1; i<arr.length; i++){
          let fragment = arr[i];
          let prepiece = fragment.split(`</${key}>`)[0];
          let piece = prepiece;
          if(piece.includes('<br>')) piece = piece.replace(/<br>/g, '%br%')
          let attributes = piece.split('>')[0];
          let text = piece.substr(piece.indexOf('>')+1)
          let frag = `<${key}` + prepiece + `</${key}>`
          //if(key === a) insert the translated link url href
          //else if(key === img) insert the translated image src
          if(text.replace(/\s/g, '').length){
            if(text.includes("<")){
              if(text.split("<")[0].replace(/\s/g, '').length){
                text = text.split("<")[0]
                if(attributes.includes('id="')){
                  let preid = attributes.split('id="')[1];
                  id = preid.split('"')[0]
                  let translatedpiece = piece.replace(`>${text}`, `>${json[id]}`)
                  let newfrag = `<${key}` + translatedpiece + `</${key}>`
                  html2 = html2.replace(frag, newfrag);
                }
              }
            }
            else {
              if(attributes.includes('id="')){
                let preid = attributes.split('id="')[1];
                id = preid.split('"')[0]
                let translatedpiece = piece.replace(`>${text}`, `>${json[id]}`)
                let newfrag = `<${key}` + translatedpiece + `</${key}>`
                html2 = html2.replace(frag, newfrag);
              }
            }       
          } 
        }
        
      }
    }
    resolve(html2)
  });
}