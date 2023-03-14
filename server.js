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


// create a function that counts the codepoints from the given unicode
function fancyCount(str) {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.codePointAt(i) > 0xffff) {
      i++;
    }
    count++;
  }
  return count;
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