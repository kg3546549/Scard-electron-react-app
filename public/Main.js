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
    * 넓이 600 높이 600 FHD 풀스크린 앱을 실행시킵니다.
    * */
    mainWindow = new BrowserWindow({
        width:600,
        height:600,
        webPreferences : {
            nodeIntegration: true,
            contextIsolation: false,
        },
        autoHideMenuBar: true,
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




function ReaderControl(cmd,uuid,data) {
    let responseData = {
        cmd: cmd,
        sender: Sender.Response,
        msgCnt: 1,
        uuid: uuid,
        result: Result.Default_Fail,
        dataLength: 0,
        data: [],
    }

    switch(cmd) {
        
        case Command.Cmd_Socket_Connect :{
            if( clientStatus == false ) {
                client.connect(12345,'127.0.0.1', ()=>{
                    console.log("Socket Connection Success")
                    clientStatus = true;
                    responseData.data.push("Socket Connection Success");
                    responseData.result = Result.Success;

                    console.log(responseData);
                    mainWindow.webContents.send('channel', responseData);
                });
            }
            else {
                console.log("Socket is Already Connected");
                responseData.result = Result.Default_Fail;
                responseData.data.push("Socket is Already Connected");

                console.log(responseData);
                mainWindow.webContents.send('channel', responseData);
            }

            
        }
        break;

        case Command.Cmd_Socket_Disconnect : {
            if( clientStatus == true ) {
                client.destroy();
                clientStatus = false;
                console.log("Socket Close Success");

                responseData.data.push("Socket Close Success");
                responseData.result = Result.Success;
            }
            else {
                console.log("Socket is not Connected");

                responseData.result = Result.Default_Fail;
                responseData.data.push("Socket is not Connected");
            }
            console.log(responseData);
            mainWindow.webContents.send('channel', responseData);
        }
        break;


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
                "uuid" : uuid,
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
                "uuid" : uuid,
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
                "uuid" : uuid,
                "result": Result.Default_Fail,
                "dataLength": 0,
                "data": data
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
                "uuid" : uuid,
                "result": Result.Default_Fail,
                "dataLength": 0,
                "data": data
            }

            let requestJson = JSON.stringify(requestCmd);
            
            client.write(requestJson);
        }
        break;
    }
}

//channel에는 cmd:number타입 하나만 받아서 이렇게 해놓은 듯....
/*
cmd = {
    cmd:Command
    uuid:string
}
*/
ipcMain.on("channel", (event, cmd) => {
    console.log(":: From Renderer Process ::", cmd);
    // event.sender.send("channel", "From Main Process"+data);
    console.log("clientStatus : " + clientStatus);
    console.log("cmd : ",cmd);

    ReaderControl(cmd.cmd, cmd.uuid,[]);
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

ipcMain.on("action", async (event, cmd) => {
    switch(cmd[0]) {
        case "ReadBlockBtn" : {
            let sector = parseInt(cmd[1]);
            console.log("read block : ");
            console.log("Authentication sector : " + `${0+(sector*4)}`);
            ReaderControl( Command.Cmd_MI_Authentication, [`${0+(sector*4)}`, 'A'], client );
            await delay(5);

            for(let i=0;i<4;i++) {
                console.log([`${i+(sector*4)}`]);
                ReaderControl( Command.Cmd_MI_Read_Block, [`${i+(sector*4)}`], client );
                await delay(5);
            }

        }
        break;

    }
})



ipcMain.on("requestChannel", async (event, requestData) => {



});