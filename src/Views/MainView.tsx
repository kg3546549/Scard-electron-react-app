import React, {useState, useEffect} from 'react';

import { 
  ChakraProvider, 
  Button, 
  ButtonGroup, 
  Box, 
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Textarea,
  Card, CardHeader, CardBody, CardFooter,
  Heading, Grid, GridItem, SimpleGrid, InputGroup, InputRightAddon,Center,
  Text, Input
} from '@chakra-ui/react'

import {Command, Sender, Result} from "@scard/protocols/ReaderRequest"
import Sidebar from './Sidebar';

export const MainView = () => {
  return (
    <Sidebar/>
  );
}

