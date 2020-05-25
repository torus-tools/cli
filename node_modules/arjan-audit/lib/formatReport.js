const improvements = require('./improvements')
const main_metrics = require('./main_metrics')
const nullable_metrics = [
  "robots-txt",
  "canonical"
]

module.exports = function auditReport(audit, threshhold){
  let formatted = {
    lh5_score:"",
    lh6_score:"",
    main_metrics:{},
    improvements:{}
  }
  //lighthouse 5 score
  formatted.lh5_score = .2*audit["first-contentful-paint"].score + .27*audit["speed-index"].score + .07*audit["first-meaningful-paint"].score + .33*audit["interactive"].score + .13*audit["first-cpu-idle"].score;
  //lighthouse 6 score
  formatted.lh6_score = .15*audit["first-contentful-paint"].score + .15*audit["speed-index"].score + .25*audit["largest-contentful-paint"].score + .15*audit["interactive"].score + .25*audit["total-blocking-time"].score +.05*audit["cumulative-layout-shift"].score;
  //main metrics
  for(let m of main_metrics){
    formatted.main_metrics[m] = {
      title: audit[m].title,
      score: audit[m].score,
      description: audit[m].description
    }
  }
  //improvements
  for(let i of improvements){
    switch(audit[i].scoreDisplayMode){
      case 'binary':
        if(audit[i].score === 0){
          formatted.improvements[i] = {
            title: audit[i].title,
            score: audit[i].score,
            description: audit[i].description,
          }
          if(audit[i].details) formatted.improvements[i].details = audit[i].details
        }
        break;
      case 'numeric':
        if(audit[i].score < threshhold){
          formatted.improvements[i] = {
            title: audit[i].title,
            score: audit[i].score,
            description: audit[i].description,
          }
          if(audit[i].details) formatted.improvements[i].details = audit[i].details
        }
        break;
      default:
        console.log(`ScoreDisplayMode ${audit[i].scoreDisplayMode} cannot be included in improvements`)
    }
  }
  //nullable_metrics
  for(let n of nullable_metrics){
    if(!audit[n].score){
      formatted.improvements[n] = {
        title: audit[n].title,
        score: audit[n].score,
        description: audit[n].description,
      }
    }
  }
  //Custom improvements
  //Largest Contnentful Paint
  formatted.improvements["largest-contentful-paint-element"] = {
    title: audit["largest-contentful-paint-element"].title,
    score: audit["largest-contentful-paint-element"].score,
    displayValue: audit["largest-contentful-paint-element"].displayValue,
    description: audit["largest-contentful-paint-element"].description,
    details: audit["largest-contentful-paint-element"].details
  }
  //Critical Request Chains
  formatted.improvements["critical-request-chains"] = {
    title: audit["critical-request-chains"].title,
    score: audit["critical-request-chains"].score,
    displayValue: audit["critical-request-chains"].displayValue,
    description: audit["critical-request-chains"].description,
    details: audit["critical-request-chains"].details
  }
  //layout shift elements
  if(audit["layout-shift-elements"].score || audit["layout-shift-elements"].numericValue){
    formatted.improvements["layout-shift-elements"] = {
      title: audit["layout-shift-elements"].title,
      score: audit["layout-shift-elements"].score,
      displayValue: audit["layout-shift-elements"].displayValue,
      description: audit["layout-shift-elements"].description,
      details: audit["layout-shift-elements"].details
    }
  }
  return formatted;
}