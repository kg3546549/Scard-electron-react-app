/**
 * App Component
 * 애플리케이션 진입점
 */

import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout';
import {
  MifareReadingPage,
  ISO7816TransmitPage,
  ISO7816DiagramPage,
  DriverTestPage,
  SettingsPage,
} from './pages';
import { theme } from './theme/theme';

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
