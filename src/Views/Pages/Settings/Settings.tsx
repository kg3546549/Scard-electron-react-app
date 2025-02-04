import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import React, { ReactNode } from "react";
import { General } from "./GeneralSetting";
import { FunctionTest } from "./FunctionTestVIew";

export const Settings = () => {
  return (
    <>
      <Tabs>
        <TabList>
          <Tab>General</Tab>
          <Tab>Function Test</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <General />
          </TabPanel>
          <TabPanel>
            <FunctionTest />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
