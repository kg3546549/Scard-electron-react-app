declare module '@scard/protocols/ReaderRequest' {
    export const Command: {
      Cmd_Err: number;

      Cmd_Socket_Connect: number;
      Cmd_Socket_Disconnect: number;

      Cmd_SCard_Establish_Context: number;
      Cmd_SCard_Reader_List: number;
      Cmd_SCard_Connect_Card: number;
      Cmd_SCard_Disconnect_Card: number;
      Cmd_SCard_Transmit: number;
      
      Cmd_MI_Get_UID: number;
      Cmd_MI_Load_Key: number;
      Cmd_MI_Authentication: number;
      Cmd_MI_Read_Block: number;
      Cmd_MI_Write_Block: number;
      Cmd_MI_Decrement: number;
      Cmd_MI_Increment: number;
      Cmd_MI_Restore: number;
      Cmd_MI_HALT: number;
    };
  
    export const Sender: {
      Request: number;
      Response: number;
    };
  
    export const Result: {
      Success: number;
      Default_Fail: number;
    };
  }