const getProviderSetup = require('./lib/providerSetup')
const awsRegions = require('./lib/awsRegions')
const {createConfig, readConfig} = require('./lib/globalConfig')
const parseConfig = require('./lib/parseConfig')
const {createFile, createDir} = require('./lib/files')

module.exports.getProviderSetup = getProviderSetup
module.exports.awsRegions = awsRegions
module.exports.readGlobalConfig = readConfig
module.exports.createGlobalConfig = createConfig
module.exports.parseConfig = parseConfig
module.exports.createFile = createFile
module.exports.createDir = createDir
