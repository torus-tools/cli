const config = {
  img:true,
  css:true,
  js:true,
  html:false,
  webp:false,
  html_minifier: {
    removeAttributeQuotes: false,
    removeComments: false,
    html5: true,
    minifyJS: false,
    collapseWhitespace: true,
    removeEmptyAttributes: true,
    removeEmptyElements: true
  },
  svgo: {
    plugins: [
      {cleanupAttrs: true},
      {removeDoctype: true},
      {removeXMLProcInst: true},
      {removeComments: true},
      {removeMetadata: true},
      {removeTitle: true},
      {removeDesc: true},
      {removeUselessDefs: true},
      {removeEditorsNSData: true},
      {removeEmptyAttrs: true},
      {removeHiddenElems: true},
      {removeEmptyText: true},
      {removeEmptyContainers: true},
      {removeViewBox: false},
      {cleanupEnableBackground: true},
      {convertStyleToAttrs: true},
      {convertColors: true},
      {convertPathData: true},
      {convertTransform: true},
      {removeUnknownsAndDefaults: true},
      {removeNonInheritableGroupAttrs: true},
      {removeUselessStrokeAndFill: true},
      {removeUnusedNS: true},
      {cleanupIDs: true},
      {cleanupNumericValues: true},
      {moveElemsAttrsToGroup: true},
      {moveGroupAttrsToElems: true},
      {collapseGroups: true},
      {removeRasterImages: false},
      {mergePaths: true},
      {convertShapeToPath: true},
      {sortAttrs: true}
    ]
  }
  /* terser:{
    parse: {},
    compress: {},
    mangle: {
      properties: {}
    },
    output: {},
    sourceMap: {},
    ecma: 2016,
    keep_classnames: false,
    keep_fnames: false,
    ie8: false,
    module: false,
    nameCache: null,
    safari10: false,
    toplevel: false,
    warnings: false,
  } */
}

module.exports = config;
