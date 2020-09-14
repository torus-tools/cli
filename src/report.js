function getScoreColor(score, threshold){
  let color = "\x1b[31m";    //red by default
  if(score > threshold+.1) color = "\x1b[32m"    //green
  else if(score > threshold) color = "\x1b[33m";    //yellow
  return color;
}

function getScore(score, percent, truncate){
  score = Number(score);
  if(truncate || percent) score = score.toFixed(2);
  let scoreString = score.toString().replace('.','')
  if(!score.startsWith(1)) scoreString = scoreString.substr(1)
  if(percent) score = scoreString + '%';
  let final_score = score;
  return final_score;
}

function getReportItem(caps, i, item, score, spacer, color){
  let border = 4
  let colored = "";
  let reset = "";
  if(color){
    colored=color
    reset="\x1b[0m"
  }
  if(caps) item = item.toUpperCase();
  let line = "|"+ " ".repeat(border-1) + item +" "+spacer.repeat(i-(border*2)-item.length-score.toString().length)+" "+ colored+ score +reset+ " ".repeat(border-1) + "|\n";
  return line;
}

function getRecommendation(item, threshold){
  let colorReset = "\x1b[0m";
  let recommendation = getScoreColor(item.score, threshold) + item.title + colorReset+ ": " +item.description;
  return recommendation;
}
function getHeading(title, i){
  let heading = "|" + " ".repeat((i-title.length)/2+1) + title.toUpperCase() + " ".repeat((i-title.length)/2) + "|\n";
  return heading;
}

function blankLine(i){
  return "|" + " ".repeat(i) + "|\n";
}

function sepparator(i){
  return "|" + "-".repeat(i) + "|\n";
}

module.exports = {
  sepparator,
  blankLine,
  getScoreColor,
  getScore,
  getReportItem,
  getRecommendation,
  getHeading
}