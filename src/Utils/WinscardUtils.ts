import { Command } from "@scard/protocols/ReaderRequest";

export function ReaderCtrl(uuid:string) {
  const { ipcRenderer } = window.require("electron");

  console.log(":: Send Main Processor ::");

  return {
    SocketConnect: () => {
      ipcRenderer.send("channel", {
        cmd:Command.Cmd_Socket_Connect, 
        uuid:uuid,
      });
    },
    SocektDisconnect: ()=> {
      ipcRenderer.send("channel", {
        cmd:Command.Cmd_Socket_Disconnect, 
        uuid:uuid,
      });
    },

    EstablishContext: () => {
      ipcRenderer.send("channel", Command.Cmd_SCard_Establish_Context);
    },
    ReaderList: () => {
      ipcRenderer.send("channel", Command.Cmd_SCard_Reader_List);
    },
    ConnectCard: () => {
      ipcRenderer.send("channel", Command.Cmd_SCard_Connect_Card);
    },

    MI_Get_UID: () => {
      ipcRenderer.send("channel", Command.Cmd_MI_Get_UID);
    },
  };
}