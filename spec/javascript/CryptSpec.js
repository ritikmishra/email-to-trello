describe("Encryption", function() {
  const crypt = require('../../dist/javascripts/crypt')

  it("should handle strings shorter than 16 characters", function() {
    let test_str = "less_than_16"
    crypt.encrypt(test_str, function(err, data)
    {
      console.log(data)
      crypt.decrypt(data.text, data.iv, function(err, data){
        expect(data).toEqual(test_str)
      })
    })
  })

  it("should handle strings longer than 16 characters", function() {
    let test_str = "5c9597f3c8245907ea71a89d9d39d08eb8694d827c0f13f22ed3bc610c19ec15"
    crypt.encrypt(test_str, function(err, data)
    {
      console.log(data)
      crypt.decrypt(data.text, data.iv, function(err, data){
        expect(data).toEqual(test_str)
      })
    })
  })

  it("should handle special characters", function() {
    let test_str = "~!@#$%^&*()`{}[]:;\"'<>?,./_+-=`"
    crypt.encrypt(test_str, function(err, data)
    {
      console.log(data)
      crypt.decrypt(data.text, data.iv, function(err, data){
        expect(data).toEqual(test_str)
      })
    })
  })



})
