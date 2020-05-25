const express = require('express')
const app = express()
const port = 8080

app.use(express.static('dep_pack'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))