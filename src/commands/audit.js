const {Command, flags} = require('@oclif/command')
const Audit = require('arjan-audit')
const {createFile} = require('arjan-build')
const {cli} = require('cli-ux');
const Report = require('../report')

const defaults = {
  "dir":"./",
  "file":"index.html",
  "port":8080,
  "threshold":0.8
}

function formatReport(audit, threshold){
  let i = 40;
  let count = 1;
  let blankLine = "|" + " ".repeat(i) + "|\n";
  let sepparator = "|" + "-".repeat(i) + "|\n";
  let header = sepparator + blankLine + Report.getHeading("audit report") + blankLine;
  let scores = sepparator + blankLine + Report.getReportItem(true, i, 'lighthouse 6 score', Report.getScore(audit.lh6_score, true, true), Report.getScoreColor(audit.lh6_score, threshold)) + Report.getReportItem(true, i, 'lighthouse 5 score', Report.getScore(audit.lh5_score, true, true), Report.getScoreColor(audit.lh5_score, threshold)) + blankLine;
  let mainMetrics = sepparator + Report.getHeading("main metrics") + blankLine;
  for(let m in audit.main_metrics) mainMetrics += Report.getReportItem(false, i, audit.main_metrics[m].title, Report.getScore(audit.main_metrics[m].score, true, true), Report.getScoreColor(audit.main_metrics[m].score, threshold));
  let recommendations = '\nRECOMMENDATIONS\n\n';
  for(let r in audit.improvements){
    recommendations += count+". "+Report.getRecommendation(audit.improvements[r], threshold)+'\n\n';
    count += 1;
  }
  let report = recommendations+'\n'+header+scores+mainMetrics+sepparator;
  return report;
}

class AuditCommand extends Command {
  async run() {
    //create the config.json file
    const {flags} = this.parse(AuditCommand)
    let config = await createFile('arjan_config/audit_config.json', JSON.stringify(defaults))
    let config_json = JSON.parse(config)
    //for each flag if not provided check the arjan_config/audit_config.json file
    for(let f in AuditCommand.flags){
      if(!flags[f]) flags[f] = config_json[f]
    }
    cli.action.start('Running Lighthouse Audit')
    Audit(flags.dir, flags.file, flags.port, flags.threshold).then(data => {
      //console.log(data)
      console.log(formatReport(data, flags.threshold))
      cli.action.stop()
    })
  }
}

AuditCommand.description = `Deploy your static site 
...
Deploy modern static sites to the AWS Cloud using Cloudformation. 
`

AuditCommand.flags = {
  dir: flags.string({
    char: 'd',                    
    description: 'Directory path to serve. default is root (relative to the path in which you run the command)',        
  }),
  file: flags.string({
    char: 'f',                    
    description: 'Path of the page you want to audit. default is index.html',        
  }),
  port: flags.string({
    char: 'p',                    
    description: 'Port used for the test server. Default is 8080.',        
  }),
  threshold: flags.string({
    char: 't',                    
    description: 'Integer value from 0 to 1 that represents what you consider to be an acceptable lighthouse score for your site. Its very similar to what you would consider an acceptable school test grade.',
    default: .8
  })
}

module.exports = AuditCommand
