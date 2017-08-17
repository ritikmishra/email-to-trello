const crypt = require('./crypt');

var iv, text

crypt.encrypt('aaaaaaaaaaaaaaaaa', function(err, data) {
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
