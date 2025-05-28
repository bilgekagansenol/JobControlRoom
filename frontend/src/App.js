import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, CssBaseline, CircularProgress, Box, Typography } from '@mui/material';
import theme from './theme';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';

// Auth kontrolü ve yükleme durumu için yardımcı bileşen
const AuthenticatedApp = () => {
  const { isAuthenticated, user, isLoading, error } = useAuth();
  
  console.log('AuthenticatedApp:', { 
    isAuthenticated, 
    user: user ? `${user.name} (${user.username})` : 'yok', 
    isLoading 
  });

  // Yükleniyor durumu
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Oturum durumu kontrol ediliyor...
        </Typography>
      </Box>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        p={3}
      >
        <Typography variant="h6" color="error" gutterBottom>
          Bir hata oluştu
        </Typography>
        <Typography variant="body1">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Navbar />
      <Box component="main" sx={{ p: 3, mt: 8 }}>
        <AppRoutes />
      </Box>
    </>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
