'use strict';
const express = require('express');
const axios = require('axios');
const punycode = require('punycode/');
const app = express();
// Constants
const PORT = process.env.PORT || 8080;
// middleware to parse req.body.<name>
app.use(express.urlencoded({ extended: true }));
// serve static files
app.use(express.static('public'));

async function checkIsHandleAvail(handle) {
  const response = await axios.get('https://bff.handle.me/lookupAddress', {
      headers: {
        'authority': 'bff.handle.me',
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'origin': 'https://handle.me',
        'referer': 'https://handle.me/',
        'sec-ch-ua': '"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Mobile Safari/537.36',
        'x-handle': handle,
      }
  });
  let res_json = await response.data;
  // check if res_json.address exists if not then the handle is available
  if (res_json.address) {
    return false;
  }
  else {
    return true;
  }
}


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
  // checkIsHandleAvail(req.body.unicode);
  if (punycodeStr.startsWith('xn--')) {
    punycodeStr = punycodeStr.substring(4);
  }
  try {
    const decodedStr = punycode.decode(punycodeStr);
    const handleAvail = checkIsHandleAvail(`xn--${punycodeStr}`).then(x => { res.send({
      'decodedStr': `${decodedStr} avail: <a href="https://handle.me/xn--${punycodeStr}">${x}</a>`,
      "charLength": getCodePointsAndCountOfCodepoints(decodedStr)
    });
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
    const handleAvail = checkIsHandleAvail(`xn--${punycodeStr}`).then(x => { res.send({
      'punycodeStr': `xn--${punycodeStr} avail: <a href="https://handle.me/xn--${punycodeStr}">${x}</a>`,
      "charLength": count
    });
  });
    
  } catch (e) {
    res.send('Invalid Unicode');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});