const {Command, flags} = require('@oclif/command')
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('../../webpack.config');
const Build = require('arjan-build')
const {scanFiles} = require('../scanDir')


console.log('Starting the dev web server...');
const port = 8080;
const path = require('path');

const options = {
  port: 8080,
  open: true
};

function createFakeScripts(){
  return new Promise((resolve, reject) => {
    let files = scanFiles()
    Build.createDir('./lib')
    .then(() => {
      for(let f in files){
        let filename = './lib/'+files[f].substr(0,files[f].lastIndexOf('.')) + '.js'
        Build.createFile(filename, '')
        .then(()=> {
          if(f>=files.length-1)resolve(true)
        }).catch(err => reject(err))
      }
    }).catch(err => reject(err))
  })
}

class StartCommand extends Command {
  async run() {
    const {flags} = this.parse(StartCommand)
    const server = new WebpackDevServer(webpack(config), options);
    createFakeScripts.then(()=> {
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
