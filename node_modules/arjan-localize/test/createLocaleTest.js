const createLocale = require('../lib/CreateLocale')
var assert = require('assert');

const htmlInput = '<h1>Hello World</h1>'
const expectedJson = {Hello_World0:'Hello World'}
const expectedHtml = '<h1 id="Hello_World0">Hello World</h1>'

describe('createLocale', function () {
  describe('json output', function () {
    it('should match the expected json', async function () {
      let response = await createLocale(htmlInput)
      assert.equal(JSON.stringify(response.locale), JSON.stringify(expectedJson));
    });
  });
  describe('html output', function () {
    it('should match the expected html', async function () {
      let response = await createLocale(htmlInput)
      assert.equal(response.html, expectedHtml);
    });
  });
});
