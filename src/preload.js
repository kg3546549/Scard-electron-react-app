// import { contextBridge, ipcRenderer } from "electron";
const {contextBridge, ipcRenderer} = require("electron");

console.log("preload!");

contextBridge.exposeInMainWorld("api", {
    reader: (data) => ipcRenderer.invoke("reader", data),
});