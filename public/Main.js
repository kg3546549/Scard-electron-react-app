const {app, BrowserWindow, ipcMain, session} = require('electron');

const { spawn } = require('child_process');

const path = require('path');
const url = require('url');
const net = require('net');
const {Command, Sender, Result} = require('@scard/protocols/ReaderRequest');
const { electron } = require('process');
const windowStateKeeper = require('electron-window-state');

const client = new net.Socket();
let clientStatus = false


require('electron-reload')(__dirname, {
    electron: require(`${__dirname}/../node_modules/electron`)
});

let mainWindow;


//Notebook reactDevToolsPath
// const reactDevToolsPath = path.join(
//     'C:/Users/S1SECOM/AppData/Local/Google/Chrome/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/6.1.1_0'
// )


function createWindow() {
    //위치 저장
    let mainWindowState = windowStateKeeper({
        defaultWidth: 800,
        defaultHeight: 600
    });

    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width:1300,
        height:800,
        webPreferences : {
            preload: path.join(__dirname, "../src/preload.js"),
            // nodeIntegration: true,
            // contextIsolation: false,
            
            
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

    mainWindowState.manage(mainWindow);
}


//DevTools
// app.whenReady().then(async () => {
//     await session.defaultSession.loadExtension(reactDevToolsPath)
// });

app.on('ready', createWindow);


client.on('close', () => {
    console.log("socket Closed");
    clientStatus = false;
});

client.on('error', (err)=> {

    console.log("socket Error Occured");
    clientStatus = false;

    mainWindow.webContents.send('channel', responseData);
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


//background Process 실행
// const exePath = __dirname+"/../winscard-driver/winscard-pcsc.exe";
// const args = ['arg1', 'arg2'];
// const child = spawn(exePath, args);


/**
 * @description IPC Listener to Renderer Process
 * @param requestData : ProtocolData
 */
ipcMain.on("requestChannel", async (event, requestData) => {

    console.log(":: IPC request Channel ::");
    console.log(requestData);

    let responseData = {
        cmd: requestData.cmd,
        sender: Sender.Response,
        msgCnt: 1,
        uuid: requestData.uuid,
        result: Result.Default_Fail,
        dataLength: 0,
        data: [],
    }

    switch(requestData.cmd) {
        case Command.Cmd_Socket_Execute: {
            console.log("Execute");
            

            return;
        }
        break;

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
        case Command.Cmd_Scard_Release_Context :
        case Command.Cmd_SCard_Transmit :
        case Command.Cmd_MI_Get_UID :
        default :
        {
            if(clientStatus == false) {
                responseData.data.push("Socket is not connected");
                mainWindow.webContents.send('channel', responseData);
                return;
            }
            console.log("  - request to background process");
            requestJSON = JSON.stringify(requestData)
            client.write(requestJSON);
        }
        break;
    }
    

});



ipcMain.handle("reader", async (e, data) => {
    console.log(":: ipcMain - reader ::");
    // console.log(e);
    console.log(data);
    return ["TEST!!"+data];
});


const connectToServer = (port, host) => {
    return new Promise((resolve, reject) => {
        client.connect(port, host, () => {
        console.log('Socket Connection Success');
        clientStatus = true;
        resolve(); // 연결 성공 시 resolve
        });

        client.on('error', (err) => {
        console.error('Connection Error:', err);
        reject(err); // 오류 발생 시 reject
        });
    });
};

ipcMain.handle("socket", async (e, data) => {

    switch (data[0]) {
        case "connect" : {
            if( clientStatus == false ) {
                await connectToServer(12345, "127.0.0.1");
                return ["Success"]
            }
            else {
                console.log("Socket is Already Connected");
                return ["Fail"];
            }
        }
        break;

        case "disconnect" : {
            if( clientStatus == true ) {
                client.destroy();
                clientStatus = false;
                console.log("Socket Close Success");

                return ["Success"];
            }
            else {
                console.log("Socket is not Connected");

                return ["Fail"];
            }
        }
        break;

        default : {
            return ["error"]
        }
        break;
    }
})