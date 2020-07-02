const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const express = require('express')
const app = express()
const formatReport = require('./formatReport')
const opts = {chromeFlags: ['--show-paint-rects', '--headless']};

/* function launchChromeAndRunLighthouse(url, opts, config = null) {
  return chromeLauncher.launch({chromeFlags: opts.chromeFlags}).then(chrome => {
    opts.port = chrome.port;
    return lighthouse(url, opts, config).then(results => {
      return chrome.kill().then(() => results.lhr)
    });
  });
} */

const fs = require('fs');
//const log = require('lighthouse-logger');

function createFile(file, contents){
  if(fs.existsSync(file)) return fs.readFileSync(file, 'utf8')
  else {
    fs.writeFileSync(file, contents)
    return contents
  }
}

function createDir(dir){
    if (fs.existsSync(dir)) return false
    else {
      fs.mkdirSync(dir)
      return true
    }
}

async function launchChromeAndRunLighthouse(url) {
    //log.setLevel('info');
    const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
    const options = {output: 'html', port: chrome.port};
    const runnerResult = await lighthouse(url, options);
    // `.report` is the HTML report as a string
    const reportHtml = runnerResult.report;
    //await fs.promises.writeFile('lhreport.html', reportHtml);
    // `.lhr` is the Lighthouse Result as a JS object
    //console.log('Report is done for', runnerResult.lhr.finalUrl);
    //console.log(runnerResult.lhr.categories);
    //console.log(runnerResult.lhr.audits);
    await chrome.kill()
    return {json:runnerResult.lhr, html:reportHtml}
}

module.exports = function runAudit(dir, page, port, threshhold){
  return new Promise((resolve, reject)=> {
    app.use(express.static(dir))
    createDir('./arjan_config/audits')
    let audit_score = JSON.parse(createFile('./arjan_config/audit_scores.json', '{}'))
    let dateString = new Date().toString()
    let report_name = dateString.split("GMT")[0].trim().split(' ').join('_').replace(/:/g,'')
    var server = app.listen(port, () => {
      console.log(`Started server in port ${port}`)
      //for(let p in pages)
      let fileurl = `http://localhost:${port}/${page}`
      launchChromeAndRunLighthouse(fileurl, opts).then(async res => {
        //formatHtmlReport()
        let results = res.json
        //format audits then return formatted audits
        var formatted = formatReport(results.audits, threshhold)
        formatted['performance'] = results.categories.performance.score
        formatted['accesibility'] = results.categories.accessibility.score
        formatted['seo'] = results.categories.seo.score
        formatted['best-practices'] = results.categories['best-practices'].score
        audit_score[report_name] = formatted
        //if p > pages.length
        await fs.promises.writeFile('./arjan_config/audit_scores.json', JSON.stringify(audit_score))
        await fs.promises.writeFile(`./arjan_config/audits/${report_name}.html`, res.html)
        server.close('Closed server in port ' + port)
        resolve(formatted)
      }).catch(err => {
        server.close('Error... Closed server in port ' + port)
        reject(err)
      })
    })
  })
}

//function formatHtmlReport(filePath){
  //extract css from the page
  //create the stylesheet (if it doesnt exist)
  //insert nav link
//}