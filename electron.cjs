const { app, BrowserWindow, Tray, nativeImage } = require("electron")
const path = require("path")

let tray = null
let win = null

function createWindow() {
  win = new BrowserWindow({
    width: 380,
    height: 520,
    show: false,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(app.getAppPath(), "preload.cjs"), 
    },
  })
  console.log("webPreferences:", win.webContents.getURL())

  win.loadURL("http://localhost:5173")

  win.once("ready-to-show", () => {
    console.log("窗口准备好了")
    setInterval(() => {
      win.webContents.executeJavaScript("document.title").then(title => {
        if (tray) tray.setTitle(title)
      })
    }, 1000)
})
  win.on("blur", () => {
    win.hide()
  })
}

const { ipcMain } = require("electron")

ipcMain.on("update-tray", (event, { time, task }) => {
  tray.setTitle(`🥔 ${time} ${task}`)
})
//添加ipc监听

function createTray() {
  const icon = nativeImage.createFromDataURL(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABQSURBVFhH7c4xAQAgDAQx9l9aJYV0OIDhHCTdp2sBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACA3wMAAP//uMMEBQAAAABJRU5ErkJggg=="
  )
  icon.setTemplateImage(true)
  tray = new Tray(icon)
  tray.setTitle("🥔")
  
  tray.on("click", () => {
    if (win.isVisible()) {
      win.hide()
    } else {
      const { x, y } = tray.getBounds()
      win.setPosition(Math.round(x - 190 + 8), Math.round(y + 8))
      win.show()
    }
  })
}

app.whenReady().then(() => {
  createWindow()
  createTray()
  console.log("appPath:", app.getAppPath())
  console.log("preload路径:", path.join(app.getAppPath(), "preload.cjs"))
})

app.on("window-all-closed", () => {})