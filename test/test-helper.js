const path = require('path')
const fs = require('fs')
const AWS = require('aws-sdk-mock')

before(function () {
  AWS.mock('S3', 'upload', function (params, options, callback) {
    callback(null, { key: params.Key })
  })
  AWS.mock('S3', 'getObject', function (params, callback) {
    let content = fs.readFileSync(path.join('./test/data', params.Key))
    callback(null, { Body: new Buffer(content) })
  })
})

after(function () {
  AWS.restore('S3')
})

global.expect = require('chai').expect
