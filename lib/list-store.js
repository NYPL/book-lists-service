const AWS = require('aws-sdk')
const s3 = new AWS.S3()

/**
 *  Save document to S3 bucket, using data.slug as key
 */
const saveList = (data) => {
  let params = {
    Bucket: process.env.BOOK_LISTS_BUCKET,
    Key: `${data.slug}.json`,
    Body: (new Buffer(JSON.stringify(data, null, 2))).toString('binary')
  }
  let options = { partSize: 10 * 1024 * 1024, queueSize: 1 }
  return new Promise((resolve, reject) => {
    s3.upload(params, options, function (err, data) {
      if (err) return reject(err)
      else return resolve({ slug: data.key })
    })
  })
}

/**
 *  Fetch document from S3 by slug:
 */
const getList = (slug) => {
  let params = {
    Bucket: process.env.BOOK_LISTS_BUCKET,
    Key: `${slug}.json`
  }
  return new Promise((resolve, reject) => {
    s3.getObject(params, function (err, data) {
      if (err) return reject(err)
      else return resolve(data.Body.toString('utf-8'))
    })
  })
}

module.exports = { saveList, getList }
