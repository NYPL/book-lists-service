const express = require('express')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json({ limit: '10mb' }))
app.use(awsServerlessExpressMiddleware.eventContext())

const config = require('./lib/config')
const errors = require('./lib/errors')
const logger = require('./lib/logger')
const listStore = require('./lib/list-store')
const BookList = require('./lib/book-list')

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  app.baseUrl = `http${req.secure ? 's' : ''}://${req.headers.host}/api/v0.1/book-lists`
  next()
})

/**
 *  Handle GET /book-lists/{type}/{date}
 */
app.get('/api/v0.1/book-lists/:type/:date', (req, res) => {
  parseParams(req.params).then((params) => {
    // This slug pattern is a best guess for now:
    let slug = `${params.type}/${params.date}`
    // Fetch document from store (s3) and send to callback:
    return listStore.getList(slug).then((data) => {
      data['@context'] = `${app.baseUrl}/context.json`
      res.json(data)
    })
  })
    .catch((e) => handleError(e, req, res))
})

/**
 *  Handle GETs on /book-lists
 *
 *  Optional params:
 *   - `per_page`: {integer} Number of results to return
 *   - `from_slug`: {string} For pagination, returns matches *after* this slug
 *   - `type`: {string} Filter on list type (e.g. kids, teens, staff-picks)
 */
app.get('/api/v0.1/book-lists', (req, res) => {
  parseParams(req.query).then((params) => {
    let options = { filter: {} }
    if (params.per_page) options.perPage = params.per_page
    if (params.from_slug) options.fromSlug = params.from_slug
    if (params.type) options.filter.type = params.type

    listStore.getAllLists(options)
      .then((data) => {
        data['@context'] = `${app.baseUrl}/context.json`
        res.json(data)
      })
  })
    .catch((e) => handleError(e, req, res))
})

/**
 *  Handle POSTs on /book-lists
 */
app.post('/api/v0.1/book-lists', (req, res) => {
  let list = null
  try {
    list = BookList.from(req.body)
  } catch (e) {
    return handleError(e, req, res)
  }
  listStore.saveList(list).then((data) => {
    data['@context'] = `${app.baseUrl}/context.json`
    res.json(data)
  })
    .catch((e) => handleError(e, req, res))
})

/**
 * Param parse Integer
 *
 * @throws {InvalidParameterError} if empty/invalid
 */
let parseIntParam = (value) => {
  if (!/\d+/.test(value)) throw new errors.InvalidParameterError('Invalid integer value')
  return parseInt(value)
}

/**
 * Param parse from range of valid values
 *
 * @throws {InvalidParameterError} if not found in range
 */
let parseEnumParam = (value, range) => {
  if (range.indexOf(value) < 0) throw new errors.InvalidParameterError(`Value not in range: ${range.join(', ')}`)
  return value
}

/**
 * Param parse date
 *
 * @throws {InvalidParameterError} if not valid
 */
let parseDateParam = (value, range) => {
  if (!/^\d{4}(-\d+){0,2}$/.test(value)) throw new errors.InvalidParameterError('Invalid date value')
  return value
}

/**
 * Parse common query params. Given a hash of values (presumably req.query),
 *
 * @returns {hash} Lookup composed of valid keys mapped to parsed values
 */
function parseParams (params) {
  return new Promise((resolve, reject) => {
    let result = Object.keys(params).reduce((result, param) => {
      let value = null
      try {
        switch (param) {
          case 'per_page':
            value = parseIntParam(params[param])
            break
          case 'type':
            value = parseEnumParam(params[param], config.VALID_BOOK_LIST_TYPES)
            break
          case 'date':
            value = parseDateParam(params[param])
            break
          case 'from_slug':
            value = params[param]
        }
      } catch (e) {
        reject(new errors.InvalidParameterError(`Error parsing '${param}' param: ${e.message}`))
      }
      if (value) result[param] = value
      return result
    }, {})
    resolve(result)
  })
}

/**
 * General error handling. Writes error to response in consistent way
 */
function handleError (error, req, res) {
  let status = null

  res.set('Content-Type', 'application/json')
  switch (error.name) {
    case 'InvalidParameterError':
      status = 400
      break
    case 'NotFoundError':
      status = 404
      break
    default:
      status = 500
  }

  // Log to error if status >= 500, otherwise log to info (because it's probably an input error)
  let appropriateLogLevel = status < 500 ? logger.info : logger.error
  appropriateLogLevel('Error processing request', { error: error.message, path: req.path, params: req.params, query: req.query })

  return res.status(status).send({ statusCode: status, error: error.message, errorCode: error.name })
}

/**
 * Serve swagger file:
 */
const swaggerDocs = require('./swagger.v0.1.json')
app.get('/docs/book-lists', function (req, res) {
  res.send(swaggerDocs)
})

/**
 * Serve context.json:
 */
const contextJson = require('./context.json')
app.get('/api/v0.1/book-lists/context.json', function (req, res) {
  res.send(contextJson)
})

module.exports = app
