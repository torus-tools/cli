const {Command, flags} = require('@oclif/command')
var nodemon = require('nodemon');
const chromeLauncher = require('chrome-launcher');

nodemon({
  script: 'app.js',
  ext: 'js json html css'
});

class ServeCommand extends Command {
  async run() {
    const {flags} = this.parse(ServeCommand)
    let chrome = await chromeLauncher.launch({startingUrl: 'http://localhost:8080/index.html'})
    nodemon.on('start', function () {
      console.log('App has started');
    }).on('quit', function () {
      console.log('App has quit');
      process.exit();
    }).on('restart', function (files) {
      chromeLauncher.killAll()
      .then(()=>chromeLauncher.launch({startingUrl: 'http://localhost:8080/index.html'}))
      console.log('App restarted due to: ', files);
      console.log('FILEEEEEEEEEEEEEEEE ', files[0])
    });
  }
}

ServeCommand.description = `Describe the command here
...
Extra documentation goes here
`

ServeCommand.flags = {
  name: flags.string({char: 'n', description: 'name to print'}),
}

module.exports = ServeCommand
