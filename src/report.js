function getScoreColor(score, threshold){
  let color = "\x1b[31m";    //red by default
  if(score > threshold+10) color = "\x1b[32m"    //green
  else if(score > threshold) color = "\x1b[33m";    //yellow
  return color;
}

function getScore(score, percent, truncate){
  score = Number(score);
  if(truncate || percent) score = score.toFixed(2);
  if(percent) score = score.toString().substr(2,3) + '%';
  let final_score = score;
  return final_score;
}

function getReportItem(caps, i, item, score, color){
  let beginSpace = 6
  let colored = "";
  let reset = "";
  if(color){
    colored=color
    reset="\x1b[0m"
  }
  if(caps) item = item.toUpperCase();
  let remainder = i - beginSpace - 2 - item.length - score.toString().length;
  let line = "|"+ " ".repeat(beginSpace) + item +": "+ colored+ score +reset+ " ".repeat(remainder) + "|\n";
  return line;
}

function getRecommendation(item){
  let colorReset = "\x1b[0m";
  let recommendation = getScoreColor(item.score) + item.title + colorReset+ ": " +item.description;
  return recommendation;
}
function getHeading(title){
  let heading = "| " + " ".repeat((40-title.length)/2) + title.toUpperCase() + " ".repeat((40-title.length)/2) + "|\n";
  return heading;
}

module.exports = {
  getScoreColor,
  getScore,
  getReportItem,
  getRecommendation,
  getHeading
}