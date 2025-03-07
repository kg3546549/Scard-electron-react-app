import { Badge, Box, Button, Card, CardBody, CardHeader, Divider, Flex, Grid, GridItem, Heading, Icon, Input, Stack, Text, useToast } from "@chakra-ui/react";
import { useState } from "react";

import { FaPaperPlane, FaXmark } from "react-icons/fa6";
import { ReaderControl } from "../../../Utils/WinscardUtils";
import { Command, ProtocolData } from "@scard/protocols/ReaderRequest";
import { windowsStore } from "process";

const TransactionLogBlock = () => {


  return (
    <Box>
      <Stack direction={'row'} height={'100px'} p={3} align={"center"}>
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
            {"00 A4 04 00 0C"}
          </Text>
          <Text textColor={"green.500"} fontWeight={"bold"}>
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
            {"90 00"}
          </Text>
        </Stack>
      </Stack>
    </Box>
  );
}

export const APDUTransmitView = () => {

  const toast = useToast();
  const [transactionLogs, setTransLog] = useState([0,0,0,0,0]);
  const [APDUInput, setAPDUInput] = useState("");
  const [APDUResult, setAPDUResult] = useState("")

  window.electron.ipcRenderer.on("channel", (event:any, responseData:ProtocolData)=>{
    switch(responseData.uuid) {
      case "APDUTransmit1" :{

        setAPDUResult( responseData.data[1] );
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
                  <Button borderRadius={"full"} colorScheme="blue">
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
                    ISO14443 A Type
                  </Text>
                </Flex>

                <Flex justify={"space-between"}>
                  <Text>
                    UID
                  </Text>
                  <Text fontWeight={"bold"}>
                    00:11:22:33
                  </Text>
                </Flex>

                <Flex justify={"space-between"}>
                  <Text>
                    SAK
                  </Text>
                  <Text fontWeight={"bold"}>
                    0x28
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
                  3B8F8001804F0CA000000306030001000000006A
                </Box>
                
              </Stack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem colSpan={7}>
          <Card>
            <CardHeader mb={-10}>
                <Heading size={"sm"}>
                  Transaction Log
                </Heading>
            </CardHeader>
            <CardBody>
              <TransactionLogBlock/>
              {
                transactionLogs.map(
                  (value,index)=>(
                    <TransactionLogBlock/>
                  )
                )  
              }
            </CardBody>
          </Card>
        </GridItem>

        <GridItem colSpan={3}>
          <Card>
            <CardHeader>
              <Heading size={"sm"} mb={-5}>
                Quick Commands
              </Heading>
            </CardHeader>
            <CardBody>
              <Flex direction={"column"} gap={3}>
                <Button>
                  Select AID
                </Button>
                <Button>
                  Get Challenge
                </Button>
                <Button>
                  Extra Authentication
                </Button>
                <Button>
                  Read Binary
                </Button>

              </Flex>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
      </>
  );
}