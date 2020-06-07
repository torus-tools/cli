const sharp = require('sharp');
var fs = require('fs');
SVGO = require('svgo');
const img_formats = require('./imgFormats');


module.exports = function compressImage(file, output, imageArr, svgoConfig){
  return new Promise(async (resolve, reject) => {
    svgo = new SVGO(svgoConfig);
    let fileExtension = file.substr(file.lastIndexOf(".")+1)
    //console.log('EXTENSION ', fileExtension)
    if(fileExtension === 'svg'){
      imageArr.push(file)
      let content = await fs.promises.readFile(file, 'utf8')
      let response = await svgo.optimize(content, {path: file}).catch((err) => reject(err))
      fs.promises.writeFile(`${output}/${file}`, response.data)
      .then(()=> {
        let info = fs.statSync(file)
        //console.log(`compressed ${file} using svgo`)
        resolve(info)
      }).catch(err => reject(err));
    }
    else if(img_formats.includes(fileExtension)){
      imageArr.push(file)
      await sharp(file)
        .toFile(`${output}/${file}`)
        .then(data => {
          //console.log(`compressed ${file} using sharp`)
          //console.log(data)
          resolve(data.size)
        }).catch(err => reject(err));
    }
  })
} 







/* else if(fileExtension ==='jpg' || fileExtension ==='jpeg' || fileExtension ==='jfif' || fileExtension ==='pjpeg' || fileExtension ==='pjp'){
        console.log(`Compressing Joint Photographic Expert Group image ${file}`)
        sharp(file)
        .toFile(`output/${filePath}`)
        .then( data => { console.log(`compressed your ${fileExtension}`) })
        .catch( err => { throw new Error(err) });
    }
    else if(fileExtension ==='png'){
        console.log(`Compressing Portable Network Graphics ${file}`)
        sharp(file)
        .toFile(`output/${filePath}`)
        .then( data => { console.log(`compressed your ${fileExtension}`) })
        .catch( err => { throw new Error(err) });
    }
    else if(fileExtension ==='tif' || fileExtension === 'tiff'){
      console.log(`Compressing Tagged Image File Format ${file}`)
        sharp(file)
        .toFile(`output/${filePath}`)
        .then( data => { console.log(`compressed your ${fileExtension} image and saved as webp`) })
        .catch( err => { throw new Error(err) });
    }
    else if(fileExtension ==='gif'){
      console.log(`Compressing Graphics Interchange Format ${file}`)
      sharp(file)
        .toFile(`output/${filePath}`)
        .then( data => { console.log(`compressed your ${fileExtension} image and saved as webp`) })
        .catch( err => { throw new Error(err) });
    }
    else if(fileExtension ==='ico' || fileExtension ==='cur'){
      console.log(`Compressing Microsoft Icon ${file}`)
      sharp(file)
        .toFile(`output/${filePath}`)
        .then( data => { console.log(`compressed your ${fileExtension} image and saved as webp`) })
        .catch( err => { throw new Error(err) });
    }
    else if(fileExtension ==='bmp'){
      console.log(`Compressing 	Bitmap file ${file}`)
      sharp(file)
        .toFile(`output/${filePath}`)
        .then( data => { console.log(`compressed your ${fileExtension} image and saved as webp`) })
        .catch( err => { throw new Error(err) });
    }
    else if(fileExtension ==='apng'){
      console.log(`Compressing Animated Portable Network Graphics ${file}`)
      sharp(file)
        .toFile(`output/${filePath}`)
        .then( data => { console.log(`compressed your ${fileExtension} image and saved as webp`) })
        .catch( err => { throw new Error(err) });
    }
    else if(fileExtension ==='webp'){
      console.log(`Compressing Web Picture format ${file}`)
      sharp(file)
        .toFile(`output/${filePath}`)
        .then( data => { console.log(`compressed your ${fileExtension} image and saved as webp`) })
        .catch( err => { throw new Error(err) });
    } */