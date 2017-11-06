const AWS = require('aws-sdk')
const qs = require('qs')
const NodeCache = require('node-cache')

const errors = require('./errors')
const config = require('./config')
const logger = require('./logger')
const BookList = require('./book-list')

// Simple 60s TTL
const cache = new NodeCache({ stdTTL: 60 })

/**
 *  Save document to S3 bucket, using data.slug as key
 */
const saveList = (list) => {
  const s3 = new AWS.S3()

  let params = {
    Bucket: config.BOOK_LISTS_BUCKET,
    Key: `${list.slug}.json`,
    Body: JSON.stringify(list.asJson(), null, 2),
    ContentType: 'application/json;charset=utf-8'
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
    parseJson: true, // By default we parse json
                    // Set to false to return raw string unparsed
    cache: true
  }, options)

  const s3 = new AWS.S3()

  let params = {
    Bucket: process.env.BOOK_LISTS_BUCKET || 'book-lists',
    Key: `${slug}.json`
  }
  return new Promise((resolve, reject) => {
    // Query-string serialization of slug and options should uniquely identify this query:
    let cacheKey = qs.stringify({ slug, options })

    // If cached, return cached data:
    if (options.cache && cache.get(cacheKey)) {
      logger.info('ListStore#getList serving from cache')

      return resolve(cache.get(cacheKey))
    } else {
      logger.info(`ListStore#getList fetching ${params.Key} from S3`)

      s3.getObject(params, function (err, data) {
        if (err) {
          if (err.code === 'NoSuchKey') return reject(new errors.NotFoundError(`${slug} not found`))
          else if (err.code === 'AccessDenied') return reject(new Error(`S3 bucket "${params.Bucket}" either can't be read or doesn't exist: ${err.message}`))
          else return reject(err)
        }

        // Convert buffer to string:
        data = data.Body.toString('utf-8')
        // Unless overridden, parse as JSON:
        if (options.parseJson) data = JSON.parse(data)

        if (options.cache) cache.set(cacheKey, data)

        return resolve(data)
      })
    }
  })
}

/**
 *  Fetch all documents from S3:
 */
const getAllLists = (options = {}) => {
  options = Object.assign({
    fromSlug: null,
    perPage: 20,
    filter: { type: null }
  }, options)

  const s3 = new AWS.S3()

  let params = {
    Bucket: process.env.BOOK_LISTS_BUCKET || 'book-lists',
    MaxKeys: options.perPage
  }
  // Because {type} is the folder, we can filter by type using Prefix:
  if (options.filter && options.filter.type) {
    params.Prefix = options.filter.type
  }
  // Support paginating by key using Marker
  if (options.fromSlug) params.Marker = `${options.fromSlug}.json`

  logger.debug('S3 listObjects', { params })
  return new Promise((resolve, reject) => {
    s3.listObjects(params, function (err, data) {
      if (err) {
        return reject(err)
      }

      let lists = data.Contents
        .map((s3Obj) => {
          let slug = s3Obj.Key.replace(/\.json$/, '')
          let [ type, date ] = slug.split('/')
          let stubData = { type, date, slug }
          return stubData
        })
        .filter((stubData) => config.VALID_BOOK_LIST_TYPES.indexOf(stubData.type) >= 0)
        .filter((stubData) => stubData.date)
        .map(BookList.from)

      return resolve(lists)
    })
  })
}

module.exports = { saveList, getList, getAllLists }
