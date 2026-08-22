import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  searchDrawerOpen: boolean;
  setSearchDrawerOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  searchDrawerOpen: false,
  setSearchDrawerOpen: (open: boolean) => set({ searchDrawerOpen: open }),
}));
