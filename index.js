const listStore = require('./lib/list-store')

module.exports.handler = (event, context, callback) => {
  /**
   *  Simplest possible handler for GET /booklists/{type}/{date}
   */
  if (event.httpMethod === 'GET') {
    if (event.pathParameters && event.pathParameters.type && event.pathParameters.date) {
      // This slug pattern is a best guess for now:
      let slug = `${event.pathParameters.type}/${event.pathParameters.date}`
      // Fetch document from store (s3) and send to callback:
      listStore.getList(slug).then((data) => {
        callback(null, {
          statusCode: 200,
          body: data
        })
      })
      .catch((e) => {
        // Specially handle 404s (generalized error handling TK)
        if (e.code === 'NoSuchKey') {
          callback(null, {
            statusCode: 404,
            body: JSON.stringify({ error: 'Not found' })
          })
        } else {
          callback(e)
        }
      })
    }

  /**
   *  Simplest possible handler for POSTs
   */
  } else if (event.httpMethod === 'POST') {
    let data = JSON.parse(event.body)
    listStore.saveList(data).then((data) => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(data, null, 2)
      })
    })
    .catch((e) => callback(e))
  }
}
