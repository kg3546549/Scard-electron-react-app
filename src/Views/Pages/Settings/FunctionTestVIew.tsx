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
} from "@chakra-ui/react";
import { ReaderControl } from "../../../Utils/WinscardUtils";
import { useRequestStore } from './FunctionTestStore';
import { v4 as uuidv4 } from 'uuid';
import { Command, ProtocolData, Result } from "@scard/protocols/ReaderRequest";






export const FunctionTest = () => {
  const badgeColor: Map<Status, string> = new Map([
    ["ready", "gray"],
    ["processing", "yellow"],
    ["Success", "green"],
    ["Fail", "red"],
  ]);

  const { ipcRenderer } = window.require("electron");

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

  const [loadkeyInput, setLoadkeyInput] = useState("FFFFFFFFFFFF");
  const [loadkeyType, setLoadkeyType] = useState("A");
  const [transData, setTransData] = useState("");

  useEffect(()=>{
    ipcRenderer.on("channel", (event:any, responseData:ProtocolData)=>{
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
        case Result.Success : responseStatus="Success"; break;
        default : responseStatus="Fail";break;
      }

      const componentData:ComponentData = {
        data : responseData.data,
        status : responseStatus,
        uuid : responseData.uuid
      }

      console.log(componentData);

      useRequestStore.getState().receiveResponse(responseData.uuid, componentData);
      
    })
  });

  // useEffect(() => {
  //   console.log("Responses updated:", responses);
  // }, [responses]);

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
                  componentUUID.SocketConnect && responses[componentUUID.SocketConnect!]?
                  badgeColor.get(responses[componentUUID.SocketConnect!].status) : "gray"
                }
              >
                {componentUUID.SocketConnect && responses[componentUUID.SocketConnect!]?responses[componentUUID.SocketConnect!].status:"Ready"}
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
            <Text>Result</Text>

            <Textarea 
              readOnly 
              value={
                componentUUID.SocketConnect && responses[componentUUID.SocketConnect!]?
                responses[componentUUID.SocketConnect!].data:""
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
                  componentUUID.EstablishContext && responses[componentUUID.EstablishContext!]?
                  badgeColor.get(responses[componentUUID.EstablishContext!].status) : "gray"
                }
              >
                {
                componentUUID.EstablishContext && responses[componentUUID.EstablishContext!]?
                responses[componentUUID.EstablishContext!].status:"Ready"
                }
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
            <Text>Result</Text>

            <Textarea 
              readOnly 
              value={
                componentUUID.EstablishContext && responses[componentUUID.EstablishContext!]?
                responses[componentUUID.EstablishContext!].data:""
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
                  componentUUID.ReaderList && responses[componentUUID.ReaderList!]?
                  badgeColor.get(responses[componentUUID.ReaderList!].status) : "gray"
                }
              >
                {
                componentUUID.ReaderList && responses[componentUUID.ReaderList!]?
                responses[componentUUID.ReaderList!].status:"Ready"
                }
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
            <Text>Result</Text>

            <Textarea 
              readOnly 
              value={
                componentUUID.ReaderList && responses[componentUUID.ReaderList!]?
                responses[componentUUID.ReaderList!].data:""
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
                  componentUUID.ConnectCard && responses[componentUUID.ConnectCard!]?
                  badgeColor.get(responses[componentUUID.ConnectCard!].status) : "gray"
                }
              >
                {
                componentUUID.ConnectCard && responses[componentUUID.ConnectCard!]?
                responses[componentUUID.ConnectCard!].status:"Ready"
                }
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
            <Text>Result</Text>

            <Textarea 
              readOnly 
              value={
                componentUUID.ConnectCard && responses[componentUUID.ConnectCard!]?
                responses[componentUUID.ConnectCard!].data:""
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
                  componentUUID.GetATR && responses[componentUUID.GetATR!]?
                  badgeColor.get(responses[componentUUID.GetATR!].status) : "gray"
                }
              >
                {
                componentUUID.GetATR && responses[componentUUID.GetATR!]?
                responses[componentUUID.GetATR!].status:"Ready"
                }
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
            <Text>Result</Text>

            <Textarea 
              readOnly 
              value={
                componentUUID.GetATR && responses[componentUUID.GetATR!]?
                responses[componentUUID.GetATR!].data:""
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
                  componentUUID.Transmit && responses[componentUUID.Transmit!]?
                  badgeColor.get(responses[componentUUID.Transmit!].status) : "gray"
                }
              >
                {
                componentUUID.Transmit && responses[componentUUID.Transmit!]?
                responses[componentUUID.Transmit!].status:"Ready"
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
                componentUUID.Transmit && responses[componentUUID.Transmit!]?
                responses[componentUUID.Transmit!].data:""
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
                  componentUUID.GetUID && responses[componentUUID.GetUID!]?
                  badgeColor.get(responses[componentUUID.GetUID!].status) : "gray"
                }
              >
                {
                componentUUID.GetUID && responses[componentUUID.GetUID!]?
                responses[componentUUID.GetUID!].status:"Ready"
                }
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
            <Text>Result</Text>

            <Textarea 
              readOnly 
              value={
                componentUUID.GetUID && responses[componentUUID.GetUID!]?
                responses[componentUUID.GetUID!].data:""
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
                  componentUUID.LoadKey && responses[componentUUID.LoadKey!]?
                  badgeColor.get(responses[componentUUID.LoadKey!].status) : "gray"
                }
              >
                {
                componentUUID.LoadKey && responses[componentUUID.LoadKey!]?
                responses[componentUUID.LoadKey!].status:"Ready"
                }
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
            
            <RadioGroup 
              defaultValue="A" 
              value={loadkeyType} 
              mb={5}
              onChange={(e)=>{
                setLoadkeyType(e);
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
              value={
                componentUUID.LoadKey && responses[componentUUID.LoadKey!]?
                responses[componentUUID.LoadKey!].data:""
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
                ReaderControl(Command.Cmd_MI_Load_Key,newUUID, [loadkeyType, loadkeyInput]);
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
              <Badge colorScheme="green">Success</Badge>
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

        {/* Read Block */}
        <Card>
          <CardHeader>
            <Stack direction={"row"}>
              <Heading size={"sm"}> Read Block </Heading>
              <Badge colorScheme="green">Success</Badge>
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

        {/* Write Block */}
        <Card>
          <CardHeader>
            <Stack direction={"row"}>
              <Heading size={"sm"}> Write Block </Heading>
              <Badge colorScheme="green">Success</Badge>
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
              <Heading size={"sm"}> HALT </Heading>
              <Badge colorScheme="green">Success</Badge>
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
