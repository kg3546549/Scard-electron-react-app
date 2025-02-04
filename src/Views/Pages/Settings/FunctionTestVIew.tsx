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
} from "@chakra-ui/react";
import { ReaderCtrl } from "../../../Utils/WinscardUtils";
import { useRequestStore } from './FunctionTestStore';
import { v4 as uuidv4 } from 'uuid';
import { ProtocolData } from "@scard/protocols/ReaderRequest";

type Status =  "ready" | "processing" | "Success" | "Fail";

type RequestItem = {
  uuid: string | null;
  data: any; // `null` 외에도 다른 데이터를 저장할 가능성이 있다면 `any` 또는 명확한 타입을 지정
  status: Status;
};

type RequestId = {
  SocketConnect: RequestItem;
  EstablishContext: RequestItem;
  ReaderList: RequestItem;
  ConnectCard: RequestItem;
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
  const [requestId, setRequestId] = useState<RequestId>({
    SocketConnect : {
      "uuid" : null,
      "data" : null,
      "status" : "ready"
    },
    EstablishContext : {
      "uuid" : null,
      "data" : null,
      "status" : "ready"
    },
    ReaderList : {
      "uuid" : null,
      "data" : null,
      "status" : "ready"
    },
    ConnectCard : {
      "uuid" : null,
      "data" : null,
      "status" : "ready"
    },
  });

  

  useEffect(()=>{
    ipcRenderer.on("channel", (event:any, responseData:ProtocolData)=>{
      console.log(":: Process Complete !! ::")
      console.log(responseData);
      console.log("\n\n");

      console.log(":: Store UUID Set ::")
      useRequestStore.getState().receiveResponse(responseData.uuid, responseData);
      console.log("Store");
      console.log(responses);
    })
  });

  useEffect(() => {
    console.log("Responses updated:", responses);
  }, [responses]);

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
                colorScheme={badgeColor.get(requestId.SocketConnect.status)}
              >
                {requestId.SocketConnect.status}
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5}>
            <Text>Result</Text>

            <Textarea readOnly>
            {
              requestId.SocketConnect.uuid &&
              JSON.stringify(responses[requestId.SocketConnect.uuid], null, 2)
            }
            </Textarea>
          </CardBody>
          <CardFooter alignSelf={"end"}>
            <Button onClick={
              ()=>{
                console.log(":: Responses ::");
                console.log(responses);
                console.log(responses[requestId.SocketConnect.uuid!]);
              }
            }>
              Clear
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => {                
                const newUUID = uuidv4();
                console.log(`:: Button Click ${newUUID}::`);

                ReaderCtrl(newUUID).SocketConnect();
                //store에 uuid를 등록
                useRequestStore.getState().addPendingRequest(newUUID);
                setRequestId( 
                  {
                    ...requestId, 
                    SocketConnect : {
                      ...requestId.SocketConnect,
                      uuid:newUUID
                    }
                  });
              }}
            >
              Run
            </Button>
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
