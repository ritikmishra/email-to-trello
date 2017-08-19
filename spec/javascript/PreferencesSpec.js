describe("Preferences", function() {
  const prefs = require('../../dist/javascripts/preferences')
  const trelloemail = "trelloemail"
  const email = "email"
  const passwd = "passwd"
  const server = "server"

  it("should be able to save preferences", function() {
    prefs.store_data(trelloemail, email, passwd, server);
    prefs.store_data_promise(trelloemail, email, passwd, server);
  })

  it("should be able to read preferences", function() {
    prefs.read_data(function(err, data){
      expect(err).toBeFalsy();
      expect(data).toBe({
        email: email,
        passwd: passwd,
        server: server,
        trelloemail: trelloemail
      });
    })
  })


})
