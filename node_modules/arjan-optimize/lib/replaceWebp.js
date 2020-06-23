module.exports = function replaceWebp(images, html){
  return new Promise((resolve, reject) => {
    let html2 = html
    for(let i in images){
      let imgPath = images[i]
      if(imgPath.endsWith('jpg')||imgPath.endsWith('jpeg')||imgPath.endsWith('png')){
        if(html.includes(`src="${imgPath}"`)){
          let splife = html.split(`src="${imgPath}"`);
          let img_tag_bgn = splife[0].substr(splife[0].lastIndexOf('<'));
          let img_tag_end = splife[1].substr(0, splife[1].indexOf('>')+1);
          let img_tag = img_tag_bgn + `src="${imgPath}"` + img_tag_end;
          let subPath = imgPath.substr(0, imgPath.lastIndexOf('.'));
          let ext = imgPath.substr(imgPath.lastIndexOf('.')+1);
          //let classes = "";
          //let alt = "";
          let webp_img = subPath + '.webp';
          let webp_tag = `<picture><source type="image/webp" srcset="${webp_img}"><source type="image/${ext}" srcset="${imgPath}">${img_tag}</picture>`
          //console.log("\x1b[31m", img_tag, '\n', webp_tag, "\x1b[0m")
          html2 = html2.replace(img_tag, webp_tag)
        }
      }
      if(i>=images.length-1)resolve(html2)
    }
  })
}

