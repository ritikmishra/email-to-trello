
const {app, shell, Menu, BrowserWindow} = require('electron')
const defaultMenu = require('electron-default-menu');

function create_window(filename, title="Preferences", width=720, height=480)
{

  var newWindow = new BrowserWindow({
    width: width,
    height: height
  })
  newWindow.setTitle(title);
  return newWindow.loadURL('file://' + __dirname + '/' + filename)
}

app.on('ready', function () {
  var mainWindow, edit_i

  const template = defaultMenu(app, shell);

  template.find((e, i) => {
    return e.label === "Edit"
  }).submenu.push({
    label: 'Preferences',
    click () { create_window("preferences.html") }
  })


  menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  mainWindow = new BrowserWindow({
    width: 1080,
    height: 720
  })
  mainWindow.setTitle("Email to Trello");
  // mainWindow.webContents.openDevTools()
  return mainWindow.loadURL('file://' + __dirname + '/index.html')
})
