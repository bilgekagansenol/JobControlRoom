import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  FormHelperText,
  Paper,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { addJob, JOB_STATUSES } from '../api/jobAPI';
import Layout from '../components/layout/Layout';

// Form için başlangıç değerleri
const initialFormValues = {
  job_title: '',
  company_name: '',
  status: 'applied',
  cover_letter: '',
  contact_email: '',
  notes: '',
  application_url: ''
};

// Form doğrulama için başlangıç değerleri
const initialFormErrors = {
  job_title: false,
  company_name: false
};

const JobAdd = () => {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [formErrors, setFormErrors] = useState(initialFormErrors);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  
  // Form değeri değişiklik işleyicisi
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    
    // Hata durumunu temizle
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: false }));
    }
  };
  
  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form doğrulama
    const errors = {};
    let hasError = false;
    
    if (!formValues.job_title.trim()) {
      errors.job_title = 'Pozisyon başlığı gereklidir';
      hasError = true;
    }
    
    if (!formValues.company_name.trim()) {
      errors.company_name = 'Şirket adı gereklidir';
      hasError = true;
    }
    
    // URL doğrulama - URL boş değilse ve protokol içermiyorsa ekle
    let validatedUrl = formValues.application_url ? formValues.application_url.trim() : '';
    if (validatedUrl && !validatedUrl.match(/^https?:\/\//)) {
      // Eğer protokol yoksa https:// ekle
      validatedUrl = 'https://' + validatedUrl;
    }
    
    if (hasError) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setLoading(true);
      setSubmitError('');
      
      console.log('İş başvurusu ekleme başlatılıyor', formValues);
      
      // Boş string'leri null'a çevirelim (BE'de sorun yaratabilecek alanlar için)
      const cleanedFormValues = { ...formValues };
      Object.keys(cleanedFormValues).forEach(key => {
        // Eğer boş string ise null yap (uygulama notu eklemek istemeyen kullanıcılar için)
        if (cleanedFormValues[key] === '') {
          cleanedFormValues[key] = null;
        }
      });
      
      // Doğrulanmış URL'yi set et
      if (validatedUrl) {
        cleanedFormValues.application_url = validatedUrl;
      } else {
        cleanedFormValues.application_url = null;
      }
      
      // application_date bugünkü tarih ile dolduralım
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatında bugünkü tarih
      cleanedFormValues.application_date = today;
      
      console.log('Temizlenmiş form verileri:', cleanedFormValues);
      
      const newJob = await addJob(cleanedFormValues);
      console.log('İş başvurusu başarıyla eklendi:', newJob);
      setSuccess(true);
      
      // Kısa bir süre sonra ana sayfaya yönlendir
      setTimeout(() => {
        navigate(`/job/${newJob.id}`);
      }, 1500);
    } catch (err) {
      console.error('İş başvurusu eklenirken hata:', err);
      
      let errorMessage = 'İş başvurusu eklenirken bir hata oluştu. Lütfen tekrar deneyin.';
      
      // Hata tipine göre özel mesajlar
      if (err.message && err.message.includes('hatalı alanlar')) {
        errorMessage = err.message;
      } else if (err.response?.data) {
        // API'den gelen hata mesajı varsa
        const errorData = err.response.data;
        
        if (typeof errorData === 'object') {
          // İlk hata mesajını bul
          for (const key in errorData) {
            if (Array.isArray(errorData[key]) && errorData[key].length > 0) {
              errorMessage = `${key}: ${errorData[key][0]}`;
              break;
            }
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
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
            Yeni İş Başvurusu Ekle
          </Typography>
        </Box>
        
        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {submitError}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            İş başvurusu başarıyla eklendi! Yönlendiriliyorsunuz...
          </Alert>
        )}
        
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Temel Bilgiler */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Temel Bilgiler
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  id="job_title"
                  name="job_title"
                  label="Pozisyon Başlığı"
                  value={formValues.job_title}
                  onChange={handleChange}
                  error={!!formErrors.job_title}
                  helperText={formErrors.job_title || ''}
                  disabled={loading || success}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  id="company_name"
                  name="company_name"
                  label="Şirket"
                  value={formValues.company_name}
                  onChange={handleChange}
                  error={!!formErrors.company_name}
                  helperText={formErrors.company_name || ''}
                  disabled={loading || success}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={loading || success}>
                  <InputLabel id="status-label">Durum</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={formValues.status}
                    onChange={handleChange}
                    label="Durum"
                  >
                    {JOB_STATUSES.map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="application_url"
                  name="application_url"
                  label="Başvuru URL'i"
                  placeholder="Örn: https://kariyer.example.com/ilan/123"
                  value={formValues.application_url}
                  onChange={handleChange}
                  disabled={loading || success}
                  helperText="Geçerli bir URL formatı kullanın (http:// veya https:// otomatik eklenir)"
                />
              </Grid>
              
              {/* İletişim Bilgileri */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  İletişim Bilgileri
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="contact_email"
                  name="contact_email"
                  label="İletişim E-postası"
                  type="email"
                  value={formValues.contact_email}
                  onChange={handleChange}
                  disabled={loading || success}
                />
              </Grid>
              
              {/* Detaylı Bilgiler */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Detaylı Bilgiler
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="cover_letter"
                  name="cover_letter"
                  label="Ön Yazı / Motivasyon Mektubu"
                  multiline
                  rows={4}
                  value={formValues.cover_letter}
                  onChange={handleChange}
                  disabled={loading || success}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="notes"
                  name="notes"
                  label="Notlar"
                  multiline
                  rows={3}
                  value={formValues.notes}
                  onChange={handleChange}
                  placeholder="Başvuru süreciyle ilgili notlar, görüşmeler, sorular, vb."
                  disabled={loading || success}
                />
              </Grid>
              
              {/* Butonlar */}
              <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/"
                  sx={{ mr: 2 }}
                  disabled={loading || success}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={loading || success}
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default JobAdd; 