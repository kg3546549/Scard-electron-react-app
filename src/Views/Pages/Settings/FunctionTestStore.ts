import { ProtocolData } from '@scard/protocols/ReaderRequest';
import { create } from 'zustand';

//View에 출력될 데이터들을 여기에 적어야 함.

export type Status =  "ready" | "processing" | "Success" | "Fail";

export type ComponentData = {
    data : {};
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
  
export const useRequestStore = create<RequestState>((set) => ({
    responses: {},
    pendingRequests: new Set(),

    addPendingRequest: (id) =>
        set((state) => ({
        pendingRequests: new Set(state.pendingRequests).add(id),
    })),

    receiveResponse: (id, response) =>
        set((state) => {
        if (!state.pendingRequests.has(id)) return state;
        const newPending = new Set(state.pendingRequests);
        newPending.delete(id);
        return {
            responses: { ...state.responses, [id]: response },
            pendingRequests: newPending,
        };
    }),
}));