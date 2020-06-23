var assert = require('assert');
const jsonToCsv = require('../lib/jsonToCsv');
const jsonInput = {Hello_World0:'Hello World'}
const expectedCsv = 'key,en\nHello_World0,"Hello World"\n'

describe('jsonToCsv', function () {
  describe('CSV output', function () {
    it('should match the expected CSV', async function () {
      let response = await jsonToCsv('en', JSON.stringify(jsonInput))
      assert.equal(response, expectedCsv)
    });
  });
});