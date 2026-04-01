const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
  updateTray: (data) => ipcRenderer.send("update-tray", data)
})
console.log("preload加载了")