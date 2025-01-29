import React, { ReactNode, useState } from 'react'

import {Card, Flex, Heading, Text, VStack, Spacer, Box, Button} from '@chakra-ui/react'

import { 
  IoIdCardOutline 

} from "react-icons/io5";


function moveFunc() {
  setInterval(()=>{

  }, 1);
}

export const FastReading = () => {

  const [widAni, setWidAni] = useState("open");

  return (
    <>
    <VStack>
      <Flex h={"100vh"} align={"center"} justify={"center"}>
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
    </VStack>
    </>
  );
}