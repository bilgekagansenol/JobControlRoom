import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { routes, ProtectedRoute, RedirectIfLoggedIn } from './RouteConfig';

// Yükleme durumu için gösterilecek bileşen
const LoadingFallback = () => (
  <Box 
    display="flex" 
    flexDirection="column"
    justifyContent="center" 
    alignItems="center" 
    minHeight="80vh"
  >
    <CircularProgress />
    <Typography variant="body1" sx={{ mt: 2 }}>
      Sayfa yükleniyor...
    </Typography>
  </Box>
);

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  console.log('AppRoutes: Auth durumu:', { isAuthenticated, isLoading });
  console.log('AppRoutes: Current location:', location.pathname);

  // Auth durumu henüz yüklenmemiş ise bu kısma hiç girmemeli
  // Yükleme kontrolü AuthenticatedApp içinde yapılıyor
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {routes.map((route) => {
          const Element = route.element;
          
          if (route.protected) {
            console.log(`Route ${route.path}: Protected, auth:`, isAuthenticated);
            return (
              <Route 
                key={route.path}
                path={route.path} 
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Element />
                  </ProtectedRoute>
                } 
              />
            );
          } else if (route.redirectIfLoggedIn) {
            console.log(`Route ${route.path}: RedirectIfLoggedIn, auth:`, isAuthenticated);
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <RedirectIfLoggedIn isAuthenticated={isAuthenticated}>
                    <Element />
                  </RedirectIfLoggedIn>
                }
              />
            );
          } else {
            console.log(`Route ${route.path}: Public`);
            return (
              <Route 
                key={route.path}
                path={route.path} 
                element={<Element />} 
              />
            );
          }
        })}
      </Routes>
    </Suspense>
  );
};

export default AppRoutes; 