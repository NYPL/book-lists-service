const errors = require('./errors')
const VALID_BOOK_LIST_TYPES = (process.env.VALID_BOOK_LIST_TYPES || 'staff-picks').split(',').map((type) => type.trim())

class BookList {

  asJson () {
    return this
  }
}

BookList.from = function (data) {
  let inst = new BookList()
  Object.keys(data).forEach((key) => {
    inst[key] = data[key]
  })

  if (!inst.type || VALID_BOOK_LIST_TYPES.indexOf(inst.type)) throw new errors.BookListValidationError('Invalid book-list type')
  if (!inst.date || !/\d{4}(-\d{2})?/.test(inst.date)) throw new errors.BookListValidationError('Invalid book-list date')

  if (!inst.slug) inst.slug = [inst.type, inst.date].join('/')
  if (!/\w+\/\w+/.test(inst.slug)) throw new errors.BookListValidationError('Invalid book-list slug: ' + inst.slug)

  return inst
}

module.exports = BookList
