import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import theme from './theme/theme';
import Login from './components/Login';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './components/Dashboard/Dashboard';
import VisitorRegistration from './components/VisitorRegistration';
import VisitorList from './components/VisitorList';
import Reports from './components/Reports';
import UserManagement from './components/Users/UserManagement';
import AdvancedAnalytics from './components/Analytics/AdvancedAnalytics';
import QRScanner from './components/Scanner/QRScanner';
import SystemSettings from './components/Settings/SystemSettings';

// Import Google Fonts
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

// Protected Route Component
const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user, hasPermission, loading } = useAuth();
  
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// App Routes Component
const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <CircularProgress sx={{ color: 'white' }} size={60} />
      </Box>
    );
  }
  
  if (!user) {
    return <Login />;
  }
  
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <ProtectedRoute requiredPermission="visitor.register">
              <VisitorRegistration />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/visitors" 
          element={
            <ProtectedRoute requiredPermission="visitor.view">
              <VisitorList />
            </ProtectedRoute>
          } 
        />
        
        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredPermission="reports.view">
              <Reports />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/users"
          element={
            <ProtectedRoute requiredPermission="users.manage">
              <UserManagement />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/analytics"
          element={
            <ProtectedRoute requiredPermission="analytics.view">
              <AdvancedAnalytics />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/scanner"
          element={
            <ProtectedRoute requiredPermission="visitor.register">
              <QRScanner />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/settings"
          element={
            <ProtectedRoute requiredPermission="system.settings">
              <SystemSettings />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/scanner" 
          element={
            <ProtectedRoute requiredPermission="visitor.register">
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <h2>Escáner QR</h2>
                <p>Funcionalidad de escáner QR en desarrollo...</p>
              </Box>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute requiredPermission="system.monitor">
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <h2>Análisis Avanzado</h2>
                <p>Dashboard de análisis avanzado en desarrollo...</p>
              </Box>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/users" 
          element={
            <ProtectedRoute requiredPermission="users.manage">
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <h2>Gestión de Usuarios</h2>
                <p>Panel de gestión de usuarios en desarrollo...</p>
              </Box>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute requiredPermission="settings.manage">
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <h2>Configuración</h2>
                <p>Panel de configuración del sistema en desarrollo...</p>
              </Box>
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
};

// Main App Component
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ minHeight: '100vh' }}>
            <AppRoutes />
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;