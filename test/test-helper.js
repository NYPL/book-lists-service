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
      let localPath = path.join('./test/data/getObject', params.Key)
      let content = fs.readFileSync(localPath)
      callback(null, { Body: Buffer.from(content) })
    } catch (e) {
      // Treat missing fixture as 404
      callback(new NoSuchKeyError())
    }
  })

  AWS.mock('S3', 'listObjects', function (params, callback) {
    let localPath = path.join('./test/data/listObjects', params.Prefix ? `${params.Prefix}.json` : '_all.json')
    let content = fs.readFileSync(localPath)
    callback(null, JSON.parse(content))
  })
})

after(function () {
  AWS.restore('S3')
})

global.expect = require('chai').expect
