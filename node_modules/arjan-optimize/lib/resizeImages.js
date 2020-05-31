var fs = require('fs')
const sharp = require('sharp');
//first optimize the html.

module.exports = function resizeThumbnails(htmlFile){
  //check if document contains arjan-thumbnail
  let sizes = {
    "sm":{"length":"75", "width":"75"},
    "md":{"length":"125", "width":"125"},
    "lg":{"length":"200", "width":"200"},
  }
  if(htmlFile.includes("arjan-thumbnail")){
    //split into image tags
    let images = htmlFile.split("<img")
    for(let i=1; i<images.length; i++){
      let image = images[i].split(">")[0]
      if(image.includes("class=")){
        let imgClass = image.split("class=")[1].split("")[0]
        let imgSrc = image.split("src=")[1].split("")[0]
        if(imgClass.includes("arjan-thumbnail-")){
          let size = imgClass.split("arjan-thumbnail-")[1].substr(0,2)
          let img = fs.readFileSync(imgSrc)
          if(!imgSrc.includes("https")){
            if(!sizes[size]) throw new Error("invalid thumbnail class. only use the following classes: \narjan-thumbnail-sm \narjan-thumbnail-md \narjan-thumbnail-lg")
            else {
              //resize according to sizes[size] using sharp
            }
          }
        }
      }
    }
  }
}