const {scanFolder, copyFile} =  require('./lib/recurse');
const compressImages =  require('./lib/compressImages');
const webP =  require('./lib/webp');
const optimizeConfig = require('./lib/optimizeConfig');
const imgFormats = require('./lib/imgFormats');
// const resizeImages = require('./lib/resizeImages');
//const unusedCss = require('./lib/unusedCss');

module.exports.scanFolder = scanFolder;
module.exports.copyFile = copyFile;
//module.exports.createClassList = unusedCss.createClassList;
//module.exports.findClasses = unusedCss.findClasses
module.exports.optimizeConfig = optimizeConfig;
module.exports.imgFormats = imgFormats;
module.exports.compressImages = compressImages;
module.exports.compressWebp = webP.compress;
module.exports.replaceWebp = webP.replace;
// module.exports.resizeImages = resizeImages;
//module.exports.unusedCss = unusedCss;

