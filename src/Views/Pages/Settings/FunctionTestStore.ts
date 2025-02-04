import { create } from 'zustand';

interface RequestState {
    //string에는 UUID가 들어감...
    responses: Record<string, any>;
    pendingRequests: Set<string>;
    addPendingRequest: (id: string) => void;
    receiveResponse: (id: string, response: any) => void;
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