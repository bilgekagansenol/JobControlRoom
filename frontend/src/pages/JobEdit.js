import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Paper,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { getJobById, updateJob, JOB_STATUSES } from '../api/jobAPI';
import Layout from '../components/layout/Layout';

// Çalışma türleri
const JOB_TYPES = [
  'Tam Zamanlı',
  'Yarı Zamanlı',
  'Uzaktan',
  'Serbest Çalışma',
  'Staj'
];

// Form doğrulama için başlangıç değerleri
const initialFormErrors = {
  job_title: false,
  company_name: false
};

const JobEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formValues, setFormValues] = useState(null);
  const [formErrors, setFormErrors] = useState(initialFormErrors);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // İş detaylarını getir
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setDataLoading(true);
        const job = await getJobById(id);
        setFormValues(job);
      } catch (err) {
        setLoadError('İş başvurusu bilgileri yüklenirken bir hata oluştu.');
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchJob();
  }, [id]);
  
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
    
    if (hasError) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setLoading(true);
      setSubmitError('');
      
      await updateJob(id, formValues);
      setSuccess(true);
      
      // Kısa bir süre sonra detay sayfasına yönlendir
      setTimeout(() => {
        navigate(`/job/${id}`);
      }, 1500);
    } catch (err) {
      setSubmitError(
        err.response?.data?.detail || 
        'İş başvurusu güncellenirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (dataLoading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }
  
  if (loadError || !formValues) {
    return (
      <Layout>
        <Alert severity="error" sx={{ mb: 3 }}>
          {loadError || 'İş başvurusu bulunamadı.'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/"
          variant="outlined"
        >
          İş Başvurularına Dön
        </Button>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            component={Link}
            to={`/job/${id}`}
            variant="text"
            sx={{ mr: 2 }}
          >
            Geri
          </Button>
          <Typography variant="h5" component="h1">
            İş Başvurusu Düzenle
          </Typography>
        </Box>
        
        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {submitError}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            İş başvurusu başarıyla güncellendi! Yönlendiriliyorsunuz...
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
                  value={formValues.application_url || ''}
                  onChange={handleChange}
                  disabled={loading || success}
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
                  value={formValues.contact_email || ''}
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
                  value={formValues.cover_letter || ''}
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
                  value={formValues.notes || ''}
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
                  to={`/job/${id}`}
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
                  {loading ? 'Güncelleniyor...' : 'Güncelle'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default JobEdit; 