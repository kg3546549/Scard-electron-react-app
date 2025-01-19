import React, { useState } from 'react';
import { io } from "socket.io-client";
import { json } from "stream/consumers";


export const Winscard = () => {
  const [socket,setSocket] = useState(null);

  const connectSocket = ()=> {
    if(!socket) {
      const socket = io('127.0.0.1:12345');
  
      socket.on('connection', ()=>{
        console.log("Connection Success")
      })
    }
  }

}

export function Winscard_EstablishedContext() {
  
  

}