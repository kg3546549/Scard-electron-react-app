export {};

declare global {
  interface Window {
    api: {
      reader: (e:ProtocolData) => Promise<ProtocolData>;
      socket: (e:string[]) => Promise<string[]>;
    };

    electron: {
      ipcRenderer: {
        send: (channel: string, data: any) => void;
        invoke: (channel: string, data: any) => Promise<any>;
        on: (channel: string, listener: (...args: any[]) => void) => void;
        off: (channel: string, listener: (...args: any[]) => void) => void;
      };
    };
  }
}