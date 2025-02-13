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

interface Cards {
  status:Status;
  result:string[];
}

interface ReacerConnectCards {
  SocketConnect:Cards;
  EstablishContext:Cards;
  ReaderList:Cards;
  ConnectCard:Cards;
  GetATR:Cards;
  Transmit:Cards;
}

// ipcRenderer.invoke를 이용해 uuid없이 구현하는것을 검토해 보았으나,
// 어짜피 Socket쪽도 단방향 송신으로 이루어져 있기 때문에, uuid는 필수 불가결하다는 것을 알았습니다.
// 하지만 invoke를 사용하는 법을 알았으니 다행입니다.

const badgeColor: Map<Status, string> = new Map([
  ["ready", "gray"],
  ["processing", "yellow"],
  ["success", "green"],
  ["fail", "red"],
]);

const WinscardTestView = () => {

  const [testCards, setTestCards] = useState<ReacerConnectCards>({
    SocketConnect : {
      status:"ready",
      result:[]
    },
    EstablishContext : {
      status:"ready",
      result:[]
    },
    ReaderList : {
      status:"ready",
      result:[]
    },
    ConnectCard : {
      status:"ready",
      result:[]
    },
    GetATR : {
      status:"ready",
      result:[]
    },
    Transmit : {
      status:"ready",
      result:[]
    },
  });

  useEffect(() => {
    // window.api.reader();
    
  });

  return (
  <>
    <SimpleGrid columns={3} spacing={4}>
        {/* Socket Connect */}
        <Card>
          <CardHeader>
            <Stack direction={"row"}>
              <Heading size={"sm"}> Socket Connect </Heading>
              <Badge 
                colorScheme={badgeColor.get(testCards.SocketConnect.status)}
              >
                {testCards.SocketConnect.status}
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
            <Text>Result</Text>

            <Textarea 
              readOnly 
              value={testCards.SocketConnect.result}
            />
            
          </CardBody>
          <CardFooter alignSelf={"end"}>
            {/* Check Comment.md */}
            <ButtonGroup>
            <Button
              colorScheme="blue"
              onClick={() => {     
                window.api.socket(["connect"]).then((e)=>{
                  console.log(e);

                  if(e[0] == "Success") {
                    setTestCards({
                      ...testCards,
                      SocketConnect : {
                        result : e,
                        status : "success"
                      }
                    });
                  }
                })
              }}
            >
              Connect    
            </Button>
            <Button
              
              onClick={() => {
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
                colorScheme={"gray"}
              >
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
            <Text>Result</Text>

            <Textarea 
              readOnly 
            />
            
          </CardBody>
          <CardFooter alignSelf={"end"}>
            {/* Check Comment.md */}
            <ButtonGroup>
            <Button
              colorScheme="blue"
              onClick={() => {                

              }}
            >
              Establish
            </Button>
            {/* TODO : Release Context Button */}
            <Button
              
              onClick={() => {                

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
              >
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
            <Text>Result</Text>

            <Textarea 
              readOnly 
            />
            
          </CardBody>
          <CardFooter alignSelf={"end"}>
            {/* Check Comment.md */}
            <ButtonGroup>
            <Button
              colorScheme="blue"
              onClick={() => {                
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
              >
              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
            <Text>Result</Text>

            <Textarea 
              readOnly 
            />
            
          </CardBody>
          <CardFooter alignSelf={"end"}>
            {/* Check Comment.md */}
            <ButtonGroup>
            <Button
              colorScheme="blue"
              onClick={() => {                
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
              >

              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
            <Text>Result</Text>

            <Textarea 
              readOnly
            />
            
          </CardBody>
          <CardFooter alignSelf={"end"}>
            {/* Check Comment.md */}
            <ButtonGroup>
            <Button
              colorScheme="blue"
              onClick={() => {                
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
              >

              </Badge>
            </Stack>
          </CardHeader>
          <CardBody mt={-5} mb={-5} alignContent={"space-around"}>

            <Text>Send Data</Text>

            <Textarea 
            />
            <Text>Result</Text>

            <Textarea 
              readOnly 
            />
            
          </CardBody>
          <CardFooter alignSelf={"end"}>
            {/* Check Comment.md */}
            <ButtonGroup>
            <Button
              colorScheme="blue"
              onClick={() => {                
              }}
            >
              Run
            </Button>
            </ButtonGroup>
          </CardFooter>
        </Card>

      </SimpleGrid>
  </>
  );
}




const MifareTestView = () => {
  const [loadkeyInput, setLoadkeyInput] = useState("FFFFFFFFFFFF");
  const [loadkeyType, setLoadkeyType] = useState("A");

  const [authKeyType, setAuthkeyType] = useState("A");
  
  const [curSector, setCurSector] = useState(0);
  const sectors:number[] = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];

  const [blocks, setBlocks] = useState( [0,1,2,3] );
  const [curBlock, setCurBlock] = useState(0);

  return (
  <>
    <SimpleGrid columns={3} spacing={4}>

    {/* Get UID */}
    <Card>
      <CardHeader>
        <Stack direction={"row"}>
          <Heading size={"sm"}> Get UID </Heading>
          <Badge 
          >
          </Badge>
        </Stack>
      </CardHeader>
      <CardBody mt={-5} mb={-5} alignContent={"space-around"}>
        <Text>Result</Text>

        <Textarea 
          readOnly 
        />
        
      </CardBody>
      <CardFooter alignSelf={"end"}>
        {/* Check Comment.md */}
        <ButtonGroup>
        <Button
          colorScheme="blue"
          onClick={() => {
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
          >
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
        />
        
      </CardBody>
      <CardFooter alignSelf={"end"}>
        {/* Check Comment.md */}
        <ButtonGroup>
        <Button
          colorScheme="blue"
          onClick={() => {        
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
          >
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
        />
        
      </CardBody>
      <CardFooter alignSelf={"end"}>
        {/* Check Comment.md */}
        <ButtonGroup>
        <Button
          colorScheme="blue"
          onClick={() => {        
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
          >
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
        />
        
      </CardBody>
      <CardFooter alignSelf={"end"}>
        {/* Check Comment.md */}
        <ButtonGroup>
        {/* Read Block 0섹터만 됌 */}
        <Button
          colorScheme="blue"
          onClick={() => {        
          }}
        >
          Authentication
        </Button>
        </ButtonGroup>
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
          <Badge colorScheme="gray">Success</Badge>
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
}



export const FunctionTestV2 = () => {
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

  const [transData, setTransData] = useState("");



  return (
  <>
    <Heading size={"md"} mb={5}>
        Reader Connect
      </Heading>
      
      <WinscardTestView/>
      <Divider m={5} />
      


      {/* MIFARE Test Functions */}
      <Heading size={"md"} mb={5}>
        MIFARE
      </Heading>
      <MifareTestView/>
  </>     
  );
}