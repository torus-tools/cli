var assert = require('assert');
const csvToJson = require('../lib/csvToJson');
const csvInput = 'key,en\nHello_World0,"Hello World"\n'
const expectedJson = {Hello_World0:'Hello World'}

describe('csvToJson', function () {
  describe('CSV output', function () {
    it('should match the expected CSV', async function () {
      let response = await csvToJson(csvInput)
      assert.equal(response, JSON.stringify(expectedJson))
    });
  });
});