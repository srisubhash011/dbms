import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#090d16',
      paper: '#0f172a',
    },
    primary: {
      main: '#6366f1',
    },
    secondary: {
      main: '#a855f7',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Box sx={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #090d16 70%)' }}>
            <Navbar />
            <AppRoutes />
          </Box>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
