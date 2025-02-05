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
} from "@chakra-ui/react";
import { ReaderCtrl } from "../../../Utils/WinscardUtils";
import { useRequestStore, Status, ComponentData } from './FunctionTestStore';
import { v4 as uuidv4 } from 'uuid';
import { ProtocolData, Result } from "@scard/protocols/ReaderRequest";


type UUIDTYPE = string | null;
type ComponentUUID = {
  SocketConnect: UUIDTYPE;
  EstablishContext: UUIDTYPE;
  ReaderList: UUIDTYPE;
  ConnectCard: UUIDTYPE;
};



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
    ConnectCard : null
  });

  

  useEffect(()=>{
    ipcRenderer.on("channel", (event:any, responseData:ProtocolData)=>{
      //responseData를 받으면
      //responseData의 UUID에 맞는 데이터를 집어넣음.
      //데이터를 집어넣을 떄 데이터를 파싱해서 집어넣으면
      //그걸 참조하는 곳에서는 uuid로 참조해서 바인딩하고있으니
      //파싱된 데이터가 출력되도록 함
      //그럼 애초에 파싱된 데이터를 집어넣어야 하고.
      //receiveResponse 에는 파싱된 데이터를 집어넣어놔야함.

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
          <CardBody mt={-5} mb={-5}>
            <Text>Result</Text>

            <Textarea 
              readOnly 
              value={
                componentUUID.SocketConnect && responses[componentUUID.SocketConnect!]?
                JSON.stringify(responses[componentUUID.SocketConnect!], null, 2):""
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

                ReaderCtrl(newUUID).SocketConnect();
                //store에 uuid를 등록
                useRequestStore.getState().addPendingRequest(newUUID);

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

                ReaderCtrl(newUUID).SocektDisconnect();
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
              <Badge colorScheme="green">Success</Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5}>
            <Text>Result</Text>

            <Textarea readOnly></Textarea>
          </CardBody>
          <CardFooter alignSelf={"end"}>
            <Button
              colorScheme="blue"
              onClick={() => {
                const newUUID = uuidv4();

                ReaderCtrl(newUUID).EstablishContext();
              }}
            >
              Run
            </Button>
          </CardFooter>
        </Card>

        {/* Reader List */}
        <Card>
          <CardHeader>
            <Stack direction={"row"}>
              <Heading size={"sm"}> Reader List </Heading>
              <Badge colorScheme="green">Success</Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5}>
            <Text>Result</Text>

            <Textarea readOnly></Textarea>
          </CardBody>
          <CardFooter alignSelf={"end"}>
            <Button colorScheme="blue"> Run </Button>
          </CardFooter>
        </Card>

        {/* Connect Card */}
        <Card>
          <CardHeader>
            <Stack direction={"row"}>
              <Heading size={"sm"}> Connect Card </Heading>
              <Badge colorScheme="green">Success</Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5}>
            <Text>Result</Text>

            <Textarea readOnly></Textarea>
          </CardBody>
          <CardFooter alignSelf={"end"}>
            <Button colorScheme="blue"> Run </Button>
          </CardFooter>
        </Card>
      </SimpleGrid>

      <Divider m={5} />

      <Heading size={"md"} mb={5}>
        MIFARE
      </Heading>
      <SimpleGrid columns={3} spacing={4}>
        {/* Get UID */}
        <Card>
          <CardHeader>
            <Stack direction={"row"}>
              <Heading size={"sm"}> Get UID </Heading>
              <Badge colorScheme="green">Success</Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5}>
            <Text>Result</Text>

            <Textarea readOnly></Textarea>
          </CardBody>
          <CardFooter alignSelf={"end"}>
            <Button colorScheme="blue"> Run </Button>
          </CardFooter>
        </Card>

        {/* Load Key */}
        <Card>
          <CardHeader>
            <Stack direction={"row"}>
              <Heading size={"sm"}> Load Key </Heading>
              <Badge colorScheme="green">Success</Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5}>
            <Text>Result</Text>

            <Textarea readOnly></Textarea>
          </CardBody>
          <CardFooter alignSelf={"end"}>
            <Button colorScheme="blue"> Run </Button>
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
          <CardBody mt={-5} mb={-5}>
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
          <CardBody mt={-5} mb={-5}>
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
          <CardBody mt={-5} mb={-5}>
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
          <CardBody mt={-5} mb={-5}>
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
