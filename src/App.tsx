import React, {useState, useEffect} from 'react';


import './App.css';
import { 
  ChakraProvider, 
  Button, 
  Box, 
  Card, CardHeader, CardBody, CardFooter,
  Heading, GridItem,
  Text
} from '@chakra-ui/react'

// import {Command, Sender, Result, ProtocolData} from "@scard/protocols/ReaderRequest"
 
import Sidebar from './Views/Sidebar';
// import {MainView} from './Views/MainView';
import { BrowserRouter } from 'react-router-dom';


function App() {
 
  return (
    <ChakraProvider>
      <BrowserRouter>
        <Sidebar/>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;

