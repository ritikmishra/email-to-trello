const prefs = require('./preferences');

prefs.read_data((err, data_obj) => {
  for (var key in data_obj) {
    if(data_obj[key] === "") {
      document.getElementById('notif').innerHTML = "One or more of your settings is not filled. Please fix this by going to Edit -> Preferences"
    }
  }
})
