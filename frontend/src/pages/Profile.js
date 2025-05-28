import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Input
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  PhotoCamera as PhotoCameraIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { changePassword, updateProfileImage } from '../api/authAPI';
import Layout from '../components/layout/Layout';

const Profile = () => {
  const { user, checkAuth, logout } = useAuth();
  const navigate = useNavigate();
  
  const [editMode, setEditMode] = useState(false);
  const [formValues, setFormValues] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // User değiştiğinde form bilgilerini güncelle
  useEffect(() => {
    if (user) {
      setFormValues(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);
  
  // Düzenleme modunu aç/kapat
  const toggleEditMode = () => {
    if (editMode) {
      // Düzenleme modundan çıkarken formu sıfırla
      setFormValues({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setFormErrors({});
      setError('');
      setSuccess('');
    }
    setEditMode(!editMode);
  };
  
  // Form değeri değişiklik işleyicisi
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    
    // Hata durumunu temizle
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  // Çıkış yapma işlemi
  const handleLogout = async () => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      // Çıkış fonksiyonunu çağır
      const result = await logout();
      console.log('Logout result:', result);
      
      // Her durumda login sayfasına yönlendir
      navigate('/login');
    } catch (err) {
      console.error('Çıkış hatası:', err);
      // Hataya rağmen login sayfasına yönlendir
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };
  
  // Şifre değiştirme
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Form doğrulama
    const errors = {};
    let hasError = false;
    
    if (!formValues.currentPassword) {
      errors.currentPassword = 'Mevcut şifrenizi girmelisiniz';
      hasError = true;
    }
    
    if (!formValues.newPassword) {
      errors.newPassword = 'Yeni şifre gereklidir';
      hasError = true;
    } else if (formValues.newPassword.length < 6) {
      errors.newPassword = 'Şifre en az 6 karakter olmalıdır';
      hasError = true;
    }
    
    if (formValues.newPassword !== formValues.confirmPassword) {
      errors.confirmPassword = 'Şifreler eşleşmiyor';
      hasError = true;
    }
    
    if (hasError) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await changePassword(formValues.currentPassword, formValues.newPassword);
      
      // Şifre değiştirme başarılı
      setSuccess('Şifreniz başarıyla değiştirildi.');
      
      // Form alanlarını temizle
      setFormValues(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
    } catch (err) {
      console.error('Şifre değiştirilirken hata:', err);
      setError(err.response?.data?.detail || 'Şifre değiştirilemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  // Profil resmi güncelleme
  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await updateProfileImage(file);
      
      // Profil resmi güncelleme başarılı
      setSuccess('Profil resminiz başarıyla güncellendi.');
      
      // Kullanıcı bilgilerini yenile
      await checkAuth();
      
    } catch (err) {
      console.error('Profil resmi güncellenirken hata:', err);
      setError(err.response?.data?.detail || 'Profil resmi güncellenemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              component={Link}
              to="/"
              variant="text"
              sx={{ mr: 2 }}
            >
              Geri
            </Button>
            <Typography variant="h5" component="h1">
              Profil Bilgilerim
            </Typography>
          </Box>
          
          <Button
            startIcon={editMode ? null : <EditIcon />}
            onClick={toggleEditMode}
            variant={editMode ? "outlined" : "contained"}
            color={editMode ? "secondary" : "primary"}
            disabled={loading}
          >
            {editMode ? 'İptal' : 'Şifre Değiştir'}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {/* Sol bölüm - Kullanıcı bilgileri ve düzenleme formu */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
              <Box component="div">
                {/* Şifre değiştirme formu */}
                {editMode ? (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Şifrenizi Değiştirin
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Box component="form" onSubmit={handleChangePassword}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            id="currentPassword"
                            name="currentPassword"
                            label="Mevcut Şifre"
                            type="password"
                            value={formValues.currentPassword}
                            onChange={handleChange}
                            error={!!formErrors.currentPassword}
                            helperText={formErrors.currentPassword || ''}
                            disabled={loading}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="newPassword"
                            name="newPassword"
                            label="Yeni Şifre"
                            type="password"
                            value={formValues.newPassword}
                            onChange={handleChange}
                            error={!!formErrors.newPassword}
                            helperText={formErrors.newPassword || ''}
                            disabled={loading}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="confirmPassword"
                            name="confirmPassword"
                            label="Şifre Tekrar"
                            type="password"
                            value={formValues.confirmPassword}
                            onChange={handleChange}
                            error={!!formErrors.confirmPassword}
                            helperText={formErrors.confirmPassword || ''}
                            disabled={loading}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            disabled={loading}
                          >
                            {loading ? 'Kaydediliyor...' : 'Şifreyi Değiştir'}
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </>
                ) : (
                  /* Kullanıcı bilgileri görüntüleme */
                  <>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Kullanıcı Bilgileri
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Ad Soyad
                              </Typography>
                              <Typography variant="body1">
                                {user?.name || 'Belirtilmemiş'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                E-posta
                              </Typography>
                              <Typography variant="body1">
                                {user?.email || 'Belirtilmemiş'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                    
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Hesap Bilgileri
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LockIcon sx={{ mr: 2, color: 'primary.main' }} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Şifre
                              </Typography>
                              <Typography variant="body1">
                                ••••••••
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </>
                )}
              </Box>
            </Paper>
          </Grid>
          
          {/* Sağ bölüm - Kullanıcı özeti */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                py: 4
              }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar 
                    src={user?.profile_image ? `http://127.0.0.1:8000${user.profile_image}` : undefined}
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      fontSize: 48,
                      mb: 2,
                      bgcolor: 'primary.main'
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'K'}
                  </Avatar>
                  
                  {/* Profil resmi güncelleme butonu */}
                  <label htmlFor="profile-image-upload">
                    <Input
                      accept="image/*"
                      id="profile-image-upload"
                      type="file"
                      sx={{ display: 'none' }}
                      onChange={handleProfileImageChange}
                      disabled={loading}
                    />
                    <IconButton
                      color="primary"
                      aria-label="upload profile image"
                      component="span"
                      sx={{
                        position: 'absolute',
                        right: -5,
                        bottom: 15,
                        backgroundColor: 'background.paper',
                        boxShadow: 1,
                        '&:hover': { backgroundColor: 'background.paper' }
                      }}
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  </label>
                </Box>
                
                <Typography variant="h5" gutterBottom>
                  {user?.name || 'Kullanıcı'}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user?.email || 'kullanici@mail.com'}
                </Typography>
                
                <Divider sx={{ width: '100%', my: 3 }} />
                
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body1" gutterBottom align="left">
                    Özet Bilgiler
                  </Typography>
                  
                  <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Kullanıcı ID:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {user?.id || '-'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Durum:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium" color="success.main">
                      Aktif
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ width: '100%', my: 3 }} />
                
                {/* Çıkış Yapma Butonu */}
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LogoutIcon />}
                  onClick={handleLogout}
                  fullWidth
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Çıkış Yapılıyor...' : 'Çıkış Yap'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default Profile; 