const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const net = require('net');
const {Command, Sender, Result} = require('@scard/protocols/ReaderRequest');

const client = new net.Socket();
let clientStatus = false

let mainWindow;

client.on('close', () => {
    console.log("socket Closed");
    clientStatus = false;
});

client.on('error', (err)=> {
    console.log("socket Error Occured");
    clientStatus = false;
})

client.on('data', (data)=> {
    console.log("Socket Data Received!");
    console.log(data);
    const json = JSON.parse( data.toString('utf-8') );

    let result = json["result"]==99?"Fail":"Success";
    console.log(`Result : ${result}`);

    console.log(json);

    mainWindow.webContents.send('channel', json);

})

function createWindow() {
    /*
    * 넓이 1920에 높이 1080의 FHD 풀스크린 앱을 실행시킵니다.
    * */
    mainWindow = new BrowserWindow({
        width:600,
        height:600,
        webPreferences : {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    /*
    * ELECTRON_START_URL을 직접 제공할경우 해당 URL을 로드합니다.
    * 만일 URL을 따로 지정하지 않을경우 (프로덕션빌드) React 앱이
    * 빌드되는 build 폴더의 index.html 파일을 로드합니다.
    * */
    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '/../build/index.html'),
        protocol: 'file:',
        slashes: true
    });

    /*
    * startUrl에 배정되는 url을 맨 위에서 생성한 BrowserWindow에서 실행시킵니다.
    * */
    mainWindow.loadURL(startUrl);

    

}

app.on('ready', createWindow);




function ReaderControl(cmd, data, client) {
    switch(cmd) {
        
        case Command.Cmd_Socket_Connect :

            if( clientStatus == false ) {
                client.connect(12345,'127.0.0.1', ()=>{
                    console.log("Socket Connection Success")
                    clientStatus = true;
                });
            }
            else {
                console.log("Socket is Already Connected!");
            }
        break;

        case Command.Cmd_Socket_Disconnect :
        case Command.Cmd_SCard_Establish_Context : 
        case Command.Cmd_SCard_Reader_List : 
        case Command.Cmd_SCard_Connect_Card : 
        case Command.Cmd_MI_Get_UID:         
        {
            if( clientStatus == false ) {
                console.log("Socket is not connect");
                break;
            }

            let requestCmd = {
                "cmd": cmd,
                "sender": Sender.Request,
                "msgCnt": 1,
                "result": Result.Default_Fail,
                "dataLength": 0,
                "data": []
            }

            let requestJson = JSON.stringify(requestCmd);
            
            client.write(requestJson);
        }
        break;
        case Command.Cmd_MI_Load_Key : {
            if( clientStatus == false ) {
                console.log("Socket is not connect");
                break;
            }

            let requestCmd = {
                "cmd": cmd,
                "sender": Sender.Request,
                "msgCnt": 1,
                "result": Result.Default_Fail,
                "dataLength": 0,
                "data": ['A', 'FFFFFFFFFFFF']
            }

            let requestJson = JSON.stringify(requestCmd);
            
            client.write(requestJson);
        }
        break;
        case Command.Cmd_MI_Authentication : {
            if( clientStatus == false ) {
                console.log("Socket is not connect");
                break;
            }

            let requestCmd = {
                "cmd": cmd,
                "sender": Sender.Request,
                "msgCnt": 1,
                "result": Result.Default_Fail,
                "dataLength": 0,
                "data": ['0', 'A']
            }

            let requestJson = JSON.stringify(requestCmd);
            
            client.write(requestJson);
        }

        break;
        case Command.Cmd_MI_Read_Block : {
            if( clientStatus == false ) {
                console.log("Socket is not connect");
                break;
            }

            let requestCmd = {
                "cmd": cmd,
                "sender": Sender.Request,
                "msgCnt": 1,
                "result": Result.Default_Fail,
                "dataLength": 0,
                "data": data[0]
            }

            let requestJson = JSON.stringify(requestCmd);
            
            client.write(requestJson);
        }
        break;
    }
}

ipcMain.on("channel", (event, cmd) => {
    console.log(":: From Renderer Process ::", cmd);
    // event.sender.send("channel", "From Main Process"+data);
    

    console.log("clientStatus : " + clientStatus);
    console.log(`cmd : ${cmd}`);

    ReaderControl(cmd,[],client);
});


ipcMain.on("action", (event, cmd) => {
    switch(cmd[0]) {
        case "ReadBlockBtn" : {
            let sector = parseInt(cmd[1]);

            for(let i=0;i<4;i++) {
                ReaderControl( Command.Cmd_MI_Read_Block, (sector*4)+i, client );
            }

        }
        break;

    }
})