import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { getAllJobs, getFilteredJobs, deleteJob, JOB_STATUSES } from '../api/jobAPI';
import Layout from '../components/layout/Layout';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Filtreleme durumu
  const [filters, setFilters] = useState({
    job_title: '',
    company_name: '',
    status: '',
    start_date: '',
    end_date: '',
    ordering: '',
    page: 1,
    page_size: 10
  });
  
  // Toplam kayıt sayısı ve sayfalama
  const [totalCount, setTotalCount] = useState(0);
  
  // Başlangıçta tüm işleri getir
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      // Aktif filtreleri kontrol et
      const activeFilters = {};
      if (filters.job_title) activeFilters.job_title = filters.job_title;
      if (filters.company_name) activeFilters.company_name = filters.company_name;
      // Status filtresini frontend'de uygulayacağız, backend'e göndermeyelim
      if (filters.ordering) activeFilters.ordering = filters.ordering;
      activeFilters.page = filters.page;
      activeFilters.page_size = 20; // Daha fazla veri alalım, frontend'de filtreleyeceğiz
      
      // Aktif filtreleri konsolda göster
      console.log('Filtreleme için gönderilen parametreler:', activeFilters);
      console.log('Özellikle durum filtresi (frontend\'de uygulanacak):', filters.status || 'filtre yok');

      let result;
      try {
        // Durum filtresini backend'e göndermeyip, diğer filtreler için API'yi kullan
        if (filters.job_title || filters.company_name || filters.ordering) {
          console.log('Diğer parametrelerle filtreleme yapılıyor...');
          result = await getFilteredJobs(activeFilters);
        } else {
          console.log('Tüm kayıtlar getiriliyor...');
          result = await getAllJobs(filters.page, 20); // Daha fazla veri alalım
        }
        
        // API yanıtı kontrolü
        console.log('API yanıtı:', result);
        
        // Veri yapısı kontrolü
        if (!result) {
          console.error('API yanıtı boş');
          setJobs([]);
          setTotalCount(0);
          return;
        }
        
        // Jobs kontrolü
        if (!result.jobs || !Array.isArray(result.jobs)) {
          console.error('API yanıtı beklenen formatta değil, jobs dizisi bulunamadı:', result);
          // Eğer result doğrudan bir dizi ise (eski API formatı)
          if (Array.isArray(result)) {
            result = { jobs: result, total_jobs: result.length };
          } else {
            setJobs([]);
            setTotalCount(0);
            return;
          }
        }
        
        // Frontend'de durum (status) filtresi uygula
        let filteredJobs = [...result.jobs];
        let totalCount = result.total_jobs || result.jobs.length;
        
        if (filters.status && filters.status !== '') {
          console.log(`Frontend'de "${filters.status}" durumu için filtreleme yapılıyor...`);
          filteredJobs = filteredJobs.filter(job => job.status === filters.status);
          console.log(`Filtreleme sonrası ${filteredJobs.length} iş başvurusu kaldı`);
          totalCount = filteredJobs.length; // Sayıyı güncelle
        } else {
          console.log('Tüm durumlar gösteriliyor, frontend filtrelemesi yok');
        }
        
        // Veri başarıyla alındı ve filtrelendi
        console.log(`Sonuç: ${filteredJobs.length} iş başvurusu gösteriliyor`);
        console.log('İş başvurularının durumları:', 
          filteredJobs.map(job => ({ id: job.id, status: job.status })));
        
        setJobs(filteredJobs);
        setTotalCount(totalCount);
      } catch (apiErr) {
        console.error('API çağrısı sırasında hata:', apiErr);
        setJobs([]);
        setTotalCount(0);
        throw apiErr;
      }
    } catch (err) {
      console.error("İş başvuruları getirilirken hata:", err);
      setError(err.message || "İş başvuruları yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  // Filtre değişikliği işleyicileri
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log(`Filter değişiyor: ${name} = "${value}"`);
    
    // Durum (status) filtresi için özel kontrol
    if (name === "status") {
      console.log(`Durum filtresi değiştiriliyor: "${value}"`);
      // Durum filtresi boş ise, null olarak ayarla
      if (value === "") {
        console.log("Durum filtresi temizlendi");
      } else {
        // Durum filtresinin geçerli bir değer olduğunu kontrol et
        const isValid = JOB_STATUSES.some(s => s.value === value);
        console.log(`Seçilen durum değeri geçerli mi: ${isValid}, değer: "${value}"`);
      }
    }
    
    setFilters(prev => ({ ...prev, [name]: value, page: 1 })); // Filtre değiştiğinde sayfa 1'e dön
  };
  
  // Filtreleri temizle
  const clearFilters = () => {
    setFilters({
      job_title: '',
      company_name: '',
      status: '',
      start_date: '',
      end_date: '',
      ordering: '',
      page: 1,
      page_size: 10
    });
  };
  
  // Sayfa değişikliği
  const handleChangePage = (event, newPage) => {
    setFilters(prev => ({ ...prev, page: newPage + 1 }));
  };
  
  // Sayfa başına satır sayısı değişikliği
  const handleChangeRowsPerPage = (event) => {
    const newPageSize = parseInt(event.target.value, 10);
    setFilters(prev => ({ ...prev, page_size: newPageSize, page: 1 }));
  };
  
  // Sıralama değişikliği
  const handleSortChange = (field) => {
    // Aynı alana tıklanırsa sıralama yönünü değiştir (artan -> azalan -> yok)
    let newOrdering = field;
    if (filters.ordering === field) {
      newOrdering = `-${field}`;
    } else if (filters.ordering === `-${field}`) {
      newOrdering = '';
    }
    setFilters(prev => ({ ...prev, ordering: newOrdering, page: 1 }));
  };
  
  // Silme işlemi için dialog aç
  const openDeleteDialog = (job) => {
    setJobToDelete(job);
    setDeleteDialogOpen(true);
  };
  
  // Silme işlemini onayla
  const confirmDelete = async () => {
    if (!jobToDelete) return;
    
    try {
      setDeleteLoading(true);
      await deleteJob(jobToDelete.id);
      // Silme işlemi başarılı, listeyi yenile
      fetchJobs();
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('İş başvurusu silinirken hata oluştu:', err);
      setError('İş başvurusu silinirken bir hata oluştu.');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  // Status değiştiğinde filtreleme yap
  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    console.log('Durum filtresi değişti:', newStatus || 'tümü');
    
    // Durum filtreleme işlemi
    if (newStatus === '') {
      console.log('Tüm durumlar gösterilecek');
    } else {
      console.log(`Sadece "${newStatus}" durumundaki kayıtlar gösterilecek`);
    }
    
    setFilters(prev => ({
      ...prev,
      status: newStatus,
      page: 1 // Sayfa 1'e dön
    }));
  };
  
  // Duruma göre renk ve etiket belirle
  const getStatusInfo = (statusValue) => {
    console.log('getStatusInfo çağrıldı, status değeri:', statusValue);
    
    const statusObj = JOB_STATUSES.find(s => s.value === statusValue);
    if (statusObj) {
      console.log('Eşleşen status bulundu:', statusObj.label);
      return {
        color: statusObj.color,
        label: statusObj.label
      };
    }
    
    console.warn('Bilinmeyen status değeri:', statusValue);
    return { color: '#757575', label: statusValue || 'Belirtilmemiş' };
  };
  
  // Tarihi formatla
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };
  
  // Benzersiz şirket listesi
  const uniqueCompanies = [...new Set(jobs.map(job => job.company_name))];
  
  // Başlangıçta ve filtre/sayfa değiştiğinde işleri getir
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  return (
    <Layout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            İş Başvurularım
          </Typography>
          
          <Button
            component={Link}
            to="/job/add"
            variant="contained"
            startIcon={<AddIcon />}
          >
            Yeni Başvuru Ekle
          </Button>
        </Box>
        
        {/* Filtreler */}
        <Paper sx={{ p: 2, mb: 3 }} elevation={0}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Filtreler
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                name="job_title"
                label="Pozisyon Adı"
                value={filters.job_title}
                onChange={handleFilterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Durum</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  name="status"
                  value={filters.status}
                  onChange={handleStatusChange}
                  label="Durum"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {JOB_STATUSES.map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="company-filter-label">Şirket</InputLabel>
                <Select
                  labelId="company-filter-label"
                  id="company-filter"
                  name="company_name"
                  value={filters.company_name}
                  onChange={handleFilterChange}
                  label="Şirket"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {uniqueCompanies.map(company => (
                    <MenuItem key={company} value={company}>
                      {company}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                name="start_date"
                label="Başlangıç Tarihi"
                type="date"
                value={filters.start_date}
                onChange={handleFilterChange}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Button 
                variant="outlined" 
                onClick={clearFilters} 
                fullWidth
                size="medium"
                sx={{ height: '100%' }}
              >
                Filtreleri Temizle
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : jobs.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }} elevation={0}>
            <Typography variant="h6" color="text.secondary">
              Hiç iş başvurusu bulunamadı.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Filtrelerinizi değiştirin veya yeni bir başvuru ekleyin.
            </Typography>
            <Button
              component={Link}
              to="/job/add"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ mt: 3 }}
            >
              Yeni Başvuru Ekle
            </Button>
          </Paper>
        ) : (
          <>
            <TableContainer component={Paper} elevation={0}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                    <TableCell>Pozisyon</TableCell>
                    <TableCell>Şirket</TableCell>
                    <TableCell>Başvuru Tarihi</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell align="right">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id} hover>
                      <TableCell component="th" scope="row">
                        {job.job_title}
                      </TableCell>
                      <TableCell>{job.company_name}</TableCell>
                      <TableCell>{formatDate(job.application_date)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusInfo(job.status).label} 
                          size="small"
                          sx={{ 
                            backgroundColor: getStatusInfo(job.status).color,
                            color: 'white'
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Görüntüle">
                          <IconButton
                            component={Link}
                            to={`/job/${job.id}`}
                            size="small"
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Düzenle">
                          <IconButton
                            component={Link}
                            to={`/job/${job.id}/edit`}
                            size="small"
                            sx={{ mx: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => openDeleteDialog(job)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={filters.page_size}
              page={filters.page - 1}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Sayfa başına satır:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} / ${count}`
              }
            />
          </>
        )}
      </Box>
      
      {/* Silme Onay Dialog'u */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          İş Başvurusunu Sil
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {jobToDelete ? 
              `"${jobToDelete.job_title}" başlıklı iş başvurusunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.` : 
              'Bu iş başvurusunu silmek istediğinize emin misiniz?'
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            İptal
          </Button>
          <Button 
            onClick={confirmDelete} 
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

export default JobList; 