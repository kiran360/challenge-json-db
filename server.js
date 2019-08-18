const express = require('express')
const bodyParser = require('body-parser')

const api = require('./api')
const middleware = require('./middleware')

const PORT = process.env.PORT || 1337

const app = express()

app.use(bodyParser.json())

app.put('/:studentId/:props(*)', api.putStudent)
app.get('/:studentId/:props(*)', api.getStudent)
app.delete('/:studentId/:props(*)', api.deleteStudent)
app.get('/health', api.getHealth)

app.use(middleware.handleError)
app.use(middleware.notFound)

const server = app.listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
)

if (require.main !== module) {
  module.exports = server
}
