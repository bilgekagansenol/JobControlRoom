import axios from 'axios';

// API base URL - Create-React-App proxy kullanırken göreceli URL kullanmalıyız
const API_URL = '';

console.log('Kullanılan API URL base:', API_URL);

// Axios temel yapılandırması
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.timeout = 15000;

// Hata ayıklama için interceptor ekle
axios.interceptors.request.use(request => {
  console.log('Giden istek:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
    data: request.data,
    timeout: request.timeout
  });
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('Gelen yanıt:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  error => {
    if (error.response) {
      console.error('Yanıt hatası:', {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('İstek hatası (yanıt alınamadı):', error.request);
    } else {
      console.error('Genel axios hatası:', error.message);
    }
    return Promise.reject(error);
  }
);

// Kullanıcı bilgileri için mock veri
export const MOCK_USERS = [
  {
    id: 1,
    username: 'kullanici',
    password: 'sifre123',
    email: 'kullanici@mail.com',
    name: 'Test Kullanıcı'
  }
];

// Auth token için local storage anahtarı
export const TOKEN_KEY = 'job_app_token';
export const USER_KEY = 'job_app_user';

// LocalStorage'ın kullanılabilirliğini test et
function testLocalStorage() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    console.warn('LocalStorage bu ortamda kullanılamıyor');
    return false;
  }

  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    console.log('LocalStorage erişimi başarılı');
    return true;
  } catch (e) {
    console.error('LocalStorage erişim hatası:', e);
    return false;
  }
}

// Login işlemi - email ve şifre ile giriş - CORS sorunlarını aşmak için temel XHR kullanıyor
export const login = async (email, password) => {
  try {
    console.log('Login attempt with:', { email, password: '******' }); // Şifreyi loglamıyoruz
    
    // LocalStorage kullanılabilirliğini test et
    testLocalStorage();
    
    console.log('Login: İstek hazırlanıyor:', `${API_URL}/user/login/`);
    
    // XHR ile temel istek oluştur - CORS ön kontrol sorunlarını aşmak için
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/user/login/`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = function() {
        console.log('Login: XHR onload - status:', xhr.status, xhr.statusText);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('Login successful: Raw response:', xhr.responseText);
          
          let response;
          try {
            response = JSON.parse(xhr.responseText);
          } catch (e) {
            console.error('Login: JSON parse hatası:', e);
            reject(new Error('Sunucu yanıtı geçersiz JSON formatında'));
            return;
          }
          
          if (response && response.token) {
            try {
              console.log('Login: Token alındı ve kaydediliyor:', response.token);
              localStorage.setItem(TOKEN_KEY, response.token);
              
              const userInfo = {
                email: email,
                ...(response.user || {})
              };
              
              localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
              console.log('Token ve kullanıcı bilgileri başarıyla kaydedildi');
              console.log('LocalStorage kontrol:', {
                token: localStorage.getItem(TOKEN_KEY),
                user: localStorage.getItem(USER_KEY)
              });
            } catch (storageError) {
              console.error('LocalStorage erişim hatası:', storageError);
            }
            
            resolve({ 
              success: true, 
              user: response.user || { email },
              token: response.token 
            });
          } else {
            console.error('Login failed: Token bulunamadı');
            reject(new Error('Geçersiz sunucu yanıtı: Token bulunamadı'));
          }
        } else {
          console.error('Login failed: HTTP error', xhr.status, xhr.statusText);
          
          let errorMessage = 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.email?.[0] || 
                          errorResponse.username?.[0] || 
                          errorResponse.password?.[0] || 
                          errorResponse.non_field_errors?.[0] || 
                          errorResponse.detail ||
                          errorMessage;
          } catch (e) {
            console.error('Login: Hata yanıtı JSON parse hatası:', e);
          }
          
          resolve({ success: false, error: errorMessage });
        }
      };
      
      xhr.onerror = function() {
        console.error('Login: Network error occurred');
        resolve({ 
          success: false, 
          error: 'Ağ hatası oluştu. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.' 
        });
      };
      
      xhr.ontimeout = function() {
        console.error('Login: Request timeout');
        resolve({ 
          success: false, 
          error: 'İstek zaman aşımına uğradı. Lütfen daha sonra tekrar deneyin.' 
        });
      };
      
      xhr.timeout = 15000; // 15 saniye timeout
      
      const data = JSON.stringify({
        username: email, // Backend, email'i username olarak bekliyor
        password
      });
      
      xhr.send(data);
    });
  } catch (error) {
    console.error('Giriş yapılırken hata oluştu:', error);
    return { 
      success: false, 
      error: 'Beklenmeyen bir hata oluştu: ' + error.message 
    };
  }
};

// Çıkış işlemi
export const logout = async () => {
  console.log('Çıkış işlemi başlatılıyor...');
  
  try {
    // LocalStorage'dan token ve kullanıcı bilgilerini sil
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      console.log('Çıkış işlemi başarılı: Token ve kullanıcı bilgileri temizlendi');
    } else {
      console.warn('LocalStorage kullanılamıyor, token temizlenemedi');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Çıkış yaparken hata oluştu:', error);
    // Hataya rağmen çıkış işlemini başarılı kabul ediyoruz,
    // çünkü önemli olan sonraki sayfaya yönlendirme
    return { success: true, warning: 'Çıkış yapıldı ancak bazı veriler temizlenememiş olabilir' };
  }
};

// Kullanıcının giriş yapmış olup olmadığını kontrol et
export const isAuthenticated = () => {
  try {
    // LocalStorage kullanılabilirliği kontrolü
    if (!testLocalStorage()) {
      console.error('LocalStorage erişilemediği için oturum kontrolü yapılamadı');
      return false;
    }
    
    const token = localStorage.getItem(TOKEN_KEY);
    console.log(`Oturum kontrolü: Token ${token ? 'mevcut' : 'bulunamadı'}`); // Debug için
    return !!token;
  } catch (error) {
    console.error('Oturum kontrolü sırasında hata:', error);
    return false;
  }
};

// Giriş yapmış kullanıcının bilgilerini al
export const getCurrentUser = () => {
  try {
    // LocalStorage kullanılabilirliği kontrolü
    if (!testLocalStorage()) {
      console.error('LocalStorage erişilemediği için kullanıcı bilgileri alınamadı');
      return null;
    }
    
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) {
      console.log('Kullanıcı bilgileri bulunamadı'); // Debug için
      return null;
    }
    
    const user = JSON.parse(userJson);
    console.log('Mevcut kullanıcı bilgileri:', user); // Debug için
    return user;
  } catch (error) {
    console.error('Kullanıcı bilgileri alınırken hata:', error);
    return null;
  }
};

// Kullanıcı profil bilgilerini getir
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      console.error('getUserProfile: Token bulunamadı');
      throw new Error('Token bulunamadı, lütfen tekrar giriş yapın');
    }
    
    console.log('getUserProfile: API isteği hazırlanıyor');
    console.log('getUserProfile: Token formatı kontrol ediliyor');
    
    // Django Rest Framework'ün beklediği token formatını hazırla
    // Token zaten "Token xyz" formatında ise değiştirme, değilse ekle
    const authHeader = token.startsWith('Token ') ? token : `Token ${token}`;
    
    const response = await axios({
      method: 'get',
      url: `${API_URL}/user/profile/`,
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      },
      withCredentials: false  // CORS için
    });
    
    console.log('getUserProfile: Başarılı yanıt alındı');
    
    // Kullanıcı bilgilerini localStorage'da güncelle
    if (response.data) {
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));
      console.log('getUserProfile: Kullanıcı bilgileri güncellendi');
    }
    
    return response.data;
  } catch (error) {
    console.error('Kullanıcı profili alınırken hata oluştu:', error);
    
    // 401 hatası alındıysa token geçersiz olabilir
    if (error.response?.status === 401) {
      console.error('getUserProfile: Yetkisiz erişim (401), token geçersiz olabilir');
      // Kullanıcı bilgilerini ve token'ı temizle
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    
    throw error;
  }
};

// Şifre değiştirme
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      throw new Error('Token bulunamadı');
    }
    
    const response = await axios.post(`${API_URL}/user/change-password/`, {
      old_password: currentPassword,
      new_password: newPassword
    }, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Şifre değiştirilirken hata oluştu:', error);
    throw error;
  }
};

// Profil resmi güncelleme
export const updateProfileImage = async (imageFile) => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      throw new Error('Token bulunamadı');
    }
    
    // FormData oluştur ve resmi ekle
    const formData = new FormData();
    formData.append('profile_image', imageFile);
    
    const response = await axios.patch(`${API_URL}/user/profile-image-update/`, formData, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Kullanıcı bilgilerini localStorage'da güncelle
    if (response.data && response.data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Profil resmi güncellenirken hata oluştu:', error);
    throw error;
  }
};

// Şifre sıfırlama isteği
export const requestPasswordReset = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/user/reset-password-request/`, {
      email
    });
    
    return response.data;
  } catch (error) {
    console.error('Şifre sıfırlama isteği sırasında hata oluştu:', error);
    throw error;
  }
};

// Şifre sıfırlama onayı
export const confirmPasswordReset = async (uid, token, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/user/reset-password-confirm/`, {
      uid,
      token,
      new_password: newPassword
    });
    
    return response.data;
  } catch (error) {
    console.error('Şifre sıfırlama onayı sırasında hata oluştu:', error);
    throw error;
  }
};

// Kayıt olma işlemi - CORS sorunlarını aşmak için temel XHR kullanıyor
export const register = async (userData) => {
  try {
    console.log('register: Kayıt işlemi başlatılıyor...', { 
      email: userData.email, 
      name: userData.name,
      hasPassword: !!userData.password 
    });
    
    // API URL'ini kontrol et
    const registerUrl = `${API_URL}/user/profile/`;
    console.log('register: İstek gönderilecek URL:', registerUrl);
    
    // XHR ile temel istek oluştur - CORS ön kontrol sorunlarını aşmak için
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', registerUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('Register successful: Raw response:', xhr.responseText);
          
          let response;
          try {
            response = JSON.parse(xhr.responseText);
          } catch (e) {
            console.error('Register: JSON parse hatası:', e);
            reject(new Error('Sunucu yanıtı geçersiz JSON formatında'));
            return;
          }
          
          // Kayıt başarılı, fakat backend token dönmüyor - normalde login olmamız gerekiyor
          console.log('register: Kayıt başarılı, kullanıcı ID:', response.id);
          
          // Kullanıcı bilgilerini kaydet
          try {
            const userInfo = {
              email: userData.email,
              name: userData.name,
              id: response.id,
              ...response
            };
            
            localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
            console.log('register: Kullanıcı bilgileri localStorage\'a kaydedildi');
          } catch (storageError) {
            console.error('register: localStorage kayıt hatası:', storageError);
          }
          
          // Kayıt başarılı, kullanıcıyı login sayfasına yönlendir (token almak için)
          resolve({
            success: true,
            user: response || { email: userData.email, name: userData.name },
            message: 'Kayıt başarılı, lütfen giriş yapın'
          });
        } else {
          console.error('Register failed: HTTP error', xhr.status, xhr.statusText);
          
          let errorMessage = 'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.';
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.email?.[0] || 
                          errorResponse.name?.[0] || 
                          errorResponse.password?.[0] || 
                          errorResponse.detail ||
                          errorMessage;
          } catch (e) {
            console.error('Register: Hata yanıtı JSON parse hatası:', e);
          }
          
          resolve({ success: false, error: errorMessage });
        }
      };
      
      xhr.onerror = function() {
        console.error('Register: Network error occurred');
        resolve({ 
          success: false, 
          error: 'Ağ hatası oluştu. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.' 
        });
      };
      
      xhr.ontimeout = function() {
        console.error('Register: Request timeout');
        resolve({ 
          success: false, 
          error: 'İstek zaman aşımına uğradı. Lütfen daha sonra tekrar deneyin.' 
        });
      };
      
      xhr.timeout = 15000; // 15 saniye timeout
      
      const data = JSON.stringify({
        email: userData.email,
        name: userData.name,
        password: userData.password
      });
      
      xhr.send(data);
    });
  } catch (error) {
    console.error('Kayıt olunurken hata oluştu:', error);
    return { 
      success: false, 
      error: 'Beklenmeyen bir hata oluştu: ' + error.message 
    };
  }
}; 