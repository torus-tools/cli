const {Command, flags} = require('@oclif/command')
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('../webpack_config/webpack.dev');
const Build = require('arjan-build');
const fs = require('fs');
const path = require('path');
const {createFakeScripts} = require('../scanDir')

class StartCommand extends Command {
  async run() {
    const {flags} = this.parse(StartCommand)
    const options = {
      clientLogLevel: 'silent',
      port: flags.port,
      open: true,
    };
    const server = new WebpackDevServer(webpack(config), options);
    createFakeScripts().then(() => {
      server.listen(flags.port, 'localhost', (err) =>{
        if (err) console.log(err);
        console.log('WebpackDevServer listening at localhost:', flags.port);
      });
    })
  }
}

StartCommand.description = `Describe the command here
...
Extra documentation goes here
`

StartCommand.flags = {
  port: flags.string({
    char: 'p',                    
    description: 'number of the desired port',
    default: 8080   
  }), 
}

module.exports = StartCommand
