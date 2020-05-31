const settings = {
  "html_minifier": {
    "removeAttributeQuotes": false,
    "removeComments": false,
    "html5": true,
    "minifyJS": false,
    "collapseWhitespace": true,
    "removeEmptyAttributes": true,
    "removeEmptyElements": true
  },
  "uglify_js": {
    "parse": {
      "bare_returns": false,
      "html5_comments":true,
      "shebang":true
    },
    "compress": {
      "arguments":true, 
      "assignments":true, 
      "booleans":true,
      "collapse_vars":true,
      "comparisons": true, 
      "conditionals":true, 
      "dead_code":true, 
      "directives":true,
      "drop_console":false, 
      "drop_debugger":true, 
      "evaluate": true,
      "expression": false,
      "functions": true,
      "global_defs": {},
      "hoist_funs" : false,
      "hoist_props": true,
      "hoist_vars": false,
      "if_return": true, 
      "inline": true, 
      "join_vars": true, 
      "keep_fargs": "strict",
      "keep_fnames": false,
      "keep_infinity": false,
      "loops": true,
      "negate_iife": true,
      "objects": true,
      "passes": 1,    
      "properties": true,   
      "pure_funcs": null,      
      "pure_getters": "strict",      
      "reduce_funcs": true,    
      "reduce_vars": true,
      "sequences": true,
      "side_effects": true,
      "strings": true,
      "switches": true,
      "toplevel": false,
      "top_retain": null,
      "typeofs": true,
      "unsafe": false,
      "unsafe_comps": false,      
      "unsafe_Function": false,
      "unsafe_math": false,
      "unsafe_proto": false,
      "unsafe_regexp": false,
      "unsafe_undefined": false,
      "unused": true
    },
    "mangle": {
      "eval":false,
      "keep_fnames":false,
      "reserved":[],
      "toplevel":false,
      "properties": {
        "builtins":false,
        "debug": false,
        "keep_quoted": false,
        "regex": null,
        "reserved":[]
      }
    },
    "output": {
      "ascii_only": false,
      "beautify": true,
      "braces": false,
      "comments": false,
      "indent_level": 4,
      "indent_start": 0,
      "inline_script": true,
      "keep_quoted_props": false,
      "max_line_len": false,
      "preamble": null,
      "preserve_line": false,
      "quote_keys": false,
      "quote_style": 0,
      "semicolons": true,
      "shebang":true,
      "webkit":false,
      "width":80,
      "wrap_iife":false
    },
    "sourceMap": false,
    "nameCache": null,
    "toplevel": false,
    "ie8": false,
    "warnings": false
  },
  "svgo": {
    "plugins": [{
      "cleanupAttrs": true
    }, {
      "removeDoctype": true
    },{
      "removeXMLProcInst": true
    },{
      "removeComments": true
    },{
      "removeMetadata": true
    },{
      "removeTitle": true
    },{
      "removeDesc": true
    },{
      "removeUselessDefs": true
    },{
      "removeEditorsNSData": true
    },{
      "removeEmptyAttrs": true
    },{
      "removeHiddenElems": true
    },{
      "removeEmptyText": true
    },{
      "removeEmptyContainers": true
    },{
      "removeViewBox": false
    },{
      "cleanupEnableBackground": true
    },{
      "convertStyleToAttrs": true
    },{
      "convertColors": true
    },{
      "convertPathData": true
    },{
      "convertTransform": true
    },{
      "removeUnknownsAndDefaults": true
    },{
      "removeNonInheritableGroupAttrs": true
    },{
      "removeUselessStrokeAndFill": true
    },{
      "removeUnusedNS": true
    },{
      "cleanupIDs": true
    },{
      "cleanupNumericValues": true
    },{
      "moveElemsAttrsToGroup": true
    },{
      "moveGroupAttrsToElems": true
    },{
      "collapseGroups": true
    },{
      "removeRasterImages": false
    },{
      "mergePaths": true
    },{
      "convertShapeToPath": true
    },{
      "sortAttrs": true
    }]
  }
}

module.exports = settings;