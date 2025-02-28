import { Tabs, TabList, Tab, TabPanels, TabPanel, Heading } from "@chakra-ui/react";
import React, { ReactNode } from "react";
import { General } from "./GeneralSetting";
import { FunctionTest } from "./FunctionTestVIew";

import { FunctionTestV2 } from "./FunctionTestV2";

export const Settings = () => {
  return (
    <>
      <Heading>SETTINGS</Heading>
      <Tabs>
        <TabList>
          <Tab>General</Tab>
          <Tab>Function Test</Tab>
          {/* <Tab>Function Test V2</Tab> */}
        </TabList>
        <TabPanels>
          <TabPanel>
            <General />
          </TabPanel>
          <TabPanel>
            <FunctionTest />
          </TabPanel>
          {/* <TabPanel>
            <FunctionTestV2/>
          </TabPanel> */}
        </TabPanels>
      </Tabs>
    </>
  );
};
