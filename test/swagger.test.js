describe('Swagger', function () {
  it('swagger.v0.1.json should be valid json', function (done) {
    // This is redundant because a broken swagger.v0.1.json will break
    // index handler tests too given that it's `require`d
    let swagger = null
    let content = require('fs').readFileSync('./swagger.v0.1.json')
    swagger = JSON.parse(content)
    expect(swagger).to.be.a('object')
    done()
  })
})
