import axios from 'axios';
import { TOKEN_KEY } from './authAPI';

// API base URL - proxy kullanacak şekilde göreceli URL kullanıyoruz
const API_URL = '';

// Auth token'ı header'lara eklemek için yardımcı fonksiyon
const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    console.error('getAuthHeaders: Token bulunamadı');
    return {
      headers: {}
    };
  }
  
  console.log('getAuthHeaders: Token kullanılıyor:', token);
  return {
    headers: {
      'Authorization': `Token ${token}` // Django Rest Framework token authentication
    }
  };
};

// Kullanılabilecek statüler (backend'deki enum değerleriyle eşleşmeli)
export const JOB_STATUSES = [
  { value: 'applied', label: 'Başvuruldu', color: '#2196f3' }, // Mavi
  { value: 'interview', label: 'Mülakat', color: '#ff9800' },    // Turuncu
  { value: 'rejected', label: 'Reddedildi', color: '#f44336' }, // Kırmızı
  { value: 'accepted', label: 'Kabul Edildi', color: '#4caf50' } // Yeşil
];

// Tüm iş başvurularını getir
export const getAllJobs = async (page = 1, pageSize = 10) => {
  try {
    console.log('getAllJobs: API isteği hazırlanıyor, sayfa:', page, 'sayfa boyutu:', pageSize); // Debug için
    
    // Token kontrolü
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      console.error('getAllJobs: Token bulunamadı, kullanıcı giriş yapmamış olabilir');
      throw new Error('Yetkilendirme hatası: Lütfen tekrar giriş yapın');
    }
    
    console.log('getAllJobs: Token kullanılıyor:', token);
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      // Sayfalama parametrelerini ekle
      const url = `${API_URL}/job/list/?page=${page}&page_size=${pageSize}`;
      xhr.open('GET', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Authorization', `Token ${token}`);
      
      xhr.onload = function() {
        console.log('getAllJobs: XHR onload - status:', xhr.status, xhr.statusText);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('getAllJobs: Başarılı yanıt alındı');
          
          let response;
          try {
            response = JSON.parse(xhr.responseText);
            console.log('getAllJobs: Ham API yanıtı:', response);
            
            // Yanıt formatını normalize et
            let normalizedResponse = {};
            
            // API'den dönen yanıt formatını kontrol et
            if (Array.isArray(response)) {
              // API array döndürdüyse
              normalizedResponse = {
                jobs: response,
                total_jobs: response.length,
                count: response.length
              };
              console.log('getAllJobs: Array formatındaki yanıt normalize edildi');
            } else if (response.results && Array.isArray(response.results)) {
              // API Django REST framework pagination formatında döndürdüyse
              normalizedResponse = {
                jobs: response.results,
                total_jobs: response.count,
                count: response.count,
                next: response.next,
                previous: response.previous
              };
              console.log('getAllJobs: Pagination formatındaki yanıt normalize edildi');
            } else if (response.jobs && Array.isArray(response.jobs)) {
              // API zaten bizim istediğimiz formatta döndürdüyse
              normalizedResponse = response;
              console.log('getAllJobs: Yanıt zaten doğru formatta');
            } else {
              // Hiçbir formata uymuyorsa, boş bir yanıt oluştur
              console.warn('getAllJobs: Bilinmeyen API yanıt formatı, varsayılan değerler kullanılıyor');
              normalizedResponse = {
                jobs: [],
                total_jobs: 0,
                count: 0
              };
            }
            
            console.log('getAllJobs: Normalize edilmiş yanıt:', normalizedResponse);
            resolve(normalizedResponse);
          } catch (e) {
            console.error('getAllJobs: JSON parse hatası:', e);
            reject(new Error('Sunucu yanıtı geçersiz JSON formatında'));
            return;
          }
        } else {
          console.error('getAllJobs: HTTP error', xhr.status, xhr.statusText);
          console.error('getAllJobs: Response body:', xhr.responseText);
          
          let errorMessage = 'İş başvuruları alınırken bir hata oluştu.';
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.detail || errorMessage;
          } catch (e) {
            console.error('getAllJobs: Hata yanıtı JSON parse hatası:', e);
          }
          
          if (xhr.status === 401) {
            errorMessage = 'Oturum süresi dolmuş olabilir, lütfen tekrar giriş yapın.';
          }
          
          reject(new Error(errorMessage));
        }
      };
      
      xhr.onerror = function() {
        console.error('getAllJobs: Network error occurred');
        reject(new Error('Ağ hatası oluştu. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.'));
      };
      
      xhr.ontimeout = function() {
        console.error('getAllJobs: Request timeout');
        reject(new Error('İstek zaman aşımına uğradı. Lütfen daha sonra tekrar deneyin.'));
      };
      
      xhr.timeout = 15000; // 15 saniye timeout
      
      xhr.send();
    });
  } catch (error) {
    console.error('İş başvuruları alınırken hata oluştu:', error);
    throw error;
  }
};

// Filtrelenmiş iş başvurularını getir
export const getFilteredJobs = async (filters = {}) => {
  try {
    console.log('getFilteredJobs: Filtrelerle API isteği yapılıyor', filters); // Debug için
    
    // Durum (status) kontrolü
    if (filters.status) {
      console.log('getFilteredJobs: Durum filtresi kullanılıyor:', filters.status);
      
      // İzin verilen değerlerden biri mi kontrol et
      const isValidStatus = JOB_STATUSES.some(s => s.value === filters.status);
      if (!isValidStatus) {
        console.warn(`getFilteredJobs: Geçersiz durum filtresi: ${filters.status}, filtre kaldırılıyor`);
        delete filters.status; // Geçersiz değeri kaldır
      } else {
        console.log(`getFilteredJobs: Geçerli durum filtresi: ${filters.status}`);
      }
    } else {
      console.log('getFilteredJobs: Durum filtresi belirtilmemiş, tüm durumlar gösterilecek');
    }
    
    // Filtre parametrelerini URL'e ekleme
    const params = new URLSearchParams();
    if (filters.job_title) params.append('job_title', filters.job_title);
    if (filters.company_name) params.append('company_name', filters.company_name);
    // Status için özel kontrol - boş string olmamalı
    if (filters.status && filters.status !== '') {
      params.append('status', filters.status);
      console.log(`getFilteredJobs: URL parametresine durum eklendi: status=${filters.status}`);
    }
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.ordering) params.append('ordering', filters.ordering);
    if (filters.page) params.append('page', filters.page);
    if (filters.page_size) params.append('page_size', filters.page_size);

    const url = `${API_URL}/job/filter/?${params.toString()}`;
    console.log('getFilteredJobs: Oluşturulan API URL:', url);
    console.log('getFilteredJobs: URL parametreleri:', params.toString());
    
    // Token kontrolü
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      console.error('getFilteredJobs: Token bulunamadı, kullanıcı giriş yapmamış olabilir');
      throw new Error('Yetkilendirme hatası: Lütfen tekrar giriş yapın');
    }
    
    console.log('getFilteredJobs: Token kullanılıyor');
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Authorization', `Token ${token}`);
      
      xhr.onload = function() {
        console.log('getFilteredJobs: XHR onload - status:', xhr.status, xhr.statusText);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('getFilteredJobs: Başarılı yanıt alındı');
          
          let response;
          try {
            response = JSON.parse(xhr.responseText);
            console.log('getFilteredJobs: Ham API yanıtı:', response);
            
            // Yanıt formatını normalize et
            let normalizedResponse = {};
            
            // API'den dönen yanıt formatını kontrol et
            if (Array.isArray(response)) {
              // API array döndürdüyse
              normalizedResponse = {
                jobs: response,
                total_jobs: response.length,
                count: response.length
              };
              console.log('getFilteredJobs: Array formatındaki yanıt normalize edildi');
            } else if (response.results && Array.isArray(response.results)) {
              // API Django REST framework pagination formatında döndürdüyse
              normalizedResponse = {
                jobs: response.results,
                total_jobs: response.count,
                count: response.count,
                next: response.next,
                previous: response.previous
              };
              console.log('getFilteredJobs: Pagination formatındaki yanıt normalize edildi');
            } else if (response.jobs && Array.isArray(response.jobs)) {
              // API zaten bizim istediğimiz formatta döndürdüyse
              normalizedResponse = response;
              console.log('getFilteredJobs: Yanıt zaten doğru formatta');
            } else {
              // Hiçbir formata uymuyorsa, boş bir yanıt oluştur
              console.warn('getFilteredJobs: Bilinmeyen API yanıt formatı, varsayılan değerler kullanılıyor');
              normalizedResponse = {
                jobs: [],
                total_jobs: 0,
                count: 0
              };
            }
            
            console.log('getFilteredJobs: Normalize edilmiş yanıt:', normalizedResponse);
            resolve(normalizedResponse);
          } catch (e) {
            console.error('getFilteredJobs: JSON parse hatası:', e);
            reject(new Error('Sunucu yanıtı geçersiz JSON formatında'));
            return;
          }
        } else {
          console.error('getFilteredJobs: HTTP error', xhr.status, xhr.statusText);
          console.error('getFilteredJobs: Response body:', xhr.responseText);
          
          let errorMessage = 'Filtrelenmiş iş başvuruları alınırken bir hata oluştu.';
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            if (errorResponse.detail) {
              errorMessage = errorResponse.detail;
            }
          } catch (e) {
            console.error('getFilteredJobs: Hata yanıtı JSON parse hatası:', e);
          }
          
          if (xhr.status === 401) {
            errorMessage = 'Oturum süresi dolmuş olabilir, lütfen tekrar giriş yapın.';
          }
          
          reject(new Error(errorMessage));
        }
      };
      
      xhr.onerror = function() {
        console.error('getFilteredJobs: Network error occurred');
        reject(new Error('Ağ hatası oluştu. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.'));
      };
      
      xhr.ontimeout = function() {
        console.error('getFilteredJobs: Request timeout');
        reject(new Error('İstek zaman aşımına uğradı. Lütfen daha sonra tekrar deneyin.'));
      };
      
      xhr.timeout = 15000; // 15 saniye timeout
      
      xhr.send();
    });
  } catch (error) {
    console.error('Filtrelenmiş iş başvuruları alınırken hata oluştu:', error);
    throw error;
  }
};

// ID'ye göre iş başvurusu getir
export const getJobById = async (id) => {
  try {
    console.log(`getJobById: ${id} ID'li iş başvurusu için API isteği yapılıyor`); // Debug için
    
    // Token kontrolü
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      console.error('getJobById: Token bulunamadı, kullanıcı giriş yapmamış olabilir');
      throw new Error('Yetkilendirme hatası: Lütfen tekrar giriş yapın');
    }
    
    const url = `${API_URL}/job/show/${id}/`;
    console.log('getJobById: URL:', url);
    console.log('getJobById: Token kullanılıyor');
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Authorization', `Token ${token}`);
      
      xhr.onload = function() {
        console.log('getJobById: XHR onload - status:', xhr.status, xhr.statusText);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('getJobById: Başarılı yanıt alındı');
          
          let response;
          try {
            response = JSON.parse(xhr.responseText);
            console.log('getJobById: İş başvurusu alındı:', response);
          } catch (e) {
            console.error('getJobById: JSON parse hatası:', e);
            reject(new Error('Sunucu yanıtı geçersiz JSON formatında'));
            return;
          }
          
          resolve(response);
        } else {
          console.error('getJobById: HTTP error', xhr.status, xhr.statusText);
          console.error('getJobById: Response body:', xhr.responseText);
          
          let errorMessage = 'İş başvurusu alınırken bir hata oluştu.';
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            if (errorResponse.detail) {
              errorMessage = errorResponse.detail;
            }
          } catch (e) {
            console.error('getJobById: Hata yanıtı JSON parse hatası:', e);
          }
          
          if (xhr.status === 401) {
            errorMessage = 'Oturum süresi dolmuş olabilir, lütfen tekrar giriş yapın.';
          } else if (xhr.status === 404) {
            errorMessage = `${id} ID'li iş başvurusu bulunamadı.`;
          }
          
          reject(new Error(errorMessage));
        }
      };
      
      xhr.onerror = function() {
        console.error('getJobById: Network error occurred');
        reject(new Error('Ağ hatası oluştu. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.'));
      };
      
      xhr.ontimeout = function() {
        console.error('getJobById: Request timeout');
        reject(new Error('İstek zaman aşımına uğradı. Lütfen daha sonra tekrar deneyin.'));
      };
      
      xhr.timeout = 15000; // 15 saniye timeout
      
      xhr.send();
    });
  } catch (error) {
    console.error('İş başvurusu alınırken hata oluştu:', error);
    throw error;
  }
};

// Yeni iş başvurusu ekle
export const addJob = async (jobData) => {
  try {
    console.log('addJob: Yeni iş başvurusu için API isteği hazırlanıyor', jobData); // Debug için
    
    // Durum (status) kontrolü
    console.log('addJob: Durum (status) kontrolü:', {
      statusValue: jobData.status,
      statusType: typeof jobData.status,
      validValues: JOB_STATUSES.map(s => s.value)
    });
    
    // İzin verilen değerlerden biri mi kontrol et
    const isValidStatus = JOB_STATUSES.some(s => s.value === jobData.status);
    if (!isValidStatus) {
      console.warn(`addJob: Geçersiz durum değeri: ${jobData.status}, varsayılan 'applied' değeri kullanılacak`);
      jobData.status = 'applied'; // Varsayılan değer
    } else {
      console.log(`addJob: Geçerli durum değeri: ${jobData.status}`);
    }
    
    // Form alanlarının tiplerini kontrol et
    console.log('addJob: Form alanlarının tipleri:');
    Object.keys(jobData).forEach(key => {
      console.log(`  - ${key}: ${typeof jobData[key]} (${jobData[key] === null ? 'null' : jobData[key] === '' ? 'boş string' : 'değer mevcut'})`);
    });
    
    // Token kontrolü
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      console.error('addJob: Token bulunamadı, kullanıcı giriş yapmamış olabilir');
      throw new Error('Yetkilendirme hatası: Lütfen tekrar giriş yapın');
    }
    
    console.log('addJob: Token kullanılıyor:', token);
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/job/add/`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Authorization', `Token ${token}`);
      
      xhr.onload = function() {
        console.log('addJob: XHR onload - status:', xhr.status, xhr.statusText);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('addJob: Başarılı yanıt:', xhr.responseText);
          
          let response;
          try {
            response = JSON.parse(xhr.responseText);
            console.log('addJob: Yanıt içindeki status değeri:', response.status);
          } catch (e) {
            console.error('addJob: JSON parse hatası:', e);
            reject(new Error('Sunucu yanıtı geçersiz JSON formatında'));
            return;
          }
          
          resolve(response);
        } else {
          console.error('addJob: HTTP error', xhr.status, xhr.statusText);
          console.error('addJob: Response body:', xhr.responseText);
          
          let errorMessage = 'İş başvurusu eklenirken bir hata oluştu.';
          let errorDetails = {};
          
          try {
            if (xhr.responseText) {
              const errorResponse = JSON.parse(xhr.responseText);
              console.log('addJob: Hata yanıtı:', errorResponse);
              
              errorDetails = errorResponse;
              
              if (errorResponse.detail) {
                errorMessage = errorResponse.detail;
              } else if (typeof errorResponse === 'object') {
                // İlk hata mesajını bul
                for (const key in errorResponse) {
                  if (Array.isArray(errorResponse[key]) && errorResponse[key].length > 0) {
                    errorMessage = `${key}: ${errorResponse[key][0]}`;
                    break;
                  }
                }
              }
            }
          } catch (e) {
            console.error('addJob: Hata yanıtı JSON parse hatası:', e);
          }
          
          if (xhr.status === 401) {
            errorMessage = 'Oturum süresi dolmuş olabilir, lütfen tekrar giriş yapın.';
          } else if (xhr.status === 400) {
            errorMessage = `İstekte hatalı alanlar: ${JSON.stringify(errorDetails)}`;
          }
          
          reject(new Error(errorMessage));
        }
      };
      
      xhr.onerror = function() {
        console.error('addJob: Network error occurred');
        reject(new Error('Ağ hatası oluştu. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.'));
      };
      
      xhr.ontimeout = function() {
        console.error('addJob: Request timeout');
        reject(new Error('İstek zaman aşımına uğradı. Lütfen daha sonra tekrar deneyin.'));
      };
      
      xhr.timeout = 15000; // 15 saniye timeout
      
      // Veri hazırlama
      // null değerleri temizleyelim, backend bazen null değerleri kabul etmeyebilir
      const cleanedData = {};
      Object.keys(jobData).forEach(key => {
        // null değilse ve boş string değilse ekleyelim
        if (jobData[key] !== null && jobData[key] !== '') {
          cleanedData[key] = jobData[key];
        }
      });
      
      // Status alanını her zaman ekle, boş bile olsa
      if (!cleanedData.status) {
        cleanedData.status = 'applied'; // Varsayılan değer
      }
      
      const data = JSON.stringify(cleanedData);
      console.log('addJob: Temizlenmiş gönderilen veri:', data);
      
      xhr.send(data);
    });
  } catch (error) {
    console.error('İş başvurusu eklenirken hata oluştu:', error);
    throw error;
  }
};

// İş başvurusu güncelle
export const updateJob = async (id, jobData) => {
  try {
    console.log(`updateJob: ${id} ID'li iş başvurusu güncelleniyor`, jobData); // Debug için
    
    // Token kontrolü
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      console.error('updateJob: Token bulunamadı, kullanıcı giriş yapmamış olabilir');
      throw new Error('Yetkilendirme hatası: Lütfen tekrar giriş yapın');
    }
    
    const url = `${API_URL}/job/update/${id}/`;
    console.log('updateJob: URL:', url);
    console.log('updateJob: Token kullanılıyor');
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PATCH', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Authorization', `Token ${token}`);
      
      xhr.onload = function() {
        console.log('updateJob: XHR onload - status:', xhr.status, xhr.statusText);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('updateJob: Başarılı yanıt alındı');
          
          let response;
          try {
            response = JSON.parse(xhr.responseText);
            console.log('updateJob: İş başvurusu güncellendi:', response);
          } catch (e) {
            console.error('updateJob: JSON parse hatası:', e);
            reject(new Error('Sunucu yanıtı geçersiz JSON formatında'));
            return;
          }
          
          resolve(response);
        } else {
          console.error('updateJob: HTTP error', xhr.status, xhr.statusText);
          console.error('updateJob: Response body:', xhr.responseText);
          
          let errorMessage = 'İş başvurusu güncellenirken bir hata oluştu.';
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            if (errorResponse.detail) {
              errorMessage = errorResponse.detail;
            } else if (typeof errorResponse === 'object') {
              // İlk hata mesajını bul
              for (const key in errorResponse) {
                if (Array.isArray(errorResponse[key]) && errorResponse[key].length > 0) {
                  errorMessage = `${key}: ${errorResponse[key][0]}`;
                  break;
                }
              }
            }
          } catch (e) {
            console.error('updateJob: Hata yanıtı JSON parse hatası:', e);
          }
          
          if (xhr.status === 401) {
            errorMessage = 'Oturum süresi dolmuş olabilir, lütfen tekrar giriş yapın.';
          } else if (xhr.status === 404) {
            errorMessage = `${id} ID'li iş başvurusu bulunamadı.`;
          }
          
          reject(new Error(errorMessage));
        }
      };
      
      xhr.onerror = function() {
        console.error('updateJob: Network error occurred');
        reject(new Error('Ağ hatası oluştu. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.'));
      };
      
      xhr.ontimeout = function() {
        console.error('updateJob: Request timeout');
        reject(new Error('İstek zaman aşımına uğradı. Lütfen daha sonra tekrar deneyin.'));
      };
      
      xhr.timeout = 15000; // 15 saniye timeout
      
      const data = JSON.stringify(jobData);
      console.log('updateJob: Gönderilen veri:', data);
      
      xhr.send(data);
    });
  } catch (error) {
    console.error('İş başvurusu güncellenirken hata oluştu:', error);
    throw error;
  }
};

// İş başvurusu sil
export const deleteJob = async (id) => {
  try {
    console.log(`deleteJob: ${id} ID'li iş başvurusu siliniyor`); // Debug için
    
    // Token kontrolü
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      console.error('deleteJob: Token bulunamadı, kullanıcı giriş yapmamış olabilir');
      throw new Error('Yetkilendirme hatası: Lütfen tekrar giriş yapın');
    }
    
    const url = `${API_URL}/job/delete/${id}/`;
    console.log('deleteJob: URL:', url);
    console.log('deleteJob: Token kullanılıyor');
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('DELETE', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Authorization', `Token ${token}`);
      
      xhr.onload = function() {
        console.log('deleteJob: XHR onload - status:', xhr.status, xhr.statusText);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('deleteJob: Başarılı yanıt alındı');
          
          let response = {};
          if (xhr.responseText) {
            try {
              response = JSON.parse(xhr.responseText);
            } catch (e) {
              console.error('deleteJob: JSON parse hatası:', e);
              // Silme işleminde boş yanıt olabilir, bu bir hata değil
            }
          }
          
          resolve(response);
        } else {
          console.error('deleteJob: HTTP error', xhr.status, xhr.statusText);
          console.error('deleteJob: Response body:', xhr.responseText);
          
          let errorMessage = 'İş başvurusu silinirken bir hata oluştu.';
          try {
            if (xhr.responseText) {
              const errorResponse = JSON.parse(xhr.responseText);
              if (errorResponse.detail) {
                errorMessage = errorResponse.detail;
              }
            }
          } catch (e) {
            console.error('deleteJob: Hata yanıtı JSON parse hatası:', e);
          }
          
          if (xhr.status === 401) {
            errorMessage = 'Oturum süresi dolmuş olabilir, lütfen tekrar giriş yapın.';
          } else if (xhr.status === 404) {
            errorMessage = `${id} ID'li iş başvurusu bulunamadı.`;
          }
          
          reject(new Error(errorMessage));
        }
      };
      
      xhr.onerror = function() {
        console.error('deleteJob: Network error occurred');
        reject(new Error('Ağ hatası oluştu. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.'));
      };
      
      xhr.ontimeout = function() {
        console.error('deleteJob: Request timeout');
        reject(new Error('İstek zaman aşımına uğradı. Lütfen daha sonra tekrar deneyin.'));
      };
      
      xhr.timeout = 15000; // 15 saniye timeout
      
      xhr.send();
    });
  } catch (error) {
    console.error('İş başvurusu silinirken hata oluştu:', error);
    throw error;
  }
}; 