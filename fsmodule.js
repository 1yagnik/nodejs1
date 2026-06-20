const fs = require('fs')
const path = 'example.text'

const data = fs.readFileSync(path, {encoding:'utf8'})

console.log(data)