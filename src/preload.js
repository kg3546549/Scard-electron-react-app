// import { contextBridge, ipcRenderer } from "electron";
const {contextBridge, ipcRenderer} = require("electron");

console.log("preload!");

contextBridge.exposeInMainWorld("api", {
    reader: (data) => ipcRenderer.invoke("reader", data),
    socket: (data) => ipcRenderer.invoke("socket", data),
});

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
      send: (channel, data) => ipcRenderer.send(channel, data),
      invoke: (channel, data) => ipcRenderer.invoke(channel, data),
      on: (channel, listener) => ipcRenderer.on(channel, listener),
      off: (channel, listener) => ipcRenderer.off(channel, listener),
    }
});