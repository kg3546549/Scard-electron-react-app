import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  fonts: {
    heading: `'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
    body: `'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
  },
  colors: {
    brand: {
      50: '#E5F1FB', // Light background for active items
      100: '#BBDCF2',
      200: '#8AC4E9',
      300: '#59ACDF',
      400: '#2894D6',
      500: '#0072CE', // Main S1 Blue
      600: '#005BA5',
      700: '#00447C',
      800: '#002D53',
      900: '#00162A',
    },
    action: {
      500: '#FF312C', // Destructive actions or highlights
    },
    ui: {
      bg: '#F4F4F4',   // Main app background
      white: '#FFFFFF',
      border: '#E2E8F0',
    },
  },
});
