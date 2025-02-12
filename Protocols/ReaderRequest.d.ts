declare module '@scard/protocols/ReaderRequest' {
    export const Command: {
      Cmd_Err: number = 0;

      Cmd_Socket_Connect: number = 11;
      Cmd_Socket_Disconnect: number = 12;

      Cmd_SCard_Establish_Context: number = 101;
      Cmd_Scard_Release_Context:1001;
      Cmd_SCard_Reader_List: number = 102;
      Cmd_SCard_Connect_Card: number = 103;
      Cmd_SCard_Disconnect_Card: number = 104;
      Cmd_SCard_Transmit: number = 105;
      Cmd_SCard_GetATR:number = 106;
      
      Cmd_MI_Get_UID: number = 201;
      Cmd_MI_Load_Key: number = 202;
      Cmd_MI_Authentication: number = 203;
      Cmd_MI_Read_Block: number = 204;
      Cmd_MI_Write_Block: number = 205;
      Cmd_MI_Decrement: number = 206;
      Cmd_MI_Increment: number = 207;
      Cmd_MI_Restore: number = 208;
      Cmd_MI_HALT: number = 209;
    };
  
    export const Sender: {
      Request: number = 0;
      Response: number = 1;
    };
  
    export const Result: {
      Success: number = 0;

      Socket_AlreadyConnected:number = 11;

      Default_Fail: number = 99;
    };

    export interface ProtocolData {
      cmd: number;
      sender: number;
      msgCnt: number;
      uuid:string;
      result: number;
      dataLength: number;
      data: string[];
    }
  }