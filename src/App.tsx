import React, {useState, useEffect} from 'react';


import './App.css';
import { 
  ChakraProvider, 
  Button, 
  ButtonGroup, 
  Box, 
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'

import {Command, Sender, Result} from "@scard/protocols/ReaderRequest"
 

import Sidebar from './Views/Sidebar';

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

  function SendCommandToIPC(cmd:number) {
    ipcRenderer.send("channel", cmd);
  }


  // return (
  //   <>
  //     <Sidebar/>
  //   </>
  // );



  return (
    <ChakraProvider>
      <div className="App">
        
        <Accordion>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box as='span' flex='1' textAlign='left'>
                  카드 연결
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Box m={5}>
                <ButtonGroup>
                  <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_Socket_Connect)}} colorScheme='blue'>
                    Socket Connect
                  </Button>

                  <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_SCard_Establish_Context)}} colorScheme='blue'>
                    Establish Context
                  </Button>

                  <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_SCard_Reader_List)}} colorScheme='blue'>
                    Reader List
                  </Button>

                  <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_SCard_Reader_List)}} colorScheme='blue'>
                    Card Connect
                  </Button>

                  

                </ButtonGroup>
              </Box>
            </AccordionPanel>
          </AccordionItem>


          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box as='span' flex='1' textAlign='left'>
                  MIFARE
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Box m={5}>
                <ButtonGroup>
                  <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_Socket_Connect)}} colorScheme='yellow'>
                    Get UID
                  </Button>

                  <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_SCard_Establish_Context)}} colorScheme='yellow'>
                    Load Key
                  </Button>

                  <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_SCard_Reader_List)}} colorScheme='yellow'>
                    Authentication
                  </Button>

                  <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_SCard_Reader_List)}} colorScheme='yellow'>
                    Read Block
                  </Button>

                  

                </ButtonGroup>
              </Box>
            </AccordionPanel>
          </AccordionItem>


          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box as='span' flex='1' textAlign='left'>
                  ISO7816
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Box m={5}>
                <ButtonGroup>
                  <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_Socket_Connect)}} colorScheme='yellow'>
                    Get UID
                  </Button>

                  <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_SCard_Establish_Context)}} colorScheme='yellow'>
                    Load Key
                  </Button>

                  <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_SCard_Reader_List)}} colorScheme='yellow'>
                    Authentication
                  </Button>

                  <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_SCard_Reader_List)}} colorScheme='yellow'>
                    Read Block
                  </Button>

                  

                </ButtonGroup>
              </Box>
            </AccordionPanel>
          </AccordionItem>

        </Accordion>
      </div>
    </ChakraProvider>
  );
}

export default App;
