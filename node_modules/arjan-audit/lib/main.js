const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const express = require('express')
const app = express()
const formatReport = require('./formatReport')
const opts = {chromeFlags: ['--show-paint-rects', '--headless']};

function launchChromeAndRunLighthouse(url, opts, config = null) {
  return chromeLauncher.launch({chromeFlags: opts.chromeFlags}).then(chrome => {
    opts.port = chrome.port;
    return lighthouse(url, opts, config).then(results => {
      return chrome.kill().then(() => results.lhr)
    });
  });
}

module.exports = function main(dir, index, port, threshhold){
  return new Promise((resolve, reject)=> {
    app.use(express.static(dir))
    var server = app.listen(port, () => {
      console.log(`Started server in port ${port}`)
      let fileurl = 'http://localhost:8080/'+index
      launchChromeAndRunLighthouse(fileurl, opts).then(results => {
        //format audits then return formatted audits
        const formatted = formatReport(results.audits, threshhold)
        server.close('Closed server in port ' + port)
        resolve(formatted)
      }).catch(err => {
        server.close('Error... Closed server in port ' + port)
        reject(err)
      })
    })
  })
}