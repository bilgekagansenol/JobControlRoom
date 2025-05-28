import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Person as PersonIcon,
  ExitToApp as ExitToAppIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Kullanıcı menüsünü açma
  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Kullanıcı menüsünü kapatma
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Çıkış işlemi
  const handleLogout = async () => {
    try {
      setAnchorEl(null);
      
      // Çıkış fonksiyonunu çağır
      await logout();
      
      // Her durumda login sayfasına yönlendir
      navigate('/login');
    } catch (err) {
      console.error('Çıkış yapılırken beklenmeyen hata:', err);
      // Hataya rağmen login sayfasına yönlendir
      navigate('/login');
    }
  };
  
  // Mobil drawer açma/kapatma
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };
  
  // Ana gezinme linkleri
  const navLinks = [
    {
      text: 'İş Başvuruları',
      path: '/',
      icon: <DashboardIcon />
    },
    {
      text: 'Yeni Başvuru',
      path: '/job/add',
      icon: <AddIcon />
    },
    {
      text: 'Profil',
      path: '/profile',
      icon: <PersonIcon />
    }
  ];
  
  // Drawer içeriği
  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" component="div">
          JobControlRoom
        </Typography>
      </Box>
      <Divider />
      <List>
        {navLinks.map((link) => (
          <ListItem
            button
            key={link.text}
            component={Link}
            to={link.path}
            selected={location.pathname === link.path}
          >
            <ListItemIcon>{link.icon}</ListItemIcon>
            <ListItemText primary={link.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <ExitToAppIcon />
          </ListItemIcon>
          <ListItemText primary="Çıkış Yap" />
        </ListItem>
      </List>
    </Box>
  );
  
  return (
    <AppBar position="fixed" color="default" elevation={1}>
      <Toolbar>
        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
              {drawerContent}
            </Drawer>
          </>
        ) : null}
        
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ 
            flexGrow: 1, 
            color: 'text.primary', 
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <WorkIcon sx={{ mr: 1 }} />
          JobControlRoom
        </Typography>
        
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {navLinks.map((link) => (
              <Button
                key={link.text}
                component={Link}
                to={link.path}
                color={location.pathname === link.path ? 'primary' : 'inherit'}
                startIcon={link.icon}
              >
                {link.text}
              </Button>
            ))}
          </Box>
        )}
        
        {user && (
          <Box sx={{ ml: 2 }}>
            <IconButton
              onClick={handleUserMenuOpen}
              size="small"
              aria-controls={open ? 'user-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            </IconButton>
            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleUserMenuClose}
              MenuListProps={{
                'aria-labelledby': 'user-button',
              }}
            >
              <MenuItem component={Link} to="/profile">
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Profil
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <ExitToAppIcon fontSize="small" />
                </ListItemIcon>
                Çıkış Yap
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 