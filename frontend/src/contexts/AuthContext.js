import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, logout as apiLogout, register as apiRegister, isAuthenticated, getCurrentUser, getUserProfile } from '../api/authAPI';

// Context oluştur
const AuthContext = createContext(null);

// Context provider bileşeni
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sayfa yüklendiğinde oturum durumunu kontrol et
  useEffect(() => {
    console.log('AuthProvider: İlk yükleme - oturum kontrolü yapılıyor...'); // Debug log
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('checkAuth: Oturum kontrolü başlıyor...'); // Debug log
    try {
      setIsLoading(true);
      setError(null);
      
      const authenticated = isAuthenticated();
      console.log(`checkAuth: İsAuthenticated sonucu: ${authenticated}`); // Debug log
      
      if (authenticated) {
        try {
          // Kullanıcı profil bilgilerini API'den al
          const profile = await getUserProfile();
          console.log('checkAuth: Profil API yanıtı:', profile); // Debug log
          
          setUser(profile);
          setIsAuth(true);
          console.log('checkAuth: Kullanıcı profili yüklendi ve oturum doğrulandı'); // Debug log
        } catch (profileError) {
          console.error('checkAuth: Profil bilgileri alınırken hata:', profileError); // Debug log
          
          // API'den profil alınamazsa local storage'dan al
          const currentUser = getCurrentUser();
          console.log('checkAuth: localStorage\'dan kullanıcı bilgileri:', currentUser); // Debug log
          
          if (currentUser) {
            setUser(currentUser);
            setIsAuth(true);
            console.log('checkAuth: LocalStorage\'dan kullanıcı oturumu doğrulandı'); // Debug log
          } else {
            // LocalStorage'da token var ama kullanıcı bilgisi yok - tutarsız durum
            console.warn('checkAuth: Token mevcut ama kullanıcı bilgisi bulunamadı, oturum temizleniyor...'); // Debug log
            await apiLogout();
            setIsAuth(false);
            setUser(null);
          }
        }
      } else {
        console.log('checkAuth: Kullanıcı girişi yapılmamış'); // Debug log
        setIsAuth(false);
        setUser(null);
      }
    } catch (err) {
      console.error('checkAuth: Oturum kontrolü sırasında hata:', err); // Debug log
      setError('Oturum kontrolü sırasında bir hata oluştu.');
      setIsAuth(false);
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log('checkAuth: Oturum kontrolü tamamlandı'); // Debug log
    }
  };

  // Giriş işlemi
  const login = async (email, password) => {
    console.log('login: Giriş işlemi başlatılıyor...'); // Debug log
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiLogin(email, password);
      console.log('login: API yanıtı:', data); // Debug log
      
      if (data && data.success) {
        // Başarılı giriş durumunda kullanıcı bilgilerini güncelle
        setUser(data.user);
        setIsAuth(true);
        console.log('login: Kullanıcı girişi başarılı'); // Debug log
        return { success: true };
      } else if (data && data.error) {
        console.error('login: Giriş başarısız, API hata mesajı:', data.error); // Debug log
        setError(data.error);
        return { success: false, error: data.error };
      } else {
        throw new Error('Geçersiz giriş yanıtı');
      }
    } catch (err) {
      console.error('login: Giriş sırasında hata:', err); // Debug log
      setError(err.message || 'Giriş işlemi sırasında bir hata oluştu.');
      return { success: false, error: err.message || 'Giriş yapılamadı. Lütfen tekrar deneyin.' };
    } finally {
      setIsLoading(false);
      console.log('login: Giriş işlemi tamamlandı'); // Debug log
    }
  };
  
  // Kayıt işlemi
  const register = async (userData) => {
    console.log('register: Kayıt işlemi başlatılıyor...', {
      email: userData.email,
      name: userData.name,
      // Şifreyi loglamıyoruz
      passwordProvided: !!userData.password
    }); 
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiRegister(userData);
      console.log('register: API yanıtı:', {
        success: data.success,
        hasToken: !!data.token,
        hasUser: !!data.user,
        hasError: !!data.error,
        hasWarning: !!data.warning,
        hasMessage: !!data.message
      });
      
      if (data && data.success) {
        // Başarılı kayıt durumunda giriş sayfasına yönlendirmek için state'i güncelleme
        setIsAuth(false);
        setUser(null);
        console.log('register: Kullanıcı kaydı başarılı, login sayfasına yönlendirilecek');
        
        // Başarı mesajını göster
        return { 
          success: true, 
          message: data.message || 'Kayıt başarılı, lütfen giriş yapın.',
          redirectToLogin: true
        };
      } else if (data && data.error) {
        console.error('register: Kayıt başarısız, API hata mesajı:', data.error); 
        setError(data.error);
        return { success: false, error: data.error };
      } else {
        console.error('register: Belirsiz API yanıtı:', data);
        throw new Error('Geçersiz kayıt yanıtı');
      }
    } catch (err) {
      console.error('register: Kayıt sırasında hata:', err.message); 
      // Detaylı hata bilgisini logla
      if (err.response) {
        console.error('register: Hata yanıtı detayları:', {
          status: err.response.status,
          data: err.response.data
        });
      }
      setError(err.message || 'Kayıt işlemi sırasında bir hata oluştu.');
      return { success: false, error: err.message || 'Kayıt yapılamadı. Lütfen tekrar deneyin.' };
    } finally {
      setIsLoading(false);
      console.log('register: Kayıt işlemi tamamlandı'); 
    }
  };

  // Çıkış işlemi
  const logout = async () => {
    console.log('logout: Çıkış işlemi başlatılıyor...'); // Debug log
    try {
      setIsLoading(true);
      setError(null);
      
      // Önce state'i temizleyelim
      setUser(null);
      setIsAuth(false);
      
      // Sonra API'yi çağıralım
      const result = await apiLogout();
      console.log('logout: API yanıtı:', result);
      
      // Başarılı ya da başarısız, çıkış yapılmış kabul edilecek
      console.log('logout: Kullanıcı çıkışı başarılı'); // Debug log
      return { success: true };
    } catch (err) {
      console.error('logout: Çıkış sırasında hata:', err); // Debug log
      // Hataya rağmen session'ı sonlandırdık, başarılı kabul ediyoruz
      return { success: true, warning: 'Çıkış yapıldı ancak bazı işlemler tamamlanamadı' };
    } finally {
      setIsLoading(false);
      console.log('logout: Çıkış işlemi tamamlandı'); // Debug log
    }
  };

  // Context değerleri
  const value = {
    isAuthenticated: isAuth,
    user,
    login,
    logout,
    register,
    isLoading,
    error,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Context'i kullanmak için özel hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth hook\'u bir AuthProvider içinde kullanılmalıdır');
  }
  return context;
};

export default AuthContext; 