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

function decimalToHexadecimal(decimal) {
  const hex = decimal.toString(16);
  return hex;
}

// create a function that counts the codepoints from the given unicode
function getCodePointsAndCountOfCodepoints(str) {
  let codepoints = []
  let emojis = []
  for (let i = 0; i < str.length; i++) {
    let emoji
    const codepoint = str.codePointAt(i);
    codepoints.push(decimalToHexadecimal(codepoint));
    const hexCode = decimalToHexadecimal(codepoint);
    const decimalCode = parseInt(hexCode, 16);
    if (hexCode === '200d') {
      emoji = 'zwj (zero width joiner)'
    } 
    else if (hexCode === 'fe0f') {
      emoji = 'vs16 (variation selector-16)'
    }
    else if (hexCode === 'fe0e') {
      emoji = 'vs15 (variation selector-15)'
    }
    else if (hexCode === '200c') {
      emoji = 'zwnj (zero width non-joiner)'
    } else {
      emoji = String.fromCodePoint(decimalCode);
    }
    emojis.push(emoji);
    if (codepoint > 0xFFFF) i++;
  }
  return `<br>[${codepoints.length} codepoints]<br>` + codepoints + `<br>(${emojis})`;
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
      "charLength": getCodePointsAndCountOfCodepoints(decodedStr)
    });
  } catch (e) {
    res.send('Invalid Punycode');
  }
});


app.post('/unicode_to_punycode', (req, res) => {
  const unicodeText = req.body.unicode;
  const count = getCodePointsAndCountOfCodepoints(unicodeText);
  try {
    const punycodeStr = punycode.encode(unicodeText);
    res.send({
      'punycodeStr': `xn--${punycodeStr}`,
      "charLength": count
  });
  } catch (e) {
    res.send('Invalid Unicode');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});