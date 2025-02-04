import React, { ReactNode } from 'react'
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
    Badge
} from '@chakra-ui/react'
import { ReaderCtrl } from '../../../Utils/WinscardUtils';

export const FunctionTest = () => {
    return (
        <>
        <Heading size={'md'} mb={5}>Reader Connect</Heading>
        <SimpleGrid columns={3} spacing={4}>

            {/* Socket Connect */}
                <Card>
                <CardHeader>
                    <Stack direction={'row'}>
                        <Heading size={'sm'}> Socket Connect </Heading>
                        <Badge colorScheme='green'>Success</Badge>
                    </Stack>
                </CardHeader>
                <CardBody mt={-5} mb={-5}>
                    <Text>Result</Text>
                    
                    <Textarea readOnly>
                    </Textarea>
                </CardBody>
                <CardFooter alignSelf={"end"}>
                    <Button 
                        colorScheme='blue' 
                        onClick={
                            ()=>{
                                ReaderCtrl().SocketConnect();
                            }
                        }> Run </Button>
                </CardFooter>
            </Card>

            {/* Establish Context */}
            <Card>
                <CardHeader>
                    <Stack direction={'row'}>
                        <Heading size={'sm'}> Establish Context </Heading>
                        <Badge colorScheme='green'>Success</Badge>
                    </Stack>
                </CardHeader>
                <CardBody mt={-5} mb={-5}>
                    <Text>Result</Text>
                    
                    <Textarea readOnly>
                    </Textarea>
                </CardBody>
                <CardFooter alignSelf={"end"}>
                    <Button 
                        colorScheme='blue' 
                        onClick={
                            ()=>{
                                console.log("EstablishContext");
                                ReaderCtrl().EstablishContext()
                            }
                        }> Run </Button>
                </CardFooter>
            </Card>

            {/* Reader List */}
            <Card>
                <CardHeader>
                    <Stack direction={'row'}>
                        <Heading size={'sm'}> Reader List </Heading>
                        <Badge colorScheme='green'>Success</Badge>
                    </Stack>
                </CardHeader>
                <CardBody mt={-5} mb={-5}>
                    <Text>Result</Text>
                    
                    <Textarea readOnly>
                    </Textarea>
                </CardBody>
                <CardFooter alignSelf={"end"}>
                    <Button colorScheme='blue'> Run </Button>
                </CardFooter>
            </Card>

            {/* Connect Card */}
            <Card>
                <CardHeader>
                    <Stack direction={'row'}>
                        <Heading size={'sm'}> Connect Card </Heading>
                        <Badge colorScheme='green'>Success</Badge>
                    </Stack>
                </CardHeader>
                <CardBody mt={-5} mb={-5}>
                    <Text>Result</Text>
                    
                    <Textarea readOnly>
                    </Textarea>
                </CardBody>
                <CardFooter alignSelf={"end"}>
                    <Button colorScheme='blue'> Run </Button>
                </CardFooter>
            </Card>          
        </SimpleGrid>

        <Divider m={5}/>

        <Heading size={'md'} mb={5}>MIFARE</Heading>
        <SimpleGrid columns={3} spacing={4}>

            {/* Get UID */}
            <Card>
                <CardHeader>
                    <Stack direction={'row'}>
                        <Heading size={'sm'}> Get UID </Heading>
                        <Badge colorScheme='green'>Success</Badge>
                    </Stack>
                </CardHeader>
                <CardBody mt={-5} mb={-5}>
                    <Text>Result</Text>
                    
                    <Textarea readOnly>
                    </Textarea>
                </CardBody>
                <CardFooter alignSelf={"end"}>
                    <Button colorScheme='blue'> Run </Button>
                </CardFooter>
            </Card>

            {/* Load Key */}
            <Card>
                <CardHeader>
                    <Stack direction={'row'}>
                        <Heading size={'sm'}> Load Key </Heading>
                        <Badge colorScheme='green'>Success</Badge>
                    </Stack>
                </CardHeader>
                <CardBody mt={-5} mb={-5}>
                    <Text>Result</Text>
                    
                    <Textarea readOnly>
                    </Textarea>
                </CardBody>
                <CardFooter alignSelf={"end"}>
                    <Button colorScheme='blue'> Run </Button>
                </CardFooter>
            </Card>

            {/* Authentication */}
            <Card>
                <CardHeader>
                    <Stack direction={'row'}>
                        <Heading size={'sm'}> Authentication </Heading>
                        <Badge colorScheme='green'>Success</Badge>
                    </Stack>
                </CardHeader>
                <CardBody mt={-5} mb={-5}>
                    <Text>Result</Text>
                    
                    <Textarea readOnly>
                    </Textarea>
                </CardBody>
                <CardFooter alignSelf={"end"}>
                    <Button colorScheme='blue'> Run </Button>
                </CardFooter>
            </Card> 

            {/* Read Block */}
            <Card>
                <CardHeader>
                    <Stack direction={'row'}>
                        <Heading size={'sm'}> Read Block </Heading>
                        <Badge colorScheme='green'>Success</Badge>
                    </Stack>
                </CardHeader>
                <CardBody mt={-5} mb={-5}>
                    <Text>Result</Text>
                    
                    <Textarea readOnly>
                    </Textarea>
                </CardBody>
                <CardFooter alignSelf={"end"}>
                    <Button colorScheme='blue'> Run </Button>
                </CardFooter>
            </Card> 

            {/* Write Block */}
            <Card>
                <CardHeader>
                    <Stack direction={'row'}>
                        <Heading size={'sm'}> Write Block </Heading>
                        <Badge colorScheme='green'>Success</Badge>
                    </Stack>
                </CardHeader>
                <CardBody mt={-5} mb={-5}>
                    <Text>Result</Text>
                    
                    <Textarea readOnly>
                    </Textarea>
                </CardBody>
                <CardFooter alignSelf={"end"}>
                    <Button colorScheme='blue'> Run </Button>
                </CardFooter>
            </Card>    

            {/* HALT */}
            <Card>
                <CardHeader>
                    <Stack direction={'row'}>
                        <Heading size={'sm'}> HALT </Heading>
                        <Badge colorScheme='green'>Success</Badge>
                    </Stack>
                </CardHeader>
                <CardBody mt={-5} mb={-5}>
                    <Text>Result</Text>
                    
                    <Textarea readOnly>
                    </Textarea>
                </CardBody>
                <CardFooter alignSelf={"end"}>
                    <Button colorScheme='blue'> Run </Button>
                </CardFooter>
            </Card>          
        </SimpleGrid>
        </>
    );
}