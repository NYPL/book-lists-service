const errors = require('./errors')
const config = require('./config')

class BookList {
  asJson () {
    let hash = this
    return hash
  }
}

BookList.from = function (data) {
  let inst = new BookList()
  Object.keys(data).forEach((key) => {
    inst[key] = data[key]
  })

  if (!inst.type || config.VALID_BOOK_LIST_TYPES.indexOf(inst.type) < 0) throw new errors.BookListValidationError('Invalid book-list type')
  if (!inst.date || !/\d{4}(-\d{2})?/.test(inst.date)) throw new errors.BookListValidationError('Invalid book-list date')

  if (!inst.slug) inst.slug = [inst.type, inst.date].join('/')
  if (!/\w+\/\w+/.test(inst.slug)) throw new errors.BookListValidationError('Invalid book-list slug: ' + inst.slug)

  // Alpha sort picks:
  if (inst.picks) inst.picks = BookList.sortPicks(inst.picks)

  return inst
}

/**
 *  Sort array of picks by book.title:
 */
BookList.sortPicks = (picks) => {
  // Based on request that we peform alpha sort on titles after stripping leading 'a'/'the':
  let titleStripper = (title) => title.replace(/^(a|the) /i, '')
  return picks.sort((p1, p2) => {
    return titleStripper(p1.book.title) > titleStripper(p2.book.title) ? 1 : -1
  })
}

module.exports = BookList
