import React, { ReactNode, useState } from "react";

import {
  Heading,
  Card,
  Flex,
  CardHeader,
  CardBody,
  Stack,
  Box,
  Text,
  Grid,
  GridItem,
  Button,
  SimpleGrid,
  Select,
  Center,
  Input,
  Checkbox,
} from "@chakra-ui/react";

import { FaStop, FaSearch } from "react-icons/fa";

import {} from '@chakra-ui/icons'

import { ReaderControl } from "../../../Utils/WinscardUtils";
import { Command, ProtocolData, Result } from "@scard/protocols/ReaderRequest";

function delay(ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

type SectorCardFunc = {
  sectorData:string[], 
  index:number,
  selected:boolean[],
}

const SectorCard = ({sectorData, index, selected}:SectorCardFunc) => {


  return (
    <Card bg={"#F3F4F6"} 
      border={
        selected[index]?"2px":"0px"
      }
      borderColor={"blue.500"}
    >
      <CardHeader mb={-7}>
        <Heading size={"xs"}> Sector {index} </Heading>
      </CardHeader>
      <CardBody>
        <Stack >
        <Box p={1} bg={"white"} borderRadius={"sm"} textAlign={"center"}>
            {sectorData[0]}
        </Box>
        <Box p={1} bg={"white"} borderRadius={"sm"} textAlign={"center"}>
          {sectorData[1]}
        </Box>
        <Box p={1} bg={"white"} borderRadius={"sm"} textAlign={"center"}>
          {sectorData[2]}
        </Box>
        <Box p={1} bg={"gray.200"} borderRadius={"sm"} textAlign={"center"}>
          {sectorData[3]}
        </Box>
        </Stack>
      </CardBody>
    </Card>
  );
}


export const FullReading = () => {

  const [sectorData, setSectorData] = useState([
    ["","","",""],
    ["","","",""],
    ["","","",""],
    ["","","",""],
    ["","","",""],
    ["","","",""],
    ["","","",""],
    ["","","",""],
    ["","","",""],
    ["","","",""],
    ["","","",""],
    ["","","",""],
    ["","","",""],
    ["","","",""],
    ["","","",""],
    ["","","",""],
  ]);

  const [sectorSelect, setSectorSelect] = useState(
    // [true, true, true, true,true, true, true, true,true, true, true, true,true, true, true, true]
    [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]
  );

  const [selectAll, setSelectAll] = useState(false);

  const [cardType, setCardType] = useState("-");
  const [ATR, setATR] = useState("-");
  const [SAK, setSAK] = useState("-");
  const [UID, setUID] = useState("-");


  const [key, setKey] = useState("FFFFFFFFFFFF");


  window.electron.ipcRenderer.on("channel", (event:any, responseData:ProtocolData)=>{
    console.log(" :: IPC Renderer Listener - FullReading ::")
    console.log(responseData);

    switch(responseData.uuid) {

      case "FullScanCardStatus1-GetATR" : {
        setATR(responseData.data[0]);
      }
      break;

      case "FullScanCardStatus1-GetUID" : {
        setUID(responseData.data[0]);
      }
      break;

      case "FullScan-ReadBlock" : {

        let blockNum:number = Number(responseData.data[0]);

        let sectorNum = Math.trunc(blockNum/4);
        let blockIdx = Math.trunc(blockNum%4);

        let newSectorData = [...sectorData];
        newSectorData[sectorNum][blockIdx] = responseData.data[1].substring(0,32);

        setSectorData(newSectorData);
      }
      break;

    }

  })

  return (
    <>
    <Box m={0}>
      <Flex justify={"space-between"}>
        <Heading mb={5} size={"lg"}>
          Full Reading
        </Heading>
      </Flex>
      <Grid
        templateColumns={'repeat(7,1fr)'}
        gap={4}
      >
        <GridItem colSpan={5}>
          <Card>
            <CardHeader mb={-5}>
              <Flex justify={"space-between"}>
                <Heading size={"md"}>Card Status</Heading>
                <Button
                  colorScheme="teal"
                  onClick={ async () => {
                    ReaderControl(Command.Cmd_Socket_Connect,"FullScanCardStatus-SocketConnect", []);
                    await delay(100);

                    ReaderControl(Command.Cmd_SCard_Establish_Context,"FullScanCardStatus-EstablishContext", []);
                    await delay(100);

                    ReaderControl(Command.Cmd_SCard_Reader_List,"FullScanCardStatus1-ReaderList", []);
                    await delay(100);

                    ReaderControl(Command.Cmd_SCard_Connect_Card,"FullScanCardStatus1-ConnectCard", []);
                    await delay(100);

                    ReaderControl(Command.Cmd_SCard_GetATR,"FullScanCardStatus1-GetATR", []);
                    await delay(100);

                    ReaderControl(Command.Cmd_MI_Get_UID,"FullScanCardStatus1-GetUID", []);
                  }}
                >
                  Detect Card
                </Button>
              </Flex>
            </CardHeader>
            <CardBody>

              <Flex justify={"space-around"} direction={"row"} gap={4}>
                <Box w={"50%"}>
                  <Flex justify={"space-between"}>
                    <Text>Card Type</Text>
                    <Text fontWeight={"bold"}>{cardType}</Text>
                  </Flex>
                  
                  <Flex justify={"space-between"}>
                    <Text>ATR</Text>
                    <Text fontWeight={"bold"}>{ATR}</Text>
                  </Flex>

                  <Flex justify={"space-between"}>
                    <Text>UID</Text>
                    <Text fontWeight={"bold"}>{UID}</Text>
                  </Flex>
                </Box>
                <Box w={"50%"}>
                  <Flex justify={"space-between"}>
                    <Text>SAK</Text>
                    <Text fontWeight={"bold"}>{SAK}</Text>
                  </Flex>

                  <Flex justify={"space-between"}>
                    <Text>ATS</Text>
                    <Text fontWeight={"bold"}>{"-"}</Text>
                  </Flex>
                </Box>
              </Flex>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem colSpan={2}  >
          <Card>
            <CardHeader mb={-5}>
              <Heading size={"md"}>Scan Controls</Heading>
            </CardHeader>
            <CardBody>
              <Stack direction={"column"}>
                <Button 
                  colorScheme="blue"
                  onClick={ async ()=>{
                    let i = 0;
                    ReaderControl(Command.Cmd_Socket_Connect,"FullScanCardStatus-SocketConnect", []);
                    await delay(100);

                    ReaderControl(Command.Cmd_SCard_Establish_Context,"FullScanCardStatus-EstablishContext", []);
                    await delay(100);

                    ReaderControl(Command.Cmd_SCard_Reader_List,"FullScanCardStatus1-ReaderList", []);
                    await delay(100);

                    ReaderControl(Command.Cmd_SCard_Connect_Card,"FullScanCardStatus1-ConnectCard", []);
                    await delay(100);

                    ReaderControl(Command.Cmd_SCard_GetATR,"FullScanCardStatus1-GetATR", []);
                    await delay(100);

                    ReaderControl(Command.Cmd_MI_Get_UID,"FullScanCardStatus1-GetUID", []);
                    await delay(100);

                    
                    
                    for(i=0;i<16;i++) {
                      if(sectorSelect[i] == true) {
                        ReaderControl(Command.Cmd_MI_Load_Key,"FullScan-LoadKey", [key]);
                        await delay(100);

                        ReaderControl(Command.Cmd_MI_Authentication,"FullScan-Authentication", [String(i*4), "A"]);
                        await delay(100);

                        ReaderControl(Command.Cmd_MI_Read_Block,"FullScan-ReadBlock", [String( (i)*4 )]);
                        await delay(200);
                        ReaderControl(Command.Cmd_MI_Read_Block,"FullScan-ReadBlock", [String( (i)*4 +1)]);
                        await delay(200);
                        ReaderControl(Command.Cmd_MI_Read_Block,"FullScan-ReadBlock", [String( (i)*4 +2)]);
                        await delay(200);
                        ReaderControl(Command.Cmd_MI_Read_Block,"FullScan-ReadBlock", [String( (i)*4 +3)]);
                        await delay(200);
                      }
                    }
                  }}
                >
                  <FaSearch/>
                  <Text ml={2}> Start Full Scan </Text>
                </Button>

                <Button>
                  <FaStop/>
                  <Text ml={2}> Stop Scan </Text>
                </Button>

                {/* <Button disabled>
                  Export Dump
                </Button> */}
              </Stack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem colSpan={5} >
          <Card>
            <CardHeader mb={-5}>
              <Flex justify={"space-between"}>
              <Heading size={"md"}>
                Sector Data(0-15)
              </Heading>

              <Checkbox
                onChange={()=>{
                  setSelectAll(!selectAll);

                  if(!selectAll) {
                    setSelectAll(true);
                    setSectorSelect( [true, true, true, true,true, true, true, true,true, true, true, true,true, true, true, true] );
                  }
                  else {
                    setSelectAll(false);
                    setSectorSelect( [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false] );
                  }
                }}
                isChecked={selectAll} 
              >
                Select All
              </Checkbox>
              </Flex>
            </CardHeader>
            <CardBody>
              
              <SimpleGrid columns={2} gap={4}>
                {
                  sectorData.map( (data, idx) => (
                    <Box
                      as="button"
                      onClick={()=>{
                        const newSelect = [...sectorSelect];
                        newSelect[idx] = !newSelect[idx];
                        setSectorSelect(newSelect)
                      }}
                    >
                      {SectorCard(
                        { sectorData :data,index : idx, selected:sectorSelect }
                      )}
                    </Box>
                  ))
                }
              </SimpleGrid>

            </CardBody>
          </Card>
        </GridItem>

        <GridItem colSpan={2} >
          <Card>
            <CardHeader mb={-5}>
              <Heading size={'md'}>Key Setting</Heading>
            </CardHeader>
            <CardBody>
              <Stack direction={"column"}>
              <Flex justify={"space-between"}>
                  <Center>
                    <Text fontWeight={"bold"} > Key Type </Text>
                  </Center>  

                  <Select w={100}>
                    <option>Key A</option>
                    <option>Key B</option>
                  </Select>
                </Flex>

                <Flex justify={"space-between"}>
                  <Center>
                    <Text fontWeight={"bold"} > Key </Text>
                  </Center>  

                  <Input 
                    htmlSize={8} 
                    width={"auto"} 
                    variant="outline" 
                    value={key} 
                    onChange={(e)=>setKey(e.target.value)}
                  />
                </Flex>

              </Stack>
            </CardBody>
          </Card>

        </GridItem>
      </Grid>
    </Box>
    </>
  );
};
