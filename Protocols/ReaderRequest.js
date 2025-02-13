const Command = {
  Cmd_Err: 0,

  Cmd_Socket_Connect : 11,
  Cmd_Socket_Disconnect : 12,
  
  Cmd_SCard_Establish_Context: 101,
  Cmd_SCard_Reader_List: 102,
  Cmd_SCard_Connect_Card: 103,
  Cmd_SCard_Disconnect_Card: 104, // Return Default Data
  Cmd_SCard_Transmit: 105, // Return Cmd_SCard_Transmit_Data
  Cmd_SCard_GetATR: 106,
  
  Cmd_MI_Get_UID: 201,
  Cmd_MI_Load_Key: 202,
  Cmd_MI_Authentication: 203,
  Cmd_MI_Read_Block: 204,
  Cmd_MI_Write_Block: 205,
  Cmd_MI_Decrement: 206,
  Cmd_MI_Increment: 207,
  Cmd_MI_Restore: 208,
  Cmd_MI_HALT: 209,
};

const Sender = {
  Request : 10,
  Response : 20
}

const Result = {
  Success : 0,
  Default_Fail : 99
}

const ProtocolJSONtoString = (json) => {
  let str = "";
  switch(json.cmd) {
    case Command.Cmd_Socket_Connect : {
      
    }
    break;
  }
}

module.exports = {Command, Sender, Result};
