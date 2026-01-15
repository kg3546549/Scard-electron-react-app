import { create } from 'zustand';

interface SidebarState {
  isCollapsed: boolean;
  activePage: string;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setActivePage: (pageId: string) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  activePage: 'mifare', // Default active page
  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
  setActivePage: (pageId) => set({ activePage: pageId }),
}));
