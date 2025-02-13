
type UUIDTYPE = string | null;
type ComponentUUID = {
  SocketConnect: UUIDTYPE;
  EstablishContext: UUIDTYPE;
  ReaderList: UUIDTYPE;
  ConnectCard: UUIDTYPE;
  Transmit:UUIDTYPE;
  GetATR : UUIDTYPE;
  GetUID: UUIDTYPE;
  LoadKey: UUIDTYPE;
  Authentication: UUIDTYPE;
  ReadBlock: UUIDTYPE;
  WriteBlock: UUIDTYPE;
  HALT: UUIDTYPE;
};

type Status =  "ready" | "processing" | "success" | "fail";

type ComponentData = {
    data : string[];
    uuid : string;
    status : Status;
}

interface RequestState {
    //string에는 UUID가 들어감...
    responses: Record<string, ComponentData>;
    pendingRequests: Set<string>;
    addPendingRequest: (id: string) => void;
    receiveResponse: (id: string, response: ComponentData) => void;
}



