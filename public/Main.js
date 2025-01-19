const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const net = require('net');
const {Command, Sender, Result} = require('./Protocols/ReaderRequest.js');

function createWindow() {
    /*
    * 넓이 1920에 높이 1080의 FHD 풀스크린 앱을 실행시킵니다.
    * */
    const win = new BrowserWindow({
        width:800,
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
    win.loadURL(startUrl);

}

app.on('ready', createWindow);

ipcMain.on("channel", (event, data) => {
    console.log(":: From Renderer Process ::", data);
    // event.sender.send("channel", "From Main Process"+data);
    
    //TODO : Command 구조 정리하기
    if(data == "Cmd_SCard_Establish_Context") {
        let requestCmd = {
            "cmd": Command.Cmd_SCard_Establish_Context,
            "sender": Sender.Request,
            "msgCnt": 1,
            "result": Result.Success,
            "dataLength": 5,
            "data": ["Test1", "Test2", "Test3", "Test4", "Test5"]
        }

        let requestJson = JSON.stringify(requestCmd);
        const client = new net.Socket();
        client.connect(12345,'127.0.0.1', ()=>{
            client.write(requestJson);
        });
    }
});