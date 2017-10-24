const AWS = require('aws-sdk')
const errors = require('./errors')

/**
 *  Save document to S3 bucket, using data.slug as key
 */
const saveList = (list) => {
  const s3 = new AWS.S3()

  let params = {
    Bucket: process.env.BOOK_LISTS_BUCKET,
    Key: `${list.slug}.json`,
    Body: (new Buffer(JSON.stringify(list.asJson(), null, 2))).toString('binary')
  }
  let options = { partSize: 10 * 1024 * 1024, queueSize: 1 }
  return new Promise((resolve, reject) => {
    s3.upload(params, options, function (err, uploadResponse) {
      if (err) return reject(err)
      else return resolve({ slug: list.slug })
    })
  })
}

/**
 *  Fetch document from S3 by slug:
 */
const getList = (slug, options = {}) => {
  options = Object.assign({
    parseJson: true // By default we parse json
                    // Set to false to return raw string unparsed
  }, options)

  const s3 = new AWS.S3()

  let params = {
    Bucket: process.env.BOOK_LISTS_BUCKET || 'book-lists',
    Key: `${slug}.json`
  }
  return new Promise((resolve, reject) => {
    s3.getObject(params, function (err, data) {
      if (err) {
        if (err.code === 'NoSuchKey') return reject(new errors.NotFoundError(`${slug} not found`))
        else return reject(err)
      }

      // Convert buffer to string:
      data = data.Body.toString('utf-8')
      // Unless overridden, parse as JSON:
      if (options.parseJson) data = JSON.parse(data)

      return resolve(data)
    })
  })
}

module.exports = { saveList, getList }
