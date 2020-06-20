var assert = require('assert');
const TranslateHtml = require('../lib/TranslateHtml');

const htmlInput = '<h1 id="Hello_World0">Hello World</h1>'
const jsonInput = {Hello_World0:'Hola Mundo'}
const expectedHtml = '<h1 id="Hello_World0">Hola Mundo</h1>'

describe('translateHtml', function () {
  describe('html output', function () {
    it('should match the expected html', async function () {
      let response = await TranslateHtml(htmlInput, jsonInput)
      assert.equal(response, expectedHtml)
    });
  });
});