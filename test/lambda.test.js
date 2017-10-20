const LambdaTester = require('lambda-tester')

const handler = require('../index').handler

describe('Lambda index handler', function () {
  it('should respond with if 200', function () {
    return LambdaTester(handler)
      .event({
        httpMethod: 'GET',
        pathParameters: {
          type: 'staff-picks',
          date: '2017-01'
        }
      })
      .expectResult((result) => {
        expect(result.statusCode).to.equal(200)
        let body = JSON.parse(result.body)
        expect(body).to.be.a('object')
        expect(body.slug).to.equal('staff-picks/2017-01')
      })
  })
})
