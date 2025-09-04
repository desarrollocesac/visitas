import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Link,
  Divider
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';

const MaintenanceMenu = ({ children, currentSection }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'document-types',
      text: 'Tipos de Documentos',
      icon: <DescriptionIcon />,
      path: '/maintenance/document-types',
      color: 'primary.main'
    },
    {
      id: 'employees',
      text: 'Empleados',
      icon: <PeopleIcon />,
      path: '/maintenance/employees',
      color: 'success.main'
    },
    {
      id: 'departments',
      text: 'Departamentos',
      icon: <BusinessIcon />,
      path: '/maintenance/departments',
      color: 'info.main'
    },
    {
      id: 'authorized-areas',
      text: 'Áreas Autorizadas',
      icon: <SecurityIcon />,
      path: '/maintenance/authorized-areas',
      color: 'warning.main'
    }
  ];

  const handleNavigate = (path) => {
    navigate(path);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const getSectionTitle = () => {
    const section = menuItems.find(item => isActiveRoute(item.path));
    return section ? section.text : 'Mantenimientos';
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Sidebar Menu */}
      <Paper
        elevation={2}
        sx={{
          width: 280,
          mr: 3,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box sx={{ p: 3, backgroundColor: 'primary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SettingsIcon sx={{ mr: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Mantenimientos
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Gestión de datos maestros del sistema
          </Typography>
        </Box>

        <Divider />

        {/* Menu Items */}
        <List sx={{ p: 1 }}>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.id}
              onClick={() => handleNavigate(item.path)}
              selected={isActiveRoute(item.path)}
              sx={{
                mb: 0.5,
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: `${item.color}15`,
                  '&:hover': {
                    backgroundColor: `${item.color}20`,
                  },
                  '& .MuiListItemIcon-root': {
                    color: item.color,
                  },
                  '& .MuiListItemText-primary': {
                    color: item.color,
                    fontWeight: 600,
                  }
                },
                '&:hover': {
                  backgroundColor: `${item.color}08`,
                  '& .MuiListItemIcon-root': {
                    color: item.color,
                  }
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActiveRoute(item.path) ? item.color : 'text.secondary'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isActiveRoute(item.path) ? 600 : 500
                }}
              />
            </ListItemButton>
          ))}
        </List>

        {/* Footer Info */}
        <Box sx={{ mt: 'auto', p: 2, backgroundColor: 'grey.50' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            Sistema de Control de Visitas
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            Módulo de Mantenimientos
          </Typography>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1 }}>
        {/* Breadcrumbs */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/dashboard')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Dashboard
            </Link>
            <Typography color="text.primary" variant="body2">
              Mantenimientos
            </Typography>
            {currentSection && (
              <Typography color="text.primary" variant="body2" sx={{ fontWeight: 500 }}>
                {getSectionTitle()}
              </Typography>
            )}
          </Breadcrumbs>
        </Box>

        {/* Content Area */}
        <Box>
          {children ? children : (
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <SettingsIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Bienvenido a Mantenimientos
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Seleccione una opción del menú lateral para comenzar a gestionar los datos maestros del sistema.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                {menuItems.map((item) => (
                  <Paper
                    key={item.id}
                    elevation={1}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        elevation: 3,
                        backgroundColor: `${item.color}08`
                      }
                    }}
                    onClick={() => handleNavigate(item.path)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ color: item.color }}>
                        {item.icon}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.text}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MaintenanceMenu;