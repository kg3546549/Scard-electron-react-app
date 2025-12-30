import { Status } from './status.types';

export type ComponentUUID = {
    SocketConnect: any;
    EstablishContext: any;
    ReaderList: any;
};

export type UUIDTYPE = string;

export interface ComponentData {
    data: any;
    status: Status;
    uuid: UUIDTYPE;
}

export enum Result {
    Success = "Success",
    Failure = "Failure",
}
