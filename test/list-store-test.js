const listStore = require('../lib/list-store')

describe('List Store', function () {
  describe('getList', function () {
    it('should return correct object from S3', function () {
      return listStore.getList('staff-picks/2017-01').then(function (result) {
        expect(result).to.be.a('object')
        expect(result.slug).to.equal('staff-picks/2017-01')
      })
    })
  })

  describe('saveList', function () {
    it('should post data to S3', function () {
      return listStore.saveList({ slug: 'staff-picks/2017-01' }).then(function (result) {
        expect(result).to.be.a('object')
        expect(result.slug).to.equal('staff-picks/2017-01')
      })
    })
  })
})
