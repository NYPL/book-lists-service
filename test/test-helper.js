const path = require('path')
const fs = require('fs')
const AWS = require('aws-sdk-mock')

/**
 * Mocked S3 error: NoSuchKey
 */
class NoSuchKeyError extends Error {
  constructor (message) {
    super()
    this.code = 'NoSuchKey'
  }
}

before(function () {
  AWS.mock('S3', 'upload', function (params, options, callback) {
    callback(null, { key: params.Key })
  })
  AWS.mock('S3', 'getObject', function (params, callback) {
    try {
      let content = fs.readFileSync(path.join('./test/data', params.Key))
      callback(null, { Body: new Buffer(content) })
    } catch (e) {
      // Treat missing fixture as 404
      callback(new NoSuchKeyError())
    }
  })
})

after(function () {
  AWS.restore('S3')
})

global.expect = require('chai').expect
