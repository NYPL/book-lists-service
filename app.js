const express = require('express')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

const errors = require('./lib/errors')
const logger = require('./lib/logger')
const listStore = require('./lib/list-store')
const BookList = require('./lib/book-list')

/**
 *  Handle GET /book-lists/{type}/{date}
 */
app.get('/api/v0.1/book-lists/:type/:date', (req, res) => {
  if (!req.params.type || !req.params.date) {
    let missing = []
    if (!req.params.type) missing.push('type')
    if (!req.params.date) missing.push('date')
    return handleError(new errors.InvalidParameterError(`Missing in path: ${missing.join(', ')}`), req, res)
  } else {
    // This slug pattern is a best guess for now:
    let slug = `${req.params.type}/${req.params.date}`
    // Fetch document from store (s3) and send to callback:
    return listStore.getList(slug).then((data) => {
      res.json(data)
    })
    .catch((e) => handleError(e, req, res))
  }
})

/**
 *  Handle POSTs on /book-lists
 */
app.post('/api/v0.1/book-lists', (req, res) => {
  let list = null
  try {
    list = BookList.from(req.body)
  } catch (e) {
    return handleError(e)
  }
  listStore.saveList(list).then((data) => {
    res.json(data)
  })
  .catch((e) => handleError(e, req, res))
})

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

  logger.error('Error processing request', { error: error.message, path: req.path, params: req.params, query: req.query })

  return res.status(status).send({ statusCode: status, error: error.message, errorCode: error.name })
}

const swaggerDocs = require('./swagger.v0.1.json')

app.get('/docs/book-lists', function (req, res) {
  res.send(swaggerDocs)
})

module.exports = app
