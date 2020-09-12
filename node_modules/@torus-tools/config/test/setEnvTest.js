const createGlobalConfig = require('../lib/createGlobalConfig')
const setEnv = require('../lib/setEnv')

createGlobalConfig.then(()=>{
  setEnv().then(()=> resolve('all done'))
  .catch(err=>console.log(err))
}).ctach(err=>console.log(err))