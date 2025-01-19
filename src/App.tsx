import React, {useState, useEffect} from 'react';
import { io } from "socket.io-client";

import './App.css';

import { ChakraProvider } from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'
import { Winscard_EstablishedContext, Winscard } from './Protocols/winscard';

const { ipcRenderer } = window.require("electron");

function EstablishContext() {
  console.log("Test");
}

function App() {
  const [message, setMessage] = useState("");
  const { ipcRenderer } = window.require("electron");
  const [socket,setSocket] = useState(null);

  useEffect(() => {
    // IPC 이벤트 리스너 등록
    ipcRenderer.on("channel", (event: any, data: string) => {
      setMessage(data); // 받은 메시지를 상태로 설정
    });
  }, [ipcRenderer]);

  function SocketConnect() {
    ipcRenderer.send("channel", "Cmd_SCard_Establish_Context");
  }

  return (
    <ChakraProvider>
      <div className="App">
        {message}
        <header className="App-header">
          <Button onClick={SocketConnect} colorScheme='blue'>
            EstablishContext
          </Button>
        </header>
      </div>
    </ChakraProvider>
  );
}

export default App;
