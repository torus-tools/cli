const {Command, flags} = require('@oclif/command')
const Audit = require('arjan-audit')
const {createFile} = require('arjan-localize')
const {cli} = require('cli-ux');
const defaults = {
  "dir":"./dep_pack",
  "file":"index.html",
  "port":8080,
  "threshold":0.8
}


function getScoreColor(score){
  let color = "\x1b[31m";    //red by default
  if(score > .9) color = "\x1b[32m"    //green
  else if(score > .8) color = "\x1b[33m";    //yellow
  return color;
}
function getReportItem(caps, i, item, score){
  score = Number((score).toFixed(2));
  let colorReset = "\x1b[0m";
  if(caps) item = item.toUpperCase();
  let remainder = i - 8 - item.length - score.toString().length;
  let scoreColor = getScoreColor(score)+score+colorReset;
  let line = "|"+ " ".repeat(6) + item +": "+ scoreColor + " ".repeat(remainder) + "|\n";
  return line;
}
function getRecommendation(item){
  let colorReset = "\x1b[0m";
  let recommendation = getScoreColor(item.score) + item.title + colorReset+ ": " +item.description;
  return recommendation;
}
function getHeading(title){
  let heading = "|" + " ".repeat((40-title.length)/2) + title.toUpperCase() + " ".repeat((40-title.length)/2) + "|\n";
  return heading;
}
function formatReport(audit){
  let i = 40;
  let count = 1;
  let blankLine = "|" + " ".repeat(i) + "|\n";
  let sepparator = "|" + "-".repeat(i) + "|\n";
  let header = sepparator + blankLine + getHeading("audit report") + blankLine;
  let scores = sepparator + blankLine + getReportItem(true, i, 'lighthouse 6 score', audit.lh6_score) + getReportItem(true, i, 'lighthouse 6 score', audit.lh5_score) + blankLine;
  let mainMetrics = sepparator + getHeading("main metrics") + blankLine;
  for(let m in audit.main_metrics) mainMetrics += getReportItem(false, i, audit.main_metrics[m].title, audit.main_metrics[m].score);
  let recommendations = '\nRECOMMENDATIONS\n\n';
  for(let r in audit.improvements){
    recommendations += count+". "+getRecommendation(audit.improvements[r])+'\n\n';
    count += 1;
  }
  let report = recommendations+'\n'+header+scores+mainMetrics+sepparator;
  return report;
}

class AuditCommand extends Command {
  async run() {
    //create the config.json file
    const {flags} = this.parse(AuditCommand)
    let config = await createFile('audit_config.json', JSON.stringify(defaults))
    let config_json = JSON.parse(config)
    //for each flag if not provided check the audit_config.json
    for(let f in AuditCommand.flags){
      if(!flags[f]) flags[f] = config_json[f]
    }
    cli.action.start('Running Lighthouse Audit')
    Audit(flags.dir, flags.file, flags.port, flags.threshold).then(data => {
      //console.log(data)
      console.log(formatReport(data))
      cli.action.stop()
    })
  }
}

AuditCommand.description = `Describe the command here
...
Extra documentation goes here
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
  })
}

module.exports = AuditCommand
