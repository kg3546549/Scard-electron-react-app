import { Command, ProtocolData, Result, Sender } from "@scard/protocols/ReaderRequest";



// export function ReaderCtrl(uuid:string) {
//   const { ipcRenderer } = window.require("electron");

//   console.log(":: Send Main Processor ::");

//   return {
//     SocketConnect: () => {
//       ipcRenderer.send("channel", {
//         cmd:Command.Cmd_Socket_Connect, 
//         uuid:uuid,
//       });
//     },
//     SocektDisconnect: ()=> {
//       ipcRenderer.send("channel", {
//         cmd:Command.Cmd_Socket_Disconnect, 
//         uuid:uuid,
//       });
//     },

//     EstablishContext: () => {
//       ipcRenderer.send("channel", Command.Cmd_SCard_Establish_Context);
//     },
//     ReaderList: () => {
//       ipcRenderer.send("channel", Command.Cmd_SCard_Reader_List);
//     },
//     ConnectCard: () => {
//       ipcRenderer.send("channel", Command.Cmd_SCard_Connect_Card);
//     },

//     MI_Get_UID: () => {
//       ipcRenderer.send("channel", Command.Cmd_MI_Get_UID);
//     },
//   };
// }

export function ReaderControl(cmd:number, uuid:string, data:string[]) {
  // const { ipcRenderer } = window.require("electron");
  const channel = "requestChannel";

  console.log(":: Send Main Processor ::");

  //requestChannel로 로 보내서 백그라운드 프로세스로 보낼 Data
  let requestData:ProtocolData = {
      cmd: cmd,
      sender: Sender.Request,
      msgCnt: 0,
      uuid:uuid,
      result: Result.Default_Fail,
      dataLength: data.length, //TODO : length가 뭔가 이상함
      data: data,
  }

  console.log("request Data");
  console.log(requestData);

  switch(cmd) {
    case Command.Cmd_Socket_Connect : 
    case Command.Cmd_Socket_Disconnect : {

    }
    break;
  }

  window.electron.ipcRenderer.send(channel,requestData);
}
