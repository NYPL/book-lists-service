const AWS = require('aws-sdk')

/**
 *  Save document to S3 bucket, using data.slug as key
 */
const saveList = (data) => {
  const s3 = new AWS.S3()

  let params = {
    Bucket: process.env.BOOK_LISTS_BUCKET,
    Key: `${data.slug}.json`,
    Body: (new Buffer(JSON.stringify(data, null, 2))).toString('binary')
  }
  let options = { partSize: 10 * 1024 * 1024, queueSize: 1 }
  return new Promise((resolve, reject) => {
    s3.upload(params, options, function (err, uploadResponse) {
      if (err) return reject(err)
      else return resolve({ slug: data.slug })
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
      if (err) return reject(err)

      // Convert buffer to string:
      data = data.Body.toString('utf-8')
      // Unless overridden, parse as JSON:
      if (options.parseJson) data = JSON.parse(data)

      return resolve(data)
    })
  })
}

module.exports = { saveList, getList }
