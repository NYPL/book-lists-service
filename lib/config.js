module.exports = {
  BOOK_LISTS_BUCKET: process.env.BOOK_LISTS_BUCKET || 'book-lists',
  VALID_BOOK_LIST_TYPES: (process.env.VALID_BOOK_LIST_TYPES || 'staff-picks').split(',').map((type) => type.trim())
}
