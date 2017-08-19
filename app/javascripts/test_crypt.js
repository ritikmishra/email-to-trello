const crypt = require('./crypt');

var iv, text

crypt.encrypt('less_than_16', function(err, data) {
  if (err) throw err;
  iv = data.iv;
  text = data.text;
  console.log(iv)
  console.log(text)
  console.log('\n')

  crypt.decrypt(text, iv, function(err, data) {
    if(err) throw err;
    console.log(data);
  })
})


crypt.encrypt_promise('c38cce65951ea51f137ac62d6b74b815')
  .then((data) => {
    crypt.decrypt_promise(data.text, data.iv)
      .then(console.log)
      .catch((err) => {throw err})
  })
  .catch((err) => {throw err})
