const {createFile, createDir} = require('./lib/files')
const awsRegions = require('./lib/awsRegions')
const getProviderSetup = require('./lib/providerSetup')

const {createConfig, readConfig, parseConfig, getSettings} = require('./lib/globalConfig')
const getProjectConfig = require('./lib/projectConfig')

const {globalEnv, dotEnv} = require('./lib/setEnv') 

module.exports.createFile = createFile
module.exports.createDir = createDir
module.exports.awsRegions = awsRegions

module.exports.getProviderSetup = getProviderSetup

module.exports.createGlobalConfig = createConfig
module.exports.readGlobalConfig = readConfig
module.exports.getGlobalSettings = getSettings

module.exports.getProjectConfig = getProjectConfig

module.exports.setGlobalEnv = globalEnv
module.exports.setDotEnv = dotEnv



