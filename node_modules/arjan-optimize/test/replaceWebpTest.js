var assert = require('assert');
const replaceWebp = require('../lib/replaceWebp')

const html = 
`<!DOCTYPE html>
<html lang="en">
  <head>
    </head>
  <body>
<div class="col-md-6 card-col">
  <a href="localize.html">
    <div class="card arjan-localize-card" onmouseover="nodArjan('localize')" onmouseout="removeNod('localize')">
      <div class="card-body text-center">
        <img id="arjan-logo-localize" class="arjan-card-logo" src="img/arjan_localize_logo.svg" alt="Arjan Localize">
        <h2 id="Localize1" class="h1 localize-text pb-3">Localize</h2>
        <p id="Automatic_tr14" class="card-p text-white">Automatic localization and translation of your static sites</p>
      </div>
    </div>
  </a>
</div>
</body>
</html>`

const expected_html = 
`<!DOCTYPE html>
<html lang="en">
  <head>
    </head>
  <body>
<div class="col-md-6 card-col">
  <a href="localize.html">
    <div class="card arjan-localize-card" onmouseover="nodArjan('localize')" onmouseout="removeNod('localize')">
      <div class="card-body text-center">
        <img id="arjan-logo-localize" class="arjan-card-logo" src="img/arjan_localize_logo.svg" alt="Arjan Localize">
        <h2 id="Localize1" class="h1 localize-text pb-3">Localize</h2>
        <p id="Automatic_tr14" class="card-p text-white">Automatic localization and translation of your static sites</p>
      </div>
    </div>
  </a>
</div>
</body>
</html>`

const img_path = "img/test_image.jpeg"
const image = '<img id="test-image" class="test-class" src="img/test_image.jpeg" alt="Test Image">'
const picture = `<picture><source type="image/webp" srcset="img/test_image.webp"><source type="image/jpeg" srcset="img/test_image.jpeg"><img id="test-image" class="test-class" src="img/test_image.jpeg" alt="Test Image"></picture>`


describe('replace pictures', function () {
  describe('compare expected picture for an img', function () {
    it('should match the expected html', async function () {
      let response = await replaceWebp([img_path], image)
      assert.equal(response, picture)
    });
  });
  describe('compare expected html with picture', function () {
    it('should match the expected html', async function () {
      let response = await replaceWebp([img_path], html)
      assert.equal(response, expected_html)
    });
  });
});