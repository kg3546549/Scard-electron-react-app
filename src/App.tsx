import React, {useState, useEffect} from 'react';


import './App.css';

import { ChakraProvider } from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'
import {Command, Sender, Result} from "@scard/protocols/ReaderRequest"
 

function EstablishContext() {
  console.log("Test");
}

function App() {
  const { ipcRenderer } = window.require("electron");
  const [message, setMessage] = useState("");
  const [socket,setSocket] = useState(null);

  useEffect(() => {
    // IPC 이벤트 리스너 등록
    ipcRenderer.on("channel", (event: any, data: string) => {
      setMessage(data); // 받은 메시지를 상태로 설정
    });
  }, [ipcRenderer]);

  function Cmd_SCard_Reader_List() {

  }

  function Cmd_SCard_Establish_Context() {
    ipcRenderer.send("channel", Command.Cmd_SCard_Establish_Context);
  }

  function SendCommandToIPC(cmd:number) {
    ipcRenderer.send("channel", cmd);
  }

  return (
    <ChakraProvider>
      <div className="App">
        {message}
        <header className="App-header">
          <Button onClick={()=>{SendCommandToIPC(Command.Cmd_Socket_Connect)}} colorScheme='blue'>
            Socket Connect
          </Button>

          <Button onClick={()=>{SendCommandToIPC(Command.Cmd_SCard_Establish_Context)}} colorScheme='blue'>
            EstablishContext
          </Button>

          <Button onClick={Cmd_SCard_Reader_List} colorScheme='blue'>
            ReaderList
          </Button>
        </header>
      </div>
    </ChakraProvider>
  );
}

export default App;
