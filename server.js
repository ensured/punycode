'use strict';
const express = require('express');
const punycode = require('punycode');
const app = express();

// Constants
const PORT = process.env.PORT || 8080;

// middleware to parse request body
app.use(express.urlencoded({ extended: true }));

// serve static files
app.use(express.static('public'));

// route to handle Punycode to Unicode conversion
app.post('/punycode_to_unicode', (req, res) => {
  const punycodeStr = req.body.punycode;
  try {
    const decodedStr = punycode.toUnicode(punycodeStr);
    res.send(decodedStr + `[${decodedStr.length}]`);
  } catch (e) {
    res.send('Invalid Punycode');
  }
});

// route to handle Unicode to Punycode conversion and return the punycode string
app.post('/unicode_to_punycode', (req, res) => {
  const unicodeStr = req.body.unicode;
  try {
    const encodedStr = punycode.toASCII(unicodeStr);
    res.send(encodedStr);
  } catch (e) {
    res.send('Invalid Unicode');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});