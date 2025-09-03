import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft,
  Dashboard,
  PersonAdd,
  People,
  Assessment,
  Settings,
  Notifications,
  ExitToApp,
  AccountCircle,
  Business,
  Analytics,
  AdminPanelSettings,
  Security,
  BarChart,
  Timeline,
  Groups,
  QrCodeScanner
} from '@mui/icons-material';
import { useAuth, ROLES } from '../../contexts/AuthContext';

const DRAWER_WIDTH = 280;

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission, hasRole } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const getNavigationItems = () => {
    const items = [];

    // Dashboard - disponible para todos
    items.push({
      id: 'dashboard',
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
      color: theme.palette.primary.main
    });

    // Registro de visitantes - Admin y Manager
    if (hasPermission('visitor.register')) {
      items.push({
        id: 'register',
        text: 'Registrar Visitante',
        icon: <PersonAdd />,
        path: '/register',
        color: theme.palette.success.main
      });
    }

    // Lista de visitantes - todos con diferentes permisos
    if (hasPermission('visitor.view')) {
      items.push({
        id: 'visitors',
        text: 'Visitantes',
        icon: <People />,
        path: '/visitors',
        color: theme.palette.info.main,
        badge: '24' // Ejemplo de visitantes activos
      });
    }

    // Escáner QR - Admin y Manager
    if (hasPermission('visitor.register')) {
      items.push({
        id: 'scanner',
        text: 'Escáner QR',
        icon: <QrCodeScanner />,
        path: '/scanner',
        color: theme.palette.secondary.main
      });
    }

    // Reportes - todos con diferentes niveles
    if (hasPermission('reports.view')) {
      items.push({
        id: 'reports',
        text: 'Reportes',
        icon: <Assessment />,
        path: '/reports',
        color: theme.palette.warning.main
      });
    }

    // Analytics avanzados - Manager y Admin
    if (hasRole(ROLES.ADMIN) || hasRole(ROLES.MANAGER)) {
      items.push({
        id: 'analytics',
        text: 'Análisis Avanzado',
        icon: <Timeline />,
        path: '/analytics',
        color: theme.palette.purple?.main || '#9c27b0'
      });
    }

    // Gestión de usuarios - Solo Admin
    if (hasPermission('users.manage')) {
      items.push({
        id: 'users',
        text: 'Gestión de Usuarios',
        icon: <Groups />,
        path: '/users',
        color: theme.palette.error.main
      });
    }

    // Configuraciones - Solo Admin
    if (hasPermission('settings.manage')) {
      items.push({
        id: 'settings',
        text: 'Configuración',
        icon: <Settings />,
        path: '/settings',
        color: theme.palette.grey[600]
      });
    }

    return items;
  };

  const getRoleInfo = () => {
    const roleConfigs = {
      [ROLES.ADMIN]: {
        label: 'Administrador',
        color: theme.palette.error.main,
        icon: <AdminPanelSettings />
      },
      [ROLES.MANAGER]: {
        label: 'Gerente',
        color: theme.palette.warning.main,
        icon: <Business />
      },
      [ROLES.ANALYST]: {
        label: 'Analista',
        color: theme.palette.success.main,
        icon: <Analytics />
      }
    };

    return roleConfigs[user.role] || roleConfigs[ROLES.ANALYST];
  };

  const roleInfo = getRoleInfo();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          color: theme.palette.text.primary
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Sistema de Control de Visitas
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Notificaciones">
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                padding: '4px 12px',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08)
                }
              }}
              onClick={handleProfileMenuOpen}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: roleInfo.color,
                  fontSize: '0.875rem'
                }}
              >
                {user.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" sx={{ lineHeight: 1 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {roleInfo.label}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 200,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Mi Perfil
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          Cerrar Sesión
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerOpen ? DRAWER_WIDTH : theme.spacing(7),
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          '& .MuiDrawer-paper': {
            width: drawerOpen ? DRAWER_WIDTH : theme.spacing(7),
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          },
        }}
      >
        <Toolbar />
        
        {/* User Profile Section */}
        {drawerOpen && (
          <Box sx={{ p: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                background: `linear-gradient(135deg, ${roleInfo.color}15 0%, ${roleInfo.color}08 100%)`,
                border: `1px solid ${alpha(roleInfo.color, 0.2)}`,
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: roleInfo.color,
                    mr: 2
                  }}
                >
                  {roleInfo.icon}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                    {user.department}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={roleInfo.label}
                size="small"
                sx={{
                  bgcolor: roleInfo.color,
                  color: 'white',
                  fontWeight: 500,
                  '& .MuiChip-icon': { color: 'white' }
                }}
                icon={roleInfo.icon}
              />
            </Paper>
          </Box>
        )}

        <Divider />

        {/* Navigation */}
        <List sx={{ px: 1, py: 2 }}>
          {getNavigationItems().map((item) => (
            <ListItemButton
              key={item.id}
              onClick={() => handleNavigate(item.path)}
              selected={isActiveRoute(item.path)}
              sx={{
                minHeight: 48,
                mb: 0.5,
                borderRadius: 2,
                backgroundColor: isActiveRoute(item.path)
                  ? alpha(item.color, 0.12)
                  : 'transparent',
                '&:hover': {
                  backgroundColor: alpha(item.color, 0.08),
                  '& .MuiListItemIcon-root': {
                    color: item.color,
                  }
                },
                '&.Mui-selected': {
                  backgroundColor: alpha(item.color, 0.12),
                  '&:hover': {
                    backgroundColor: alpha(item.color, 0.16),
                  },
                  '& .MuiListItemIcon-root': {
                    color: item.color,
                  },
                  '& .MuiListItemText-primary': {
                    color: item.color,
                    fontWeight: 600,
                  }
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: drawerOpen ? 3 : 'auto',
                  justifyContent: 'center',
                  color: isActiveRoute(item.path)
                    ? item.color
                    : alpha(item.color, 0.7)
                }}
              >
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              
              {drawerOpen && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActiveRoute(item.path) ? 600 : 500,
                    color: isActiveRoute(item.path) ? item.color : 'inherit'
                  }}
                />
              )}
            </ListItemButton>
          ))}
        </List>

        <Box sx={{ flexGrow: 1 }} />
        
        {/* Bottom section */}
        {drawerOpen && (
          <Box sx={{ p: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                background: alpha(theme.palette.success.main, 0.08),
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                borderRadius: 2,
                textAlign: 'center'
              }}
            >
              <Security sx={{ color: theme.palette.success.main, mb: 1 }} />
              <Typography variant="caption" display="block" sx={{ fontWeight: 500 }}>
                Sistema Seguro
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Conexión encriptada
              </Typography>
            </Paper>
          </Box>
        )}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: theme.palette.background.default,
          minHeight: '100vh',
          overflow: 'hidden'
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3, height: 'calc(100vh - 64px)', overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;