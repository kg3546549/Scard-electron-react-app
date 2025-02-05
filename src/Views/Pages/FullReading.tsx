import React, { ReactNode } from 'react'

import {
  Heading, 
  Tabs, TabList, TabPanels, Tab, TabPanel, 
//   Card, Flex, 
//   Text, VStack, HStack, Spacer, Box, Button,
//   Stack, Select
} from '@chakra-ui/react'

export const FullReading = () => {
    return (
        <>
        <Heading>Full Reading</Heading>
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

                <p>Two!</p>

            </TabPanel>
            <TabPanel>
                <p>three!</p>
            </TabPanel>
            </TabPanels>
        </Tabs>
        </>
    );
}