const crypto = require('crypto');
const os = require('os');
const macaddress = require('macaddress');

function sha512(data)
{
  const hash = crypto.createHash('sha256');

  hash.update(data);
  return hash.digest().slice(0, 32);
}

function giveKey(cb)
{
  // Key is a buffer
  try {
    var OSName = os.type();
    var OSVersion = os.release();
    var CPUModel = os.cpus()[0].model;
    var MACaddress;
    macaddress.one((err, mac) => {
      if (err) { cb(err, null)}
      else {
        MACaddress = mac;
        cb(null, sha512(OSName+OSVersion+CPUModel+MACaddress));
      }
    })
  } catch (e) {
    cb(e, null);
  }
}


module.exports = giveKey;
