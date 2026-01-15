# Design System & Layout Documentation

This document outlines the design system, layout structure, and component definitions for the S1 CSNConverter project. It is intended to be used by agents and developers to maintain design consistency across the application.

## 1. Design Tokens (Theme)

The project uses `Chakra UI` with a custom theme defined in `src/renderer/app/theme/theme.ts`.

### Colors

*   **Brand (Primary Blue)**: Used for primary actions, active states, and branding.
    *   `brand.500`: #0072CE (Main S1 Blue)
    *   `brand.50`: #E5F1FB (Light background for active items)
*   **Action (Secondary Red)**: Used for destructive actions or highlights.
    *   `action.500`: #FF312C
*   **UI (Neutrals)**:
    *   `ui.bg`: #F4F4F4 (Main app background)
    *   `ui.white`: #FFFFFF
    *   `ui.border`: #E2E8F0

### Typography

*   **Font Family**: `'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif`
*   Applied globally to `heading` and `body`.

---

## 2. Layout Architecture

The application layout consists of a **Sidebar** (currently hidden/inactive), a **Header** (top bar), and a **Main Content** area.

### Folder Structure
*   `src/renderer/app/layout/`
    *   `AppLayout.tsx`: Main layout container.
    *   `Header.tsx`: Top navigation and window controls.
    *   `Sidebar.tsx`: Left navigation menu (contains the hidden code).
*   `src/renderer/app/store/`
    *   `useSidebarStore.ts`: State management for sidebar visibility and navigation.

---

## 3. Sidebar Component (Currently Hidden)

The `Sidebar` is a collapsible navigation menu. It handles navigation between modules (e.g., Dashboard, CSN Converter).

### Features
*   **Collapsible**: Toggles between 240px and 70px width.
*   **State**: Managed via `useSidebarStore`.
*   **Styling**: White background, right border, fixed height.

### Code: `src/renderer/app/layout/Sidebar.tsx`

```tsx
import React from 'react';
import { Box, Flex, Text, IconButton, Tooltip, VStack, Icon, Divider } from '@chakra-ui/react';
import { FiMenu, FiHome, FiSettings, FiCreditCard, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useSidebarStore } from '../store/useSidebarStore';

const MODULES = [
  { id: 'dashboard', name: 'Dashboard', icon: FiHome, path: '/' },
  { id: 'csn-converter', name: 'CSN 변환기', icon: FiCreditCard, path: '/csn' },
];

const Sidebar: React.FC = () => {
  const { isCollapsed, toggleSidebar, activePage, setActivePage } = useSidebarStore();

  return (
    <Box
      as="nav"
      w={isCollapsed ? '70px' : '240px'}
      h="100vh"
      bg="white"
      borderRight="1px solid"
      borderColor="ui.border"
      transition="width 0.2s ease-in-out"
      zIndex={100}
    >
      <Flex direction="column" h="full">
        {/* Branding Area */}
        <Flex h="64px" align="center" justify={isCollapsed ? 'center' : 'flex-start'} px={isCollapsed ? 0 : 6} borderBottom="1px solid" borderColor="ui.border">
          <Text fontSize="xl" fontWeight="bold" color="brand.500">{isCollapsed ? 'S1' : 'S1 Tools'}</Text>
        </Flex>

        {/* Menu Items */}
        <VStack spacing={1} align="stretch" p={2} flex={1}>
          {MODULES.map((module) => {
            const isActive = activePage === module.id;
            return (
              <Tooltip key={module.id} label={isCollapsed ? module.name : ''} placement="right" hasArrow isDisabled={!isCollapsed}>
                <Flex
                  align="center"
                  p={3}
                  cursor="pointer"
                  borderRadius="md"
                  bg={isActive ? 'brand.50' : 'transparent'}
                  color={isActive ? 'brand.600' : 'gray.600'}
                  fontWeight={isActive ? 'bold' : 'normal'}
                  _hover={{ bg: 'brand.50', color: 'brand.600' }}
                  onClick={() => setActivePage(module.id)}
                  justify={isCollapsed ? 'center' : 'flex-start'}
                >
                  <Icon as={module.icon} boxSize={5} />
                  {!isCollapsed && <Text ml={3} fontSize="sm">{module.name}</Text>}
                </Flex>
              </Tooltip>
            );
          })}
        </VStack>

        {/* Footer / Toggle */}
        <Box p={2} borderTop="1px solid" borderColor="ui.border">
           <Flex justify={isCollapsed ? 'center' : 'flex-end'}>
             <IconButton
               aria-label="Toggle Sidebar"
               icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
               size="sm"
               variant="ghost"
               onClick={toggleSidebar}
             />
           </Flex>
        </Box>
      </Flex>
    </Box>
  );
};
export default Sidebar;
```

### State Store: `src/renderer/app/store/useSidebarStore.ts`

```typescript
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
  activePage: 'csn-converter',
  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
  setActivePage: (pageId) => set({ activePage: pageId }),
}));
```

---

## 4. Header Component

The `Header` provides window controls (Minimize, Close) and application title.

### Key Styles
*   **Height**: `64px`
*   **Background**: `white`
*   **Border Bottom**: `1px solid ui.border`
*   **Drag Region**: Uses `WebkitAppRegion: 'drag'` for Electron window dragging.

---

## 5. Integrating Sidebar (Restoring Visibility)

To restore the Sidebar, modify `src/renderer/app/layout/AppLayout.tsx` to include the `<Sidebar />` component alongside the main content Flex container.

### `AppLayout.tsx` Integration Example

```tsx
import React from 'react';
import { Flex, Box } from '@chakra-ui/react';
import Header from './Header';
import Sidebar from './Sidebar'; // Import the Sidebar

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <Flex h="100vh" w="100vw" overflow="hidden">
      
      {/* 1. Add Sidebar Here */}
      <Sidebar /> 

      {/* Main Content Area */}
      <Flex direction="column" flex={1} bg="ui.bg" position="relative" overflow="hidden">
        <Header />
        
        <Box flex={1} overflow="hidden" px={4} py={4}>
            {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default AppLayout;
```
