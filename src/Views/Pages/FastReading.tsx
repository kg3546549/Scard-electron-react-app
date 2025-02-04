import React, { ReactNode, useState } from 'react'

import {
  Card, Flex, Heading, Text, VStack, HStack, Spacer, Box, Button,
  Tabs, TabList, TabPanels, Tab, TabPanel, Stack, Select
} from '@chakra-ui/react'


import { 
  IoIdCardOutline 

} from "react-icons/io5";


function moveFunc() {
  setInterval(()=>{

  }, 1);
}


const CardTagTab = () => {


  return (
    <>
      
      <Stack align={'center'} justify={'center'} >
        <HStack>
          <Heading size={'sm'}>리더 선택 : </Heading>
          <Select placeholder='Select Reader' bgColor='white' w={350} onChange={ (e)=>{console.log(e)} }>
            <option value={0}> [0] ACR122U </option>
            <option value={1}> [1] ACR122U </option>
            <option value={2}> [2] ACR122U </option>
          </Select>
        </HStack>
        <Flex align={"center"} justify={"center"}>
          <Card h={350} w={250} bgColor={"blue.200"} shadow={"2xl"} borderRadius={30}>
            <Flex h={"100vh"} align={"center"} justify={"center"}>
              <VStack>
                <IoIdCardOutline size={100} color='white'/>
                <Spacer/>
                <Text color={"white"} fontSize={20} fontWeight={900}>  
                    카드를 태그해주세요
                </Text>
              </VStack>
            </Flex>
          </Card>
          <Box display={"none"}>
            asdf
          </Box>
        </Flex>
      </Stack>
    </>
  );
}


export const FastReading = () => {

  const [widAni, setWidAni] = useState("open");

  return (
    <>
    <Heading>Fast Reading</Heading>
    <Tabs>
      <TabList>
        <Tab>Reader Select</Tab>
        <Tab>Tab Card</Tab>
        <Tab>Result</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <p>one!</p>
        </TabPanel>
        <TabPanel>

          <CardTagTab/>

        </TabPanel>
        <TabPanel>
          <p>three!</p>
        </TabPanel>
      </TabPanels>
      
    </Tabs>
    </>
  );
}