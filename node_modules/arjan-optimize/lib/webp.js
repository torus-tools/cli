const sharp = require('sharp');
var fs = require('fs')

function compress(file, output){
  return new Promise((resolve, reject) => {
    //let fileExtension = file.split(".")[1]
    let fileSubPath = file.split(".")[0];
    sharp(file)
    .webp({nearLossless: true, force: true})
    .toFile(`${output}/${fileSubPath}.webp`)
    .then( data => { 
      console.log(`Converted ${file} to webp`)
      //console.log(`compressed your ${fileExtension} image and saved as webp`)
      //console.log(data)
      resolve(file) 
    })
    .catch(err => reject(err));
  })
}

function replace(img, html){
  //scan the html file and find all instances of the image
  return new Promise((resolve, reject) => {
    console.log("\x1b[33m", img, "\x1b[0m")
    if(html.includes(`src="${img}"`)){
      let splife = html.split(`src="${img}"`);
      let img_tag_bgn = splife[0].substr(splife[0].lastIndexOf('<'));
      let img_tag_end = splife[1].substr(0, splife[1].indexOf('>')+1);
      let img_tag = img_tag_bgn + `src="${img}"` + img_tag_end;
      let subPath = img.substr(0, img.lastIndexOf('.'));
      let ext = img.substr(img.lastIndexOf('.'));
      //let classes = "";
      //let alt = "";
      let webp_img = subPath + '.webp';
      let webp_tag = 
      `<picture>
        <source type="image/webp" srcset="${webp_img}">
        <source type="image/${ext}" srcset="${img}">
        ${img_tag}
      </picture>`
      console.log("\x1b[31m", img_tag, '\n', webp_tag, "\x1b[0m")
      let html2 = html.replace(img_tag, webp_tag)
      resolve(html2)
    }
    else {
      //console.log(`image ${img} isnt used in the file ${filePath}`)
      resolve(html)
    }
  })
}

module.exports = {
  compress,
  replace
}
