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

  //TODO : Rendering 되면 ipcRenderer 통해서 Background Process 실행 요청, 성공 시에 응답 후 Socket Connection까지 여기서 하도록.
  

  return (
    <ChakraProvider>
      <BrowserRouter>
        <Sidebar/>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;

