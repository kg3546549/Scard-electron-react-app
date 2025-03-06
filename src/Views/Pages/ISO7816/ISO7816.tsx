import React, { ReactNode } from 'react'
import { Tabs, TabList, Tab, TabPanels, TabPanel, Heading } from "@chakra-ui/react";

import { APDUTransmitView } from './APDUTransmitView';
import { APDUFlowView } from './APDUFlowView';

export const ISO7816 = () => {
    return (
        <>
        <Heading size={"lg"}>ISO7816 Smart Card</Heading>
        <Tabs>
        <TabList>
            <Tab>APDU Transmit</Tab>
            <Tab>Smart Card Read Flow</Tab>
            {/* <Tab>Function Test V2</Tab> */}
        </TabList>
        <TabPanels>
            <TabPanel>
                <APDUTransmitView />
            </TabPanel>
            <TabPanel>
                <APDUFlowView />
            </TabPanel>
        </TabPanels>
        </Tabs>
        </>
    );
}