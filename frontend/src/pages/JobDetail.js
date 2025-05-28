import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  Link as MuiLink
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Description as DescriptionIcon,
  Link as LinkIcon,
  Note as NoteIcon
} from '@mui/icons-material';
import { getJobById, deleteJob, JOB_STATUSES } from '../api/jobAPI';
import Layout from '../components/layout/Layout';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // İş detaylarını getir
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const data = await getJobById(id);
        setJob(data);
      } catch (err) {
        setError('İş başvurusu yüklenirken bir hata oluştu.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJob();
  }, [id]);
  
  // Silme onay penceresini aç/kapat
  const toggleDeleteDialog = () => {
    setDeleteDialog(!deleteDialog);
  };
  
  // İş başvurusunu sil
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteJob(id);
      setDeleteDialog(false);
      navigate('/', { replace: true });
    } catch (err) {
      setError('İş başvurusu silinirken bir hata oluştu.');
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };
  
  // Duruma göre renk ve etiket belirle
  const getStatusInfo = (statusValue) => {
    const statusObj = JOB_STATUSES.find(s => s.value === statusValue);
    if (statusObj) {
      return {
        color: statusObj.color,
        label: statusObj.label
      };
    }
    return { color: '#757575', label: statusValue };
  };
  
  // Tarih formatını düzenle
  const formatDate = (dateStr) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('tr-TR', options);
  };
  
  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/"
          variant="outlined"
        >
          Geri Dön
        </Button>
      </Layout>
    );
  }
  
  if (!job) {
    return (
      <Layout>
        <Alert severity="info">İş başvurusu bulunamadı.</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/"
          variant="outlined"
          sx={{ mt: 2 }}
        >
          Geri Dön
        </Button>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Box>
        {/* Üst başlık bölümü */}
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
              {job.job_title}
            </Typography>
          </Box>
          
          <Box>
            <Tooltip title="Düzenle">
              <IconButton
                component={Link}
                to={`/job/${job.id}/edit`}
                color="primary"
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sil">
              <IconButton color="error" onClick={toggleDeleteDialog}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Durum bilgisi */}
        <Box sx={{ mb: 4 }}>
          <Chip 
            label={getStatusInfo(job.status).label} 
            sx={{ 
              backgroundColor: getStatusInfo(job.status).color,
              color: 'white',
              fontWeight: 'bold',
              px: 1
            }}
          />
        </Box>
        
        <Grid container spacing={3}>
          {/* Sol bilgi bölümü */}
          <Grid item xs={12} md={8}>
            {job.cover_letter && (
              <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <DescriptionIcon sx={{ mr: 1 }} /> Ön Yazı / Motivasyon Mektubu
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {job.cover_letter}
                </Typography>
              </Paper>
            )}
            
            {job.notes && (
              <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <NoteIcon sx={{ mr: 1 }} /> Notlar
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {job.notes}
                </Typography>
              </Paper>
            )}
          </Grid>
          
          {/* Sağ bilgi bölümü */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Başvuru Bilgileri
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ '& > div': { mb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Şirket
                    </Typography>
                    <Typography variant="body1">
                      {job.company_name}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Başvuru Tarihi
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(job.application_date)}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Son Güncelleme
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(job.last_updated)}
                    </Typography>
                  </Box>
                </Box>
                
                {job.application_url && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LinkIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Başvuru Linki
                      </Typography>
                      <Typography variant="body1">
                        <MuiLink href={job.application_url} target="_blank" rel="noopener">
                          İlan Sayfasını Aç
                        </MuiLink>
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
              
              {job.contact_email && (
                <>
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    İletişim Bilgileri
                  </Typography>
                  
                  <Box sx={{ '& > div': { mb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          E-posta
                        </Typography>
                        <Typography variant="body1">
                          <MuiLink href={`mailto:${job.contact_email}`} color="primary">
                            {job.contact_email}
                          </MuiLink>
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Silme onay dialog'u */}
      <Dialog
        open={deleteDialog}
        onClose={toggleDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          İş Başvurusunu Sil
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            "{job.job_title}" başlıklı iş başvurusunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleDeleteDialog} color="primary">
            İptal
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            disabled={deleteLoading}
            variant="contained"
          >
            {deleteLoading ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default JobDetail; 