const {globalEnv, dotEnv} = require('../lib/setEnv')

globalEnv()
dotEnv()

console.log(process.env)

