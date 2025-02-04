import { Command } from "@scard/protocols/ReaderRequest";

export function ReaderCtrl() {
  const { ipcRenderer } = window.require("electron");

  console.log("[ipcRenderer]");
  console.log(ipcRenderer);

  return {
    SocketConnect: () => {
      ipcRenderer.send("channel", Command.Cmd_Socket_Connect);
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
