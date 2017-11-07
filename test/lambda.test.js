const LambdaTester = require('lambda-tester')

const handler = require('../index').handler

// Express opens a bunch of /tmp/server* sockets during tests, so make sure they're closed on exit:
const exitHandler = require('../index').exitHandler
process.on('exit', exitHandler.bind(null, { cleanup: true }))
process.on('SIGINT', exitHandler.bind(null, { exit: true })) // ctrl+c event
process.on('SIGTSTP', exitHandler.bind(null, { exit: true })) // ctrl+v event
process.on('uncaughtException', exitHandler.bind(null, { exit: true }))

describe('Lambda index handler', function () {
  it('should respond with 200 if path valid', function () {
    return LambdaTester(handler)
      .event({
        httpMethod: 'GET',
        path: '/api/v0.1/book-lists/staff-picks/2017-01'
      })
      .expectResult((result) => {
        expect(result.statusCode).to.equal(200)
        let body = JSON.parse(result.body)
        expect(body).to.be.a('object')
        expect(body.slug).to.equal('staff-picks/2017-01')
        return true
      })
  })

  it('should respond with 404 if path points to non-existant resource', function () {
    return LambdaTester(handler)
      .event({
        httpMethod: 'GET',
        path: '/api/v0.1/book-lists/staff-picks/2017-13'
      })
      .expectResult((result) => {
        expect(result.statusCode).to.equal(404)
        let body = JSON.parse(result.body)
        expect(body).to.be.a('object')
      })
  })

  it('should respond with 200 if POST valid', function () {
    return LambdaTester(handler)
      .event({
        httpMethod: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        path: '/api/v0.1/book-lists',
        body: JSON.stringify({
          type: 'staff-picks',
          date: '2018-06',
          picks: []
        })
      })
      .expectResult((result) => {
        expect(result.statusCode).to.equal(200)
        let body = JSON.parse(result.body)
        expect(body).to.be.a('object')
        expect(body.slug).to.equal('staff-picks/2018-06')
      })
  })
})
