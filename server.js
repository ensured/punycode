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

// route to handle Punycode to Unicode conversion
app.post('/punycode_to_unicode', (req, res) => {
  let punycodeStr = req.body.punycode;
  if (punycodeStr.startsWith('xn--')) {
    punycodeStr = punycodeStr.substring(4);
  }
  try {
    const decodedStr = punycode.decode(punycodeStr);
    res.send(decodedStr + `[${decodedStr.length}]`);
  } catch (e) {
    res.send('Invalid Punycode');
  }
});

app.post('/unicode_to_punycode', (req, res) => {
  const unicodeText = req.body.unicode;
  try {
    const punycodeStr = punycode.encode(unicodeText);
    res.send(`xn--${punycodeStr}`);
  } catch (e) {
    res.send('Invalid Unicode');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});