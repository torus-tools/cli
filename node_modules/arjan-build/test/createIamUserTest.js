const {createIamUser} = require('../index');

createIamUser("default", "us-east-1")
.then((data)=> console.log(data))
.catch(err=> console.log(err))