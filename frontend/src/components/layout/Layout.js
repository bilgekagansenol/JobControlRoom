import React from 'react';
import { Box, Container, Paper } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Layout = ({ children, maxWidth = 'lg', withoutPaper = false }) => {
  const { user } = useAuth();
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      bgcolor: 'background.default'
    }}>
      {/* Artık Navbar App.js içerisinden eklendiği için burada kullanmıyoruz */}
      
      <Container 
        maxWidth={maxWidth} 
        sx={{ 
          flexGrow: 1, 
          py: 4,
          px: { xs: 2, md: 3 },
          mt: 8 // Navbar için ek margin
        }}
      >
        {withoutPaper ? (
          children
        ) : (
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 2, md: 3 }, 
              borderRadius: 2, 
              boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)'
            }}
          >
            {children}
          </Paper>
        )}
      </Container>
      
      <Box 
        component="footer" 
        sx={{ 
          p: 2, 
          mt: 'auto', 
          textAlign: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        &copy; {new Date().getFullYear()} JobControlRoom
      </Box>
    </Box>
  );
};

export default Layout; 