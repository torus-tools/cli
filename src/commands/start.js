const {Command, flags} = require('@oclif/command')
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('../../webpack.config');

console.log('Starting the dev web server...');
const port = 8080;
const path = require('path');

const options = {
  hot: true,
  open: true
};

const server = new WebpackDevServer(webpack(config), options);

class StartCommand extends Command {
  async run() {
    const {flags} = this.parse(StartCommand)
    //first create the lib directories
    server.listen(port, 'localhost', function (err) {
      if (err) console.log(err);
      console.log('WebpackDevServer listening at localhost:', port);
    });
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
