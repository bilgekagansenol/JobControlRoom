import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  Container,
  Divider,
  Grid
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Work as WorkIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Kayıt başarısından sonra yönlendirme gelirse başarı mesajını göster
  useEffect(() => {
    if (location.state?.registrationSuccess) {
      setSuccess(location.state.message || 'Kayıt başarıyla tamamlandı. Lütfen giriş yapın.');
      // State'i temizle, sayfa yenilendiğinde mesaj tekrar görünmesin
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!email.trim() || !password) {
      setError('Lütfen e-posta ve şifre girin');
      return;
    }
    
    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Lütfen geçerli bir e-posta adresi girin');
      return;
    }
    
    console.log('Giriş denenecek:', { email, password }); // Debug için
    
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      const result = await login(email, password);
      console.log('Giriş sonucu:', result); // Debug için
      
      if (result && result.success) {
        navigate('/', { replace: true });
      } else if (result && result.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Giriş hatası:', err); // Debug için
      setError(`Giriş yapılamadı: ${err.message || 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };
  
  return (
    <Container 
      component="main" 
      maxWidth="xs" 
      sx={{ 
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Card sx={{ 
        width: '100%', 
        p: 2, 
        borderRadius: 3,
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)'
      }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3,
              color: 'primary.main'
            }}>
              <WorkIcon sx={{ fontSize: 40, mr: 1 }} />
              <Typography component="h1" variant="h4" fontWeight="bold">
                JobControlRoom
              </Typography>
            </Box>
            
            <Typography component="h2" variant="h6" sx={{ mb: 3 }}>
              Hesabınıza Giriş Yapın
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                {success}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="E-posta Adresi"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
                error={!!error}
                type="email"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Şifre"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="şifre görünürlüğünü değiştir"
                        onClick={toggleShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
                error={!!error}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ 
                  py: 1.5, 
                  fontSize: '1rem', 
                  mb: 2,
                  borderRadius: 2
                }}
              >
                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </Button>
              
              <Box sx={{ mt: 2 }}>
                <Divider>
                  <Typography variant="body2" color="text.secondary">
                    veya
                  </Typography>
                </Divider>
              </Box>
              
              <Grid container justifyContent="center" sx={{ mt: 2 }}>
                <Grid item>
                  <Typography variant="body2">
                    Hesabınız yok mu?{' '}
                    <Link to="/register" style={{ textDecoration: 'none', color: 'primary.main' }}>
                      Kayıt olun
                    </Link>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login; 