const main = require('./index')

main('output', 'index.html', 8080, .7)
.then(data=> console.log(data))
.catch(err=>console.log(err))