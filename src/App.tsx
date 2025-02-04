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
  Textarea,
  Card, CardHeader, CardBody, CardFooter,
  Heading, Grid, GridItem, SimpleGrid, InputGroup, InputRightAddon,Center,
  Text, Input
} from '@chakra-ui/react'

import {Command, Sender, Result, ProtocolData} from "@scard/protocols/ReaderRequest"
 
import Sidebar from './Views/Sidebar';
import {MainView} from './Views/MainView';
import { BrowserRouter } from 'react-router-dom';



function EstablishContext() {
  console.log("Test");
}



function App() {
  const { ipcRenderer } = window.require("electron");
  const [message, setMessage] = useState("");
  const [socket,setSocket] = useState(null);


  const [blocks, setBlocks] = useState(
    [
      ["","","",""],["","","",""],["","","",""],["","","",""],
      ["","","",""],["","","",""],["","","",""],["","","",""],
      ["","","",""],["","","",""],["","","",""],["","","",""],
      ["","","",""],["","","",""],["","","",""],["","","",""],
    ]
  );

  useEffect(() => {
    // IPC 이벤트 리스너 등록
    // ipcRenderer.on("channel", (event: any, data: ProtocolData) => {
    //   setMessage(message+JSON.stringify(data)); // 받은 메시지를 상태로 설정
      
    //   console.log("ipc Channel Received");

    //   switch(data.cmd) {
    //     case Command.Cmd_MI_Read_Block : {
    //       let dataBlock = [...blocks];
    //       let blockNum = parseInt(data.data[0]);

    //       let sector = Math.trunc(blockNum/4);
    //       let listIdx = blockNum-(sector*4)

    //       dataBlock[sector][listIdx] = data.data[1];

    //       console.log(dataBlock[sector]);

    //       setBlocks(dataBlock);
    //     }
    //   }
    //   console.log(data);
    // });

    ipcRenderer.on("action", (event: any, data: Object) => {
      console.log(data);
    });

  }, [ipcRenderer]);

  function SendCommandToIPC(cmd:number) {
    // ipcRenderer.send("channel", cmd);
  }

  function SendDataToAction(data:string[]) {
    console.log(`[Action] [${data[0]}] ${data[1]}`);
    // ipcRenderer.send("action", data);
  }

  return (
    <ChakraProvider>
      <BrowserRouter>
        <Sidebar/>
      </BrowserRouter>
    </ChakraProvider>
  );



  // return (
  //   <ChakraProvider>
  //     <MainView>

  //     </MainView>
      
  //     <div className="App">
        
  //       <Accordion>
  //         <AccordionItem>
  //           <h2>
  //             <AccordionButton>
  //               <Box as='span' flex='1' textAlign='left'>
  //                 카드 연결
  //               </Box>
  //               <AccordionIcon />
  //             </AccordionButton>
  //           </h2>
  //           <AccordionPanel pb={4}>
  //             <Box m={5}>
  //               <ButtonGroup>
  //                 <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_Socket_Connect)}} colorScheme='blue'>
  //                   Socket Connect
  //                 </Button>

  //                 <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_SCard_Establish_Context)}} colorScheme='blue'>
  //                   Establish Context
  //                 </Button>

  //                 <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_SCard_Reader_List)}} colorScheme='blue'>
  //                   Reader List
  //                 </Button>

  //                 <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_SCard_Connect_Card)}} colorScheme='blue'>
  //                   Card Connect
  //                 </Button>

                  

  //               </ButtonGroup>
  //             </Box>
  //           </AccordionPanel>
  //         </AccordionItem>


  //         <AccordionItem>
  //           <h2>
  //             <AccordionButton>
  //               <Box as='span' flex='1' textAlign='left'>
  //                 MIFARE
  //               </Box>
  //               <AccordionIcon />
  //             </AccordionButton>
  //           </h2>
  //           <AccordionPanel pb={4}>
  //             <Box m={5}>
  //               <ButtonGroup>
  //                 <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_MI_Get_UID)}} colorScheme='yellow'>
  //                   Get UID
  //                 </Button>

  //                 <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_MI_Load_Key)}} colorScheme='yellow'>
  //                   Load Key
  //                 </Button>

  //                 <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_MI_Authentication)}} colorScheme='yellow'>
  //                   Authentication
  //                 </Button>

  //                 <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_MI_Read_Block)}} colorScheme='yellow'>
  //                   Read Block
  //                 </Button>

                  

  //               </ButtonGroup>
  //             </Box>
  //           </AccordionPanel>
  //         </AccordionItem>


  //         <AccordionItem>
  //           <h2>
  //             <AccordionButton>
  //               <Box as='span' flex='1' textAlign='left'>
  //                 ISO7816
  //               </Box>
  //               <AccordionIcon />
  //             </AccordionButton>
  //           </h2>
  //           <AccordionPanel pb={4}>
  //             <Box m={5}>
  //               <ButtonGroup>
  //                 <Button size={"sm"} onClick={()=>{
  //                   console.log("Click Cmd MI Get UID")
  //                   SendCommandToIPC(Command.Cmd_MI_Get_UID)
  //                 }} colorScheme='yellow'>
  //                   Get UID
  //                 </Button>

  //                 <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_MI_Load_Key)}} colorScheme='yellow'>
  //                   Load Key
  //                 </Button>

  //                 <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_MI_Authentication)}} colorScheme='yellow'>
  //                   Authentication
  //                 </Button>

  //                 <Button size={"sm"} onClick={()=>{SendCommandToIPC(Command.Cmd_MI_Read_Block)}} colorScheme='yellow'>
  //                   Read Block
  //                 </Button>

                  

  //               </ButtonGroup>
  //             </Box>
  //           </AccordionPanel>
  //         </AccordionItem>

  //         <AccordionItem>
  //           <h2>
  //             <AccordionButton>
              
  //               <Box as='span' flex='1' textAlign='left'>
  //                 MIFARE
  //               </Box>
                
  //               <AccordionIcon />
  //             </AccordionButton>
  //           </h2>
  //           <AccordionPanel pb={4}>
              
  //               <InputGroup alignItems={"center"}>
  //                 <Input placeholder='Key 입력' htmlSize={10} width='auto' />
  //                 <InputRightAddon p={0}> 
  //                   <Button colorScheme='blue'>전체 읽기</Button>
  //                 </InputRightAddon>
  //               </InputGroup>
              
  //             {/* <SimpleGrid templateRows="repeat(4, 1fr)" templateColumns="repeat(4, 1fr)"> */}
  //             <SimpleGrid minChildWidth='270px'>
  //               {blocks.map((block, index) => (
  //                 <ReadBlockComponent key={index} idx={index} data={block} ipc={SendDataToAction} />
  //               ))}
                
  //             </SimpleGrid>
              
  //           </AccordionPanel>
  //         </AccordionItem>


  //       </Accordion>
  //       <Textarea
  //         value={message}
  //       >
          
  //       </Textarea>
  //     </div>
  //   </ChakraProvider>
  // );
}

type ReadBlockProps = {
  idx:number;
  data:string[];
  ipc:(data:string[])=>void;
}

function ReadBlockComponent({idx, data, ipc}:ReadBlockProps) {

  return (
    <GridItem>
      <Box m={2}>
        
        <Card variant={"filled"}>
          <CardHeader>
            <Heading size={"md"}>Sector {idx}</Heading>
          </CardHeader>
          <CardBody p={0}>
            <Card mr={2} ml={2}>
              <Text fontSize='xs'>
                {data[0]}
              </Text>
              <Text fontSize='xs'>
                {data[1]}
              </Text>
              <Text fontSize='xs'>
                {data[2]}
              </Text>
              <Text fontSize='xs'>
                {data[3]}
              </Text>
            </Card>
          </CardBody>
          <CardFooter alignSelf={'center'}>
            <Button 
              colorScheme='green' 
              size={'sm'} 
              onClick={()=>{
                console.log(idx);
                ipc(["ReadBlockBtn",""+idx])
              }}
            >
              읽기
            </Button>
          </CardFooter>
        </Card>
      </Box>
    </GridItem>
  );
}


export default App;

