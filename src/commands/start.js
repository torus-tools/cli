const {Command, flags} = require('@oclif/command')
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('../../webpack.dev');
const Build = require('arjan-build');
const fs = require('fs');
const path = require('path');
const {createFakeScripts} = require('../scanDir')

const port = 8080;
const options = {
  clientLogLevel: 'silent',
  port: 8080,
  open: true,
};

class StartCommand extends Command {
  async run() {
    const {flags} = this.parse(StartCommand)
    const server = new WebpackDevServer(webpack(config), options);
    createFakeScripts().then(() => {
      server.listen(port, 'localhost', (err) =>{
        if (err) console.log(err);
        console.log('WebpackDevServer listening at localhost:', port);
      });
    })
  }
}

StartCommand.description = `Describe the command here
...
Extra documentation goes here
`

StartCommand.flags = {
  name: flags.string({char: 'n', description: 'name to print'}),
}

module.exports = StartCommand
