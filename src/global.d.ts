export {};

declare global {
  interface Window {
    api: {
      reader: (e:string) => Promise<string>;
    };
  }
}