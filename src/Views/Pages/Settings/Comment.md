# FunctionTestView Comments

## 1. 각 테스트 별 버튼을 눌렀을 때 동작 Flow

### 동작 Flow
1. UUID 생성
    - 이 UUID는 어떤 컴포넌트에서 요청을 실행했는지 알기 위함임
2. MainProcess로 명령 전송
    - WinscardUtils - ReaderCtrl()에 UUID와 함께 요청 전송
    > (?그냥 애초에 RendererProcess에서 json만들어서 MainProcessor에서는 그대로 보내기만 하면 안돼나...?)

    - Zustand Store의 MAP에 UUID 추가.
    (나중에 여기에 UUID를 Key로 하여 Data를 참조시키도록 함)
    - componentUUID UUID등록.
    - 해당 컴포넌트에 UUID가 생기는것


3. BackgroundProcess에 Socket이용하여 명령 전송
    - MainProcess에서 명령 수신하여 JSON으로 파싱하여 명령을 전송함.
    
4. BackgroundProcess에서 명령 처리하여 Socket으로 데이터 응답(winscard-server 참조)

5. MainProcessor에서 데이터 수신하여 파싱 후 RendererProcess로 전달

6. RendererProcessor의 ipcRenderer Listener에서 수신

7. 수신한 데이터에서 UUID를 KEY로 하여 Store에 데이터를 삽입.

8. 이렇게 하면 버튼을 누른 컴포넌트에는 UUID로 데이터바인딩이 되어있기 떄문에 UUID에 매핑된 데이터가 변경되면 재렌더링 됌






### 상세 내용
#### 1. UUID생성
``` Javascript
const newUUID = uuidv4();
```