# TODOs

## `NOT YET` Server Card Driver 관련
  - Driver에서 6300이던 9000이던간에 신경쓰지말고 Return하기
  - SCard_Success이기만 하면 나머지는 프론트에서 처리하도록 하는것이 좋을 듯.

## `NOT YET` Client Card Driver 관련
  - 모든 카드관련 기능들 함수로 만들기. (250203)
  - ipc를 통한 컨트롤은 함수에서 하고, 함수로 가독성 올려놓기. (250203)

## `NOT YET` Main Process에서 Client접속 실패 시 Renderer Process로 전송해야 함. (250209)
Socket Client 접속 error시에 실패코드를 전송해야 하는데, uuid를 전송할 수 없음.
따로 socket client용 wrapper를 만들어야 하나...?
js를 몰라서 모르겠네 어휴

## `NOT YET` Zustand 라이브러리 관련
  - 

## `DONE` 하위 Component 데이터 출력 관련
1. 특정 컴포넌트에서 버튼을 조작하면(함수를 실행하면)
2. 렌더러 프로세스에서 ipcRenderer.send를 통해 데이터를 전송
3. 메인 프로세스에서 Socket을 통해 데이터를 전송
4. 백그라운드 프로세스에서 소켓으로 데이터를 수신한 후에 데이터를 처리하고,
    결과를 소켓으로 응답.
5. 그걸 메인 프로세스에서 다시 받아서 렌더러 프로세스로 데이터를 보내면
    해당 컴포넌트가 업데이트

### 문제점 : 어느 컴포넌트에서 요청했는지를 몰라 응답을 어떤 컴포넌트에서 출력시켜야 하는지를 모름.
렌더러 프로세스에서 보낸 데이터가 어떤 컴포넌트에서 실행됬는지를 몰라서
데이터를 수신한 후에 컴포넌트에 데이터를 출력시킬 때 어떻게 해당 컴포넌트에 출력되게 하는지를 모르겠음

### 해결방안 : 요청에 고유 ID를 적용하여 처리
컴포넌트마다 고정된 ID를 부여하는게 아니라, 요청할 때 ID를 부여하고 이를 컴포넌트에서 출력하게 함.

> ChatGPT : 맞아요! 요청할 때마다 동적으로 고유한 ID를 부여하고, 이 ID를 통해 각 요청을 추적하는 방식입니다. 즉, 컴포넌트마다 고정된 ID를 부여하는 게 아니라 요청할 때마다 새로운 고유 ID를 생성하여 그 ID에 대응하는 응답을 출력하게 됩니다.

### 동작 Flow
1. 요청 시 ID 부여

2. 요청을 보낼 때마다 uuid나 다른 방식으로 고유한 ID를 생성.
예를 들어, uuidv4()를 사용해 각 요청에 ID를 부여할 수 있음.

3. ID로 요청 추적
요청을 보내는 쪽에서 그 ID를 사용해 어떤 요청이 완료되었는지 추적하고, 해당 응답을 받아 출력할 수 있도록 함.

응답을 받을 때 ID로 매핑
응답을 받을 때, 해당 응답에 요청 ID를 포함시키고, 렌더러 프로세스에서 해당 ID를 통해 응답을 출력할 컴포넌트를 결정합니다.

## 해야 할 것
1. Store에 <UUID, Data> 형식의 Map을 만듬. UUID에다가 요청 Data를 넣어놓으면 해당 UUID의 데이터가 변경되면 재렌더링되어 화면에 표시됌
2. MainProcess에 UUID와 같이 데이터를 전송하도록 JSON필드 만들어야 함.
3. 백그라운드 Driver에 UUID를 받아서 그대로 리턴하기만 하면 되니까. 얘는 안건드려도 될 것 같다는 희망적인 사고가 돌아가기 시작했음.
4. MainProcess가 그걸 받아서 다시 Renderer Process에 전달해야 함.
5. 데이터를 받으면 Zustand Store에 결과값을 저장하면.
6. 원래 Null이었던 데이터가 값이 있는 데이터로 바뀌면서 화면에 출력됌~
``` javascript
componentUUID.SocketConnect && responses[componentUUID.SocketConnect!]?
                responses[componentUUID.SocketConnect!].data:""
```
Socket Connect에 UUID가 부여되어 있고, response에서 UUID로 SocketConnect로 조회했을 때 있다면,

response에서 값을 찾아서 return한다. 아니면 ""을 쓴다.


## `NOT YET` APDU 전송을 Diagram을 리딩 Flow 순서대로 배치해서 리딩하는 기능.
Custom APDU를 넣어서 동작하도록 함