import { Badge, Box, Button, Card, CardBody, CardHeader, Divider, Flex, Grid, GridItem, Heading, Icon, Input, Stack, Text, useToast } from "@chakra-ui/react";
import { useState } from "react";

import { FaPaperPlane, FaXmark } from "react-icons/fa6";
import { ReaderControl } from "../../../Utils/WinscardUtils";
import { Command, ProtocolData } from "@scard/protocols/ReaderRequest";
import { windowsStore } from "process";

function delay(ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


interface transLog {
  request:string,
  response:string
}
const TransactionLogBlock = ({request, response}:transLog) => {
  return (
    <Box>
      <Stack direction={'row'} height={'120px'} p={3} align={"center"}>
        <Divider 
          orientation="vertical" 
          border={"3px solid"} 
          borderRadius={"lg"} 
          colorScheme="blue"
          borderColor={"blue"}
        />
        <Stack direction={'column'} >
          <Text>
            <Badge 
              pr={2} 
              pl={2} 
              mr={1} 
              colorScheme="blue" 
              variant={"solid"} 
              borderRadius={"full"}
            >
              Reader
            </Badge>
            {/* {"00 A4 04 00 0C"} */}
            {request}
          </Text>
          <Text textColor={"green.500"} fontWeight={"bold"} w={"98vh"}>
            <Badge 
              pr={2} 
              pl={2} 
              mr={1} 
              colorScheme="green" 
              variant={"solid"} 
              borderRadius={"full"}
            >
              Card
            </Badge>
            {/* {"90 00"} */}
            {response}
          </Text>
        </Stack>
      </Stack>
    </Box>
  );
}

export const APDUTransmitView = () => {

  const toast = useToast();
  const [transactionLogs, setTransLog] = useState<transLog[]>([]);
  const [APDUInput, setAPDUInput] = useState("");
  const [APDUResult, setAPDUResult] = useState("")
  const [cardType, setCardType] = useState("-");
  const [ATR, setATR] = useState("-");
  const [SAK, setSAK] = useState("-");
  const [UID, setUID] = useState("-");


  window.electron.ipcRenderer.on("channel", (event:any, responseData:ProtocolData)=>{
    switch(responseData.uuid) {
      case "APDUTransmit1" :{
        setAPDUResult( responseData.data[1] );

        let newLog = [...transactionLogs];
        newLog.push({request:responseData.data[0], response:responseData.data[1]});
        setTransLog( newLog );
      }
      break;

      case "APDUTransmit-GetATR" : {
        setATR(responseData.data[0]);
      }
      break;

      case "APDUTransmit-GetUID" : {
        setUID(responseData.data[0]);
      }
      break;


    }

  });

  return (
    <>
      <Grid
        templateColumns={'repeat(10,1fr)'}
        gap={4}
      >
        <GridItem colSpan={7}>
          <Card>
            <CardHeader mb={-5}>
                <Heading size={"sm"}>
                  Transmit
                </Heading>
            </CardHeader>
            <CardBody>
              <Stack direction={"column"}>
                <Text>
                  APDU Command
                </Text>
                <Flex gap={4}>
                  <Input
                    placeholder="Enter APDU Command(hex format)"
                    value={APDUInput}
                    onChange={(e)=>{setAPDUInput(e.target.value)}}
                  >
                    
                  </Input>
                  <Button 
                    leftIcon={<FaPaperPlane/>} 
                    colorScheme="blue"
                    onClick={()=>{

                      if( APDUInput.length < 10 ) {
                        toast({
                          title : "Available Command",
                          description : "Command Length Error",
                          duration : 3000,
                          colorScheme : "red",
                        });
                        return;
                      }

                      if( APDUInput.length % 2 != 0 ) {
                        toast({
                          title : "Available Command",
                          description : "Command Length have to Even",
                          duration : 3000,
                          colorScheme : "red",
                        });
                        return;
                      }
                      
                      ReaderControl(Command.Cmd_SCard_Transmit, "APDUTransmit1", [APDUInput]);

                    }}
                  >
                    Send
                  </Button>

                  <Button 
                    leftIcon={<FaXmark/>}
                    onClick={()=>{
                      setAPDUInput("");
                      setAPDUResult("");
                    }}
                  >
                    Clear
                  </Button>
                </Flex>
                <Text mt={3}>
                  Response
                </Text>
                <Box 
                  bgColor={"gray.100"}
                  minH={"50px"}
                  borderRadius={"md"}
                  // textAlign={"center"}
                  fontWeight={"bold"}
                  alignContent={"center"}
                  p={2}
                >
                  {APDUResult}
                </Box>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem colSpan={3}>
          <Card>
            <CardHeader mb={-5}>
                <Flex justify={"space-between"} align={"center"}>
                  <Heading size={"sm"}>
                    Card Information
                  </Heading>
                  <Button
                    borderRadius={"full"} 
                    colorScheme="blue"
                    onClick={async ()=>{
                      ReaderControl(Command.Cmd_Socket_Connect,"APDUTransmit-SocketConnect", []);
                      await delay(100);
  
                      ReaderControl(Command.Cmd_SCard_Establish_Context,"APDUTransmit-EstablishContext", []);
                      await delay(100);
  
                      ReaderControl(Command.Cmd_SCard_Reader_List,"APDUTransmit-ReaderList", []);
                      await delay(100);
  
                      ReaderControl(Command.Cmd_SCard_Connect_Card,"APDUTransmit-ConnectCard", []);
                      await delay(100);
  
                      ReaderControl(Command.Cmd_SCard_GetATR,"APDUTransmit-GetATR", []);
                      await delay(100);
  
                      ReaderControl(Command.Cmd_MI_Get_UID,"APDUTransmit-GetUID", []);
                    }}
                  >
                    Connect
                  </Button>
                </Flex>
            </CardHeader>
            <CardBody>
              <Stack direction={"column"}>
                <Flex justify={"space-between"}>
                  <Text>
                    Card Type
                  </Text>
                  <Text fontWeight={"bold"}>
                    {cardType}
                  </Text>
                </Flex>

                <Flex justify={"space-between"}>
                  <Text>
                    UID
                  </Text>
                  <Text fontWeight={"bold"}>
                    {UID}
                  </Text>
                </Flex>

                <Flex justify={"space-between"}>
                  <Text>
                    SAK
                  </Text>
                  <Text fontWeight={"bold"}>
                    {SAK}
                  </Text>
                </Flex>

                <Text>
                  ATR
                </Text>
                <Box 
                  bgColor={"gray.100"}
                  minH={"50px"}
                  borderRadius={"md"}
                  // textAlign={"center"}
                  fontWeight={"bold"}
                  alignContent={"center"}
                  p={2}
                >
                  {ATR}
                </Box>
                
              </Stack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem colSpan={7}>
          <Card overflowY="auto" h={"45vh"}>
            <CardHeader mb={-10}>
                <Heading size={"sm"}>
                  <Flex justify={"space-between"}>
                    Transaction Log

                    {transactionLogs.length!=0? <Button 
                      size={"xs"}
                      leftIcon={<FaXmark/>}
                      colorScheme="blue" 
                      borderRadius={"full"}
                      onClick={()=>{
                        setTransLog([]);
                      }}
                    >
                      Clear
                    </Button> : <></> }
                    
                  </Flex>
                </Heading>
            </CardHeader>
            <CardBody>

              
              {
                transactionLogs.map(
                  (value,index)=>(
                      <Box
                        onClick = {()=>{
                          setAPDUInput(value.request);
                        }}
                      >
                        <TransactionLogBlock request={value.request} response={value.response}/>
                      </Box>
                  )
                )  
              }
            </CardBody>
          </Card>
        </GridItem>

        <GridItem colSpan={3}>
          <Card overflowY={"auto"} h={"45vh"}>
            <CardHeader>
              <Heading size={"sm"} mb={-5}>
                Quick Commands
              </Heading>
            </CardHeader>
            <CardBody>
              <Flex direction={"column"} gap={3}>
                <Button
                  onClick={()=>{
                    setAPDUInput("00A40400");
                  }}
                >
                  Select AID (A4)
                </Button>
                <Button
                  onClick={()=>{
                    setAPDUInput("00840000");
                  }}
                >
                  Get Challenge (84)
                </Button>
                <Button
                  onClick={()=>{
                    setAPDUInput("00B00000");
                  }}
                >
                  Read Binary (B0)
                </Button>

                <Button
                  onClick={()=>{
                    setAPDUInput("00B20000");
                  }}
                >
                  Read Record (B2)
                </Button>

                <Button
                  onClick={()=>{
                    setAPDUInput("008A0000");
                  }}
                >
                  Create Session (8A)
                </Button>

                <Button
                  onClick={()=>{
                    setAPDUInput("00820000");
                  }}
                >
                  External Authentication (82)
                </Button>

                <Button
                  onClick={()=>{
                    setAPDUInput("00880000");
                  }}
                >
                  Internal Authentication (88)
                </Button>

              </Flex>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
      </>
  );
}