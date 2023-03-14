'use strict';
const express = require('express');
const punycode = require('punycode/');
const app = express();

// Constants
const PORT = process.env.PORT || 8080;

// middleware to parse req.body.<name>
app.use(express.urlencoded({ extended: true }));

// serve static files
app.use(express.static('public'));

function fancyCount(str){
  return Array.from(str.split(/[\ufe00-\ufe0f]/).join("")).length;
}

// route to handle Punycode to Unicode conversion
app.post('/punycode_to_unicode', (req, res) => {
  let punycodeStr = req.body.punycode;
  if (punycodeStr.startsWith('xn--')) {
    punycodeStr = punycodeStr.substring(4);
  }
  try {
    const decodedStr = punycode.decode(punycodeStr);
    res.send({
      'decodedStr': decodedStr,
      "charLength": `[${fancyCount(decodedStr)}]`
    });
  } catch (e) {
    res.send('Invalid Punycode');
  }
});


app.post('/unicode_to_punycode', (req, res) => {
  const unicodeText = req.body.unicode;
  const count = fancyCount(unicodeText);
  try {
    const punycodeStr = punycode.encode(unicodeText);
    const decodedStr = punycode.decode(punycodeStr);
    res.send({
      'punycodeStr': `xn--${punycodeStr}`,
      "charLength": `[${decodedStr} is ${count} characters long]`});
  } catch (e) {
    res.send('Invalid Unicode');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});