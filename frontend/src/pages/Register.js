import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  Container,
  Grid,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Work as WorkIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Form değeri değişiklik işleyicisi
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };
  
  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Önce hataları temizle
    setError('');
    
    // Form doğrulama
    if (!formValues.name.trim()) {
      setError('Ad Soyad alanı gereklidir');
      return;
    }
    
    if (!formValues.email.trim()) {
      setError('E-posta alanı gereklidir');
      return;
    }
    
    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formValues.email)) {
      setError('Geçerli bir e-posta adresi girin');
      return;
    }
    
    if (!formValues.password) {
      setError('Şifre alanı gereklidir');
      return;
    }
    
    if (formValues.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }
    
    if (formValues.password !== formValues.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    
    try {
      console.log('Kayıt isteği gönderiliyor...', {
        email: formValues.email,
        name: formValues.name
      });
      
      const result = await register({
        name: formValues.name,
        email: formValues.email,
        password: formValues.password
      });
      
      console.log('Kayıt sonucu:', {
        success: result.success,
        hasError: !!result.error,
        hasMessage: !!result.message,
        redirectToLogin: !!result.redirectToLogin
      });
      
      if (result.success) {
        setSuccess(true);
        
        // Kayıt başarılı, login sayfasına yönlendir
        setTimeout(() => {
          navigate('/login', { 
            replace: true,
            state: { 
              registrationSuccess: true,
              message: result.message || 'Kayıt başarıyla tamamlandı. Lütfen giriş yapın.'
            }
          });
        }, 2000);
      } else if (result.error) {
        console.error('Kayıt başarısız oldu:', result.error);
        setError(result.error);
      }
    } catch (err) {
      console.error('Kayıt işlemi sırasında beklenmeyen hata:', err);
      
      // Hata mesajını detaylı göster
      let errorMessage = err.message || 'Sunucu ile iletişim hatası';
      
      // Axios hata detayları varsa göster
      if (err.response) {
        errorMessage = `Sunucu hatası: ${err.response.status} ${err.response.statusText}`;
        console.error('Hata detayları:', err.response.data);
      } else if (err.request) {
        errorMessage = 'Sunucu yanıt vermedi. Lütfen internet bağlantınızı kontrol edin.';
      }
      
      setError(`Kayıt yapılamadı: ${errorMessage}`);
    }
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
              Hesap Oluştur
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                Hesabınız başarıyla oluşturuldu! Giriş yapılıyor...
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Ad Soyad"
                name="name"
                autoComplete="name"
                autoFocus
                value={formValues.name}
                onChange={handleChange}
                sx={{ mb: 2 }}
                disabled={isLoading || success}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="E-posta Adresi"
                name="email"
                autoComplete="email"
                type="email"
                value={formValues.email}
                onChange={handleChange}
                sx={{ mb: 2 }}
                disabled={isLoading || success}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Şifre"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formValues.password}
                onChange={handleChange}
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
                sx={{ mb: 2 }}
                disabled={isLoading || success}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Şifre Tekrar"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={formValues.confirmPassword}
                onChange={handleChange}
                sx={{ mb: 3 }}
                disabled={isLoading || success}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading || success}
                sx={{ 
                  py: 1.5, 
                  fontSize: '1rem', 
                  mb: 2,
                  borderRadius: 2
                }}
              >
                {isLoading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
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
                    Zaten hesabınız var mı?{' '}
                    <Link to="/login" style={{ textDecoration: 'none', color: 'primary.main' }}>
                      Giriş yapın
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

export default Register; 