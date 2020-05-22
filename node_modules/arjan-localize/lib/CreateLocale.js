const elements = require('./HtmlElements');

module.exports = function CreateLocale(html){
  //read file
  var body = html.split('</head>')[1]
  var size = 0
  let html1 = html
  let locale = {}
  return new Promise((resolve, reject) => {
    for(key of elements){
      let elem = `<${key}`
      if(body.includes(elem)){
        let arr = body.split(elem)
        for(i = 1; i<arr.length; i++){
          let fragment = arr[i];
          let piece = fragment.split(`</${key}>`)[0];
          let attributes = piece.split('>')[0];
          let text = piece.substr(piece.indexOf('>')+1)
          if(text.includes('<br>')) text = text.replace(/<br>/g, '%br%')
          //generate the id
          let id = text.substr(0, 12).replace(/\s/g, '_').replace(`'`, '_').replace(',', '_').replace("(","").replace(")", '_') + size
          let frag = `<${key}` + piece + `</${key}>`
          //if(key === a) save the href attribute url in the links object
          //else if(key === img) save the src attribute url in the images object
          //check if the element has text
          if(text.replace(/\s/g, '').length){
            //check if theres additional tags
            if(text.includes("<")){
              if(text.split("<")[0].replace(/\s/g, '').length){
                //only use the text that is before the additional tags
                let pretext = text.split("<")[0]
                let id = pretext.substr(0, 12).replace(/\s/g, '_').replace(`'`, '_').replace(',', '_').replace("(","").replace(")", '_') + size
                text = text.replace(/%br%/g, '<br>')
                let spanText = text.replace(pretext, `<span id="${id}">${pretext}</span>`)
                let newPiece = piece.replace(text, spanText)
                html1 = html1.replace(piece, newPiece);
                locale[id] = pretext;
                size += 1
              } 
              if(text.substr(text.lastIndexOf('>')+1, text.length).replace(/\s/g, '').length > 1) {
                let posttext = text.substr(text.lastIndexOf('>')+1, text.length)
                let id = posttext.substr(0, 12).replace(/\s/g, '_').replace(`'`, '_').replace(',', '_').replace("(","").replace(")", '_') + size
                text = text.replace(/%br%/g, '<br>')
                let spanText = text.replace(posttext, `<span id="${id}">${posttext}</span>`)
                let newPiece = piece.replace(text, spanText)
                html1 = html1.replace(piece, newPiece);
                locale[id] = posttext;
                size += 1
              } 
            }
            else {
              if(attributes.includes('id="')){
                let preid = attributes.split('id="')[1];
                id = preid.split('"')[0]
                text = text.replace(/%br%/g, '<br>')
                locale[id] = text;
                size +=1
              }
              else {
                let newfrag = `<${key}` + ` id="${id}"` + piece + `</${key}>`
                html1 = html1.replace(frag, newfrag);
                text = text.replace(/%br%/g, '<br>')
                locale[id] = text;
                size += 1
              }
            }       
          } 
        }
      }
    }
   resolve({size:size, locale:locale, html:html1})
  })
}