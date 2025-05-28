import React from 'react';
import { Navigate } from 'react-router-dom';

// Lazy loading ile sayfaları import etmek için
const Login = React.lazy(() => import('../pages/Login').catch(err => {
  console.error('Login yüklenirken hata:', err);
  return { default: () => <div>Sayfa yüklenemedi</div> };
}));
const Register = React.lazy(() => import('../pages/Register').catch(err => {
  console.error('Register yüklenirken hata:', err);
  return { default: () => <div>Sayfa yüklenemedi</div> };
}));
const JobList = React.lazy(() => import('../pages/JobList').catch(err => {
  console.error('JobList yüklenirken hata:', err);
  return { default: () => <div>Sayfa yüklenemedi</div> };
}));
const JobDetail = React.lazy(() => import('../pages/JobDetail').catch(err => {
  console.error('JobDetail yüklenirken hata:', err);
  return { default: () => <div>Sayfa yüklenemedi</div> };
}));
const JobAdd = React.lazy(() => import('../pages/JobAdd').catch(err => {
  console.error('JobAdd yüklenirken hata:', err);
  return { default: () => <div>Sayfa yüklenemedi</div> };
}));
const JobEdit = React.lazy(() => import('../pages/JobEdit').catch(err => {
  console.error('JobEdit yüklenirken hata:', err);
  return { default: () => <div>Sayfa yüklenemedi</div> };
}));
const NotFound = React.lazy(() => import('../pages/NotFound').catch(err => {
  console.error('NotFound yüklenirken hata:', err);
  return { default: () => <div>Sayfa yüklenemedi</div> };
}));
const Profile = React.lazy(() => import('../pages/Profile').catch(err => {
  console.error('Profile yüklenirken hata:', err);
  return { default: () => <div>Sayfa yüklenemedi</div> };
}));

// Özel route bileşeni, sadece giriş yapmış kullanıcılar için
export const ProtectedRoute = ({ children, isAuthenticated }) => {
  console.log('ProtectedRoute: Auth durumu:', isAuthenticated);
  
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Kullanıcı giriş yapmamış, yönlendiriliyor...');
    return <Navigate to="/login" replace />;
  }
  
  console.log('ProtectedRoute: Kullanıcı giriş yapmış, erişim veriliyor');
  return children;
};

// Giriş yapmış kullanıcıları ana sayfaya yönlendirme
export const RedirectIfLoggedIn = ({ children, isAuthenticated }) => {
  console.log('RedirectIfLoggedIn: Auth durumu:', isAuthenticated);
  
  if (isAuthenticated) {
    console.log('RedirectIfLoggedIn: Kullanıcı zaten giriş yapmış, yönlendiriliyor...');
    return <Navigate to="/" replace />;
  }
  
  console.log('RedirectIfLoggedIn: Kullanıcı giriş yapmamış, sayfayı gösteriyorum');
  return children;
};

// Router yapılandırması (ana App.js içinde kullanılabilir)
export const routes = [
  {
    path: '/login',
    element: Login,
    protected: false,
    redirectIfLoggedIn: true
  },
  {
    path: '/register',
    element: Register,
    protected: false,
    redirectIfLoggedIn: true
  },
  {
    path: '/',
    element: JobList,
    protected: true
  },
  {
    path: '/job/add',
    element: JobAdd,
    protected: true
  },
  {
    path: '/job/:id',
    element: JobDetail,
    protected: true
  },
  {
    path: '/job/:id/edit',
    element: JobEdit,
    protected: true
  },
  {
    path: '/profile',
    element: Profile,
    protected: true
  },
  {
    path: '*',
    element: NotFound,
    protected: false
  }
]; 