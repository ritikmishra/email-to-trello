const crypto = require('crypto');
const key = require('./key');
const ct_encoding = 'hex';
const pass_encoding = 'utf8';
const algorithm = 'aes-256-cbc';

function encrypt(pass, cb) {
  var iv = crypto.randomBytes(16);
  key((err, keytext) => {
    if (err) { cb(err, null) }
    else {
      var cipher = crypto.createCipheriv(algorithm, keytext, iv);
      let ciphertext = cipher.update(pass, pass_encoding, ct_encoding);
      console.log(ciphertext)
      ciphertext += cipher.final(ct_encoding)
      console.log(ciphertext)
      cb(null, {text: ciphertext, iv: iv});
    }
  })
}

function decrypt(text, iv, cb) {
  try {
    key((err, keytext) => {
      if(err) {cb(err, null);}
      else {
        var decipher = crypto.createDecipheriv(algorithm, keytext, iv);
        var pass = decipher.update(text, ct_encoding, pass_encoding);
        pass += decipher.final(pass_encoding)
        cb(null, pass);
      }

    })
  } catch (e) {
    cb(e, null);
  }
}

module.exports = {
  encrypt: encrypt,
  decrypt: decrypt
};
