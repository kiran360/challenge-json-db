const tape = require('tape')
const jsonist = require('jsonist')

const port = (process.env.PORT = process.env.PORT || require('get-port-sync')())
const endpoint = `http://localhost:${port}`

const server = require('./server')

tape('health', async function (t) {
  const url = `${endpoint}/health`
  jsonist.get(url, (err, body) => {
    if (err) t.error(err)
    t.ok(body.success, 'should have successful healthcheck')
    t.end()
  })
})

tape('have PUT api that put property to existing student', async function (t) {
  const url = `${endpoint}/student_1/courses/test`
  const data = { attr_1: 'value_1' }
  jsonist.put(url, data, (err, body) => {
    if (err) t.error(err)
    t.ok(body.success, 'sets attribute at given location')
    t.end()
  })
})

tape('have GET api that gets property of existing student', async function (t) {
  const url = `${endpoint}/student_1/courses/test`
  jsonist.get(url, (err, body) => {
    const expectedData = { attr_1: 'value_1' }
    if (err) t.error(err)
    console.log(body.data)
    t.same(body.data, expectedData, 'gets value of attribute at given location')
    t.end()
  })
})

tape('have GET api that gives 404 to non existing student', async function (t) {
  const url = `${endpoint}/student_2/test_props`
  jsonist.get(url, (err, body, res) => {
    if (err) {
      t.error('should not throw error but 404 status code for non existent student')
    }
    t.ok(res.statusCode === 404, 'throws 404 for non existent student')
    t.end()
  })
})

tape('have GET api that gives 404 to non existing property', async function (t) {
  const url = `${endpoint}/student_2/test_props`
  jsonist.get(url, (err, body, res) => {
    if (err) {
      t.error('should not throw error but 404 status code for non existent student')
    }
    t.ok(res.statusCode === 404, 'throws 404 for non existent property of student')
    t.end()
  })
})
tape('have DELETE api that gives 404 to non existing property', async function (t) {
  const url = `${endpoint}/student_1/test_props_nonexsistent`
  jsonist.delete(url, (err, body, res) => {
    if (err) {
      t.error('should not throw error but 404 status code for non existent student')
    }
    t.ok(res.statusCode === 404, 'throws 404 for non existent property of student')
    t.end()
  })
})

tape('have DELETE api that deletes property of existing student', async function (t) {
  const putUrl = `${endpoint}/student_1/courses/delete_test`
  const putValue = { delete_value: 'test_value' }
  /* setting up test data */
  jsonist.put(putUrl, putValue, (err, putBody) => {
    const url = `${endpoint}/student_1/courses/delete_test/delete_value`
    if (err) t.error(err)
    jsonist.delete(url, (err, body) => {
      if (err) t.error(err)
      t.ok(body.success, 'deletes value of attribute at given location')
      t.end()
    })
  })
})

tape('have DELETE api that gives 404 to non existing student', async function (t) {
  const url = `${endpoint}/student_2/test_props`
  jsonist.delete(url, (err, body, res) => {
    if (err) {
      t.error('should not throw error but 404 status code for non existent student')
    }
    t.ok(res.statusCode === 404, 'throws 404 for non existent student')
    t.end()
  })
})

tape('cleanup', function (t) {
  server.close()
  t.end()
})
