/**
 * App Component
 * 애플리케이션 진입점
 */

import React from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout';
import {
  MifareReadingPage,
  ISO7816TransmitPage,
  ISO7816DiagramPage,
  DriverTestPage,
  SettingsPage,
} from './pages';

// Extend the theme to include custom fonts and colors
const theme = extendTheme({
  fonts: {
    heading: `'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
    body: `'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
  },
  colors: {
    brand: {
      50: '#E5F1FA',
      100: '#BBDCF2',
      200: '#8AC4E9',
      300: '#59ACDF',
      400: '#2894D6',
      500: '#0072CE', // S1 Tools Primary Brand Color
      600: '#005BA5',
      700: '#00447C',
      800: '#002D53',
      900: '#00162A',
    },
    ui: {
      border: '#E2E8F0', // Default border color
    }
  }
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/mifare" replace />} />
            <Route path="mifare" element={<MifareReadingPage />} />
            <Route path="iso7816" element={<ISO7816TransmitPage />} />
            <Route path="diagram" element={<ISO7816DiagramPage />} />
            <Route path="driver-test" element={<DriverTestPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </ChakraProvider>
  );
}

export default App;
