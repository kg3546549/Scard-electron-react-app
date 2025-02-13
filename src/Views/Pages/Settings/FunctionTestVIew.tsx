import React, { ReactNode, useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Heading,
  SimpleGrid,
  Text,
  Textarea,
  Stack,
  Badge,
  ButtonGroup,
  Input,
  InputGroup,
  InputLeftAddon,
  RadioGroup,
  Radio,
  Select,
} from "@chakra-ui/react";
import { ReaderControl } from "../../../Utils/WinscardUtils";
import { useRequestStore } from './FunctionTestStore';
import { v4 as uuidv4 } from 'uuid';
import { Command, ProtocolData, Result } from "@scard/protocols/ReaderRequest";






export const FunctionTest = () => {
  const badgeColor: Map<Status, string> = new Map([
    ["ready", "gray"],
    ["processing", "yellow"],
    ["success", "green"],
    ["fail", "red"],
  ]);

  // const { ipcRenderer } = window.require("electron");

  const responses = useRequestStore((state) => state.responses);
  const [componentUUID, setComponentUUID] = useState<ComponentUUID>({
    SocketConnect : null,
    EstablishContext :null,
    ReaderList : null,
    ConnectCard : null,
    Transmit : null,
    GetUID: null,
    GetATR: null,
    LoadKey: null,
    Authentication: null,
    ReadBlock: null,
    WriteBlock: null,
    HALT: null,
  });

  const UUIDtoData = (id:UUIDTYPE):ComponentData => {
    
    if(id == null || responses[id!] == null) {
      return {
      data : [],
      uuid : "",
      status : "ready",
      }
    };
    
    return responses[id!];
    
  }

  const [loadkeyInput, setLoadkeyInput] = useState("FFFFFFFFFFFF");
  const [transData, setTransData] = useState("");
  const [authKeyType, setAuthkeyType] = useState("A");
  
  const [curSector, setCurSector] = useState(0);
  const sectors:number[] = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];

  const [blocks, setBlocks] = useState( [0,1,2,3] );
  const [curBlock, setCurBlock] = useState(0);


  window.electron.ipcRenderer.on("channel", (event:any, responseData:ProtocolData)=>{
    //responseData를 받으면
    //responseData의 UUID에 맞는 데이터를 집어넣음.
    //데이터를 집어넣을 떄 데이터를 파싱해서 집어넣으면
    //그걸 참조하는 곳에서는 uuid로 참조해서 바인딩하고있으니
    //파싱된 데이터가 출력되도록 함
    //그럼 애초에 파싱된 데이터를 집어넣어야 하고.
    //receiveResponse 에는 파싱된 데이터를 집어넣어놔야함.

    console.log(" :: IPC Renderer Listener ::")
    console.log(responseData);

    let responseStatus:Status = "ready";
    switch(responseData.result) {
      case Result.Success : responseStatus="success"; break;
      default : responseStatus="fail";break;
    }

    const componentData:ComponentData = {
      data : responseData.data,
      status : responseStatus,
      uuid : responseData.uuid
    }

    console.log(componentData);

    useRequestStore.getState().receiveResponse(responseData.uuid, componentData);
    
  })

  useEffect(()=>{
    
  });

  return (
    <>
      <Heading size={"md"} mb={5}>
        Reader Connect
      </Heading>
      <SimpleGrid columns={3} spacing={4}>
        {/* Socket Connect */}
        <Card>
          <CardHeader>
            <Stack direction={"row"}>
              <Heading size={"sm"}> Socket Connect </Heading>
              <Badge 
                colorScheme={
                  badgeColor.get(UUIDtoData(componentUUID.SocketConnect).status)
                }
              >
                {UUIDtoData(componentUUID.SocketConnect).status}
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
            <Text>Result</Text>

            <Textarea 
              readOnly 
              value={
                UUIDtoData(componentUUID.SocketConnect).data
              }
            />
            
          </CardBody>
          <CardFooter alignSelf={"end"}>
            {/* Check Comment.md */}
            <ButtonGroup>
            <Button
              colorScheme="blue"
              onClick={() => {                
                const newUUID = uuidv4();

                // ReaderCtrl(newUUID).SocketConnect();
                //Main Process에 리더 조작 요청
                ReaderControl(Command.Cmd_Socket_Connect,newUUID, []);
                //store에 uuid를 등록
                useRequestStore.getState().addPendingRequest(newUUID);
                
                //데이터바인딩 용 UUID state 세팅
                setComponentUUID({
                  ...componentUUID, 
                  SocketConnect : newUUID
                });
              }}
            >
              Connect
            </Button>
            <Button
              
              onClick={() => {                
                const newUUID = uuidv4();

                ReaderControl(Command.Cmd_Socket_Disconnect,newUUID, []);
                //store에 uuid를 등록
                useRequestStore.getState().addPendingRequest(newUUID);

                setComponentUUID({
                  ...componentUUID, 
                  SocketConnect : newUUID
                });
              }}
            >
              Disconnect
            </Button>
            </ButtonGroup>
          </CardFooter>
        </Card>

        {/* Establish Context */}
        <Card>
          <CardHeader>
            <Stack direction={"row"}>
              <Heading size={"sm"}> Establish Context </Heading>
              <Badge 
                colorScheme={
                  badgeColor.get(UUIDtoData(componentUUID.EstablishContext).status)
                }
              >
                {
                  UUIDtoData(componentUUID.EstablishContext).status
                }
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
            <Text>Result</Text>

            <Textarea 
              readOnly 
              value={
                UUIDtoData(componentUUID.EstablishContext).data
              }
            />
            
          </CardBody>
          <CardFooter alignSelf={"end"}>
            {/* Check Comment.md */}
            <ButtonGroup>
            <Button
              colorScheme="blue"
              onClick={() => {                
                const newUUID = uuidv4();

                // ReaderCtrl(newUUID).SocketConnect();
                //Main Process에 리더 조작 요청
                ReaderControl(Command.Cmd_SCard_Establish_Context,newUUID, []);
                //store에 uuid를 등록
                useRequestStore.getState().addPendingRequest(newUUID);
                
                //데이터바인딩 용 UUID state 세팅
                setComponentUUID({
                  ...componentUUID, 
                  EstablishContext : newUUID
                });
              }}
            >
              Establish
            </Button>
            {/* TODO : Release Context Button */}
            <Button
              
              onClick={() => {                
                const newUUID = uuidv4();

                ReaderControl(Command.Cmd_Scard_Release_Context,newUUID, []);
                //store에 uuid를 등록
                useRequestStore.getState().addPendingRequest(newUUID);

                setComponentUUID({
                  ...componentUUID, 
                  SocketConnect : newUUID
                });
              }}
            >
              Release
            </Button>
            </ButtonGroup>
          </CardFooter>
        </Card>

        {/* Reader List */}
        <Card>
          <CardHeader>
            <Stack direction={"row"}>
              <Heading size={"sm"}> Reader List </Heading>
              <Badge 
                colorScheme={
                  badgeColor.get(UUIDtoData(componentUUID.ReaderList).status)
                }
              >
                {
                  UUIDtoData(componentUUID.ReaderList).status
                }
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
            <Text>Result</Text>

            <Textarea 
              readOnly 
              value={
                UUIDtoData(componentUUID.ReaderList).data
              }
            />
            
          </CardBody>
          <CardFooter alignSelf={"end"}>
            {/* Check Comment.md */}
            <ButtonGroup>
            <Button
              colorScheme="blue"
              onClick={() => {                
                const newUUID = uuidv4();

                // ReaderCtrl(newUUID).SocketConnect();
                //Main Process에 리더 조작 요청
                ReaderControl(Command.Cmd_SCard_Reader_List,newUUID, []);
                //store에 uuid를 등록
                useRequestStore.getState().addPendingRequest(newUUID);
                
                //데이터바인딩 용 UUID state 세팅
                setComponentUUID({
                  ...componentUUID, 
                  ReaderList : newUUID
                });
              }}
            >
              Run
            </Button>
            </ButtonGroup>
          </CardFooter>
        </Card>

        {/* Connect Card */}
        <Card>
          <CardHeader>
            <Stack direction={"row"}>
              <Heading size={"sm"}> Connect Card </Heading>
              <Badge 
                colorScheme={
                  badgeColor.get(UUIDtoData(componentUUID.ConnectCard).status)
                }
              >
                {
                  UUIDtoData(componentUUID.ConnectCard).status
                }
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
            <Text>Result</Text>

            <Textarea 
              readOnly 
              value={
                UUIDtoData(componentUUID.ConnectCard).data
              }
            />
            
          </CardBody>
          <CardFooter alignSelf={"end"}>
            {/* Check Comment.md */}
            <ButtonGroup>
            <Button
              colorScheme="blue"
              onClick={() => {                
                const newUUID = uuidv4();

                // ReaderCtrl(newUUID).SocketConnect();
                //Main Process에 리더 조작 요청
                ReaderControl(Command.Cmd_SCard_Connect_Card,newUUID, []);
                //store에 uuid를 등록
                useRequestStore.getState().addPendingRequest(newUUID);
                
                //데이터바인딩 용 UUID state 세팅
                setComponentUUID({
                  ...componentUUID, 
                  ConnectCard : newUUID
                });
              }}
            >
              Run
            </Button>
            </ButtonGroup>
          </CardFooter>
        </Card>

        {/* Get ATR */}
        <Card>
          <CardHeader>
            <Stack direction={"row"}>
              <Heading size={"sm"}> Get ATR </Heading>
              <Badge 
                colorScheme={
                  badgeColor.get(UUIDtoData(componentUUID.GetATR).status)
                }
              >
                {
                  UUIDtoData(componentUUID.GetATR).status
                }
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
            <Text>Result</Text>

            <Textarea 
              readOnly 
              value={
                UUIDtoData(componentUUID.GetATR).data
              }
            />
            
          </CardBody>
          <CardFooter alignSelf={"end"}>
            {/* Check Comment.md */}
            <ButtonGroup>
            <Button
              colorScheme="blue"
              onClick={() => {                
                const newUUID = uuidv4();

                // ReaderCtrl(newUUID).SocketConnect();
                //Main Process에 리더 조작 요청
                //TODO : Command로 바꾸기
                ReaderControl(106,newUUID, []);
                //store에 uuid를 등록
                useRequestStore.getState().addPendingRequest(newUUID);
                
                //데이터바인딩 용 UUID state 세팅
                //atr 예시 : 3B8F8001804F0CA000000306030001000000006A
                setComponentUUID({
                  ...componentUUID, 
                  GetATR : newUUID
                });
              }}
            >
              Run
            </Button>
            </ButtonGroup>
          </CardFooter>
        </Card>

        {/* Transmit */}
        <Card>
          <CardHeader>
            <Stack direction={"row"}>
              <Heading size={"sm"}> Transmit </Heading>
              <Badge 
                colorScheme={
                  badgeColor.get(UUIDtoData(componentUUID.Transmit).status)
                }
              >
                {
                  UUIDtoData(componentUUID.Transmit).status
                }
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>

            <Text>Send Data</Text>

            <Textarea 
              value={transData}
              onChange={(e)=>{
                setTransData(e.target.value);
              }}
            />
            <Text>Result</Text>

            <Textarea 
              readOnly 
              value={
                UUIDtoData(componentUUID.Transmit).data
              }
            />
            
          </CardBody>
          <CardFooter alignSelf={"end"}>
            {/* Check Comment.md */}
            <ButtonGroup>
            <Button
              colorScheme="blue"
              onClick={() => {                
                const newUUID = uuidv4();

                // ReaderCtrl(newUUID).SocketConnect();
                //Main Process에 리더 조작 요청
                ReaderControl(Command.Cmd_SCard_Transmit,newUUID, [transData]);
                //store에 uuid를 등록
                useRequestStore.getState().addPendingRequest(newUUID);
                
                //데이터바인딩 용 UUID state 세팅
                setComponentUUID({
                  ...componentUUID, 
                  Transmit : newUUID
                });
              }}
            >
              Run
            </Button>
            </ButtonGroup>
          </CardFooter>
        </Card>

      </SimpleGrid>

      <Divider m={5} />
      


      {/* MIFARE Test Functions */}
      <Heading size={"md"} mb={5}>
        MIFARE
      </Heading>
      <SimpleGrid columns={3} spacing={4}>

        {/* Get UID */}
        <Card>
          <CardHeader>
            <Stack direction={"row"}>
              <Heading size={"sm"}> Get UID </Heading>
              <Badge 
                colorScheme={
                  badgeColor.get(UUIDtoData(componentUUID.GetUID).status)
                }
              >
                {
                  UUIDtoData(componentUUID.GetUID).status
                }
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
            <Text>Result</Text>

            <Textarea 
              readOnly 
              value={UUIDtoData(componentUUID.GetUID).data}
            />
            
          </CardBody>
          <CardFooter alignSelf={"end"}>
            {/* Check Comment.md */}
            <ButtonGroup>
            <Button
              colorScheme="blue"
              onClick={() => {                
                const newUUID = uuidv4();

                // ReaderCtrl(newUUID).SocketConnect();
                //Main Process에 리더 조작 요청
                ReaderControl(Command.Cmd_MI_Get_UID,newUUID, []);
                //store에 uuid를 등록
                useRequestStore.getState().addPendingRequest(newUUID);
                
                //데이터바인딩 용 UUID state 세팅
                setComponentUUID({
                  ...componentUUID, 
                  GetUID : newUUID
                });
              }}
            >
              Run
            </Button>
            </ButtonGroup>
          </CardFooter>
        </Card>

        {/* Load Key */}
        <Card>
          <CardHeader>
            <Stack direction={"row"}>
              <Heading size={"sm"}> Load Key </Heading>
              <Badge 
                colorScheme={
                  badgeColor.get(UUIDtoData(componentUUID.LoadKey).status)
                }
              >
                {UUIDtoData(componentUUID.LoadKey).status}
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>

            <InputGroup mb={5}>
              <InputLeftAddon>KEY</InputLeftAddon>
              <Input
                maxLength={12}
                value={loadkeyInput}
                onChange={ (e)=>{setLoadkeyInput(e.target.value)} }
              ></Input>
            </InputGroup>

            <Text>Result</Text>

            <Textarea 
              readOnly 
              value={UUIDtoData(componentUUID.LoadKey).data}
            />
            
          </CardBody>
          <CardFooter alignSelf={"end"}>
            {/* Check Comment.md */}
            <ButtonGroup>
            <Button
              colorScheme="blue"
              onClick={() => {        
                
                const newUUID = uuidv4();

                // ReaderCtrl(newUUID).SocketConnect();
                //Main Process에 리더 조작 요청
                ReaderControl(Command.Cmd_MI_Load_Key,newUUID, [loadkeyInput]);
                //store에 uuid를 등록
                useRequestStore.getState().addPendingRequest(newUUID);
                
                //데이터바인딩 용 UUID state 세팅
                setComponentUUID({
                  ...componentUUID, 
                  LoadKey : newUUID
                });
              }}
            >
              Load Key
            </Button>
            </ButtonGroup>
          </CardFooter>
        </Card>



        {/* Authentication */}
        <Card>
          <CardHeader>
            <Stack direction={"row"}>
              <Heading size={"sm"}> Authentication </Heading>
              <Badge 
                colorScheme={
                  badgeColor.get(UUIDtoData(componentUUID.Authentication).status)
                }
              >
                {UUIDtoData(componentUUID.Authentication).status}
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
            
            <RadioGroup 
              defaultValue="A" 
              value={authKeyType} 
              mb={5}
              onChange={(e)=>{
                setAuthkeyType(e);
              }}
            >
              <Stack spacing={5} direction='row'>
                <Text>Key Type</Text>
                <Radio colorScheme="blue" value="A">
                  A
                </Radio>
                <Radio colorScheme="red" value="B">
                  B
                </Radio>
              </Stack>
            </RadioGroup>
            
            <InputGroup mb={3}>
              <InputLeftAddon>Sector</InputLeftAddon>
              <Select 
                variant={'outline'} 
                placeholder="Sector"
                value={curSector}
                onChange={(e)=>{ 
                  let selSector = Number(e.target.value);
                  setBlocks([
                    (selSector*4),
                    (selSector*4)+1,
                    (selSector*4)+2,
                    (selSector*4)+3
                  ]);
                  setCurSector( selSector );
                }}
              >
              {
                sectors.map( (data, index)  => (
                  <option value={data}> {data} </option>
                ))
              }
              </Select>
            </InputGroup>
            
            <Text>Result</Text>

            <Textarea 
              readOnly 
              value={
                UUIDtoData(componentUUID.Authentication).data
              }
            />
            
          </CardBody>
          <CardFooter alignSelf={"end"}>
            {/* Check Comment.md */}
            <ButtonGroup>
            <Button
              colorScheme="blue"
              onClick={() => {        
                
                const newUUID = uuidv4();

                // ReaderCtrl(newUUID).SocketConnect();
                //Main Process에 리더 조작 요청
                ReaderControl(Command.Cmd_MI_Authentication,newUUID, [String(curSector*4), authKeyType]);
                //store에 uuid를 등록
                useRequestStore.getState().addPendingRequest(newUUID);
                
                //데이터바인딩 용 UUID state 세팅
                setComponentUUID({
                  ...componentUUID, 
                  Authentication : newUUID
                });
              }}
            >
              Authentication
            </Button>
            </ButtonGroup>
          </CardFooter>
        </Card>
            
          
        

         {/* Read Block */}
         <Card>
          <CardHeader>
            <Stack direction={"row"}>
              <Heading size={"sm"}> Read Block </Heading>
              <Badge 
                colorScheme={
                  badgeColor.get(UUIDtoData(componentUUID.ReadBlock).status)
                }
              >
                {
                UUIDtoData(componentUUID.ReadBlock).status
                }
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
                        
            <InputGroup mb={3}>
              <InputLeftAddon>Block</InputLeftAddon>
              <Select 
                variant={'outline'} 
                placeholder="Block"
                value={curBlock}
                onChange={(e) => {
                  setCurBlock( Number(e.target.value) );
                }}
              >
                {
                  blocks.map( (data, index)  => (
                    <option value={data}> {data} </option>
                  ))
                }
              </Select>
            </InputGroup>

            <Text>Result</Text>
            {curBlock}

            <Textarea 
              readOnly 
              value={
                UUIDtoData(componentUUID.ReadBlock).data
              }
            />
            
          </CardBody>
          <CardFooter alignSelf={"end"}>
            {/* Check Comment.md */}
            <ButtonGroup>
            {/* Read Block 0섹터만 됌 */}
            <Button
              colorScheme="blue"
              onClick={() => {        
                
                const newUUID = uuidv4();

                // ReaderCtrl(newUUID).SocketConnect();
                //Main Process에 리더 조작 요청
                ReaderControl(Command.Cmd_MI_Read_Block,newUUID, [String(curBlock)]);
                //store에 uuid를 등록
                useRequestStore.getState().addPendingRequest(newUUID);
                
                //데이터바인딩 용 UUID state 세팅
                setComponentUUID({
                  ...componentUUID, 
                  ReadBlock : newUUID
                });
              }}
            >
              Read
            </Button>
            </ButtonGroup>
          </CardFooter>
        </Card>




        {/* Write Block */}
        <Card>
          <CardHeader>
            <Stack direction={"row"}>
              <Heading size={"sm"}> Write Block - 개발 중 </Heading>
              <Badge colorScheme="gray">not ready</Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
            <Text>Result</Text>

            <Textarea readOnly></Textarea>
          </CardBody>
          <CardFooter alignSelf={"end"}>
            <Button colorScheme="blue"> Run </Button>
          </CardFooter>
        </Card>

        {/* HALT */}
        <Card>
          <CardHeader>
            <Stack direction={"row"}>
              <Heading size={"sm"}> HALT - 개발 중 </Heading>
              <Badge colorScheme="gray">not ready</Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
            <Text>Result</Text>

            <Textarea readOnly></Textarea>
          </CardBody>
          <CardFooter alignSelf={"end"}>
            <Button colorScheme="blue"> Run </Button>
          </CardFooter>
        </Card>
      </SimpleGrid>
    </>
  );
};
