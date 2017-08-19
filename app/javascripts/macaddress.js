// macaddress module, promisifyed.
// at least the only bit I care about
const macaddress = require('macaddress');

function one() {
  return new Promise((fulfill, reject) => {
    macaddress.one((error, mac) => {
      if (error) { reject(error); }
      else { fulfill(mac); }
    })
  })
}

module.exports = {
  "one": one
}
