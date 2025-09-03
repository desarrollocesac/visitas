import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Fab,
  Badge,
  Tooltip,
  Switch,
  FormControlLabel,
  Divider,
  alpha,
  useTheme
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  PersonAdd,
  Group,
  AdminPanelSettings,
  Business,
  Analytics,
  Search,
  FilterList,
  Download,
  Upload,
  MoreVert,
  Block,
  CheckCircle,
  Error,
  Warning
} from '@mui/icons-material';
import { useAuth, ROLES } from '../../contexts/AuthContext';

const UserManagement = () => {
  const theme = useTheme();
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Mock data for users
  const mockUsers = [
    {
      id: 1,
      name: 'María González',
      email: 'admin@empresa.com',
      role: ROLES.ADMIN,
      department: 'Administración',
      status: 'active',
      lastLogin: '2025-01-03 09:30',
      createdAt: '2024-01-15',
      permissions: ['*']
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      email: 'manager@empresa.com',
      role: ROLES.MANAGER,
      department: 'Gerencia',
      status: 'active',
      lastLogin: '2025-01-03 08:45',
      createdAt: '2024-02-20',
      permissions: ['visitor.*', 'reports.*', 'system.monitor']
    },
    {
      id: 3,
      name: 'Ana López',
      email: 'analyst@empresa.com',
      role: ROLES.ANALYST,
      department: 'Análisis',
      status: 'active',
      lastLogin: '2025-01-02 16:20',
      createdAt: '2024-03-10',
      permissions: ['visitor.view', 'reports.view']
    },
    {
      id: 4,
      name: 'Luis Martín',
      email: 'luis.martin@empresa.com',
      role: ROLES.MANAGER,
      department: 'Operaciones',
      status: 'inactive',
      lastLogin: '2024-12-28 14:15',
      createdAt: '2024-05-05',
      permissions: ['visitor.*', 'reports.*']
    },
    {
      id: 5,
      name: 'Sofia Herrera',
      email: 'sofia.herrera@empresa.com',
      role: ROLES.ANALYST,
      department: 'Marketing',
      status: 'active',
      lastLogin: '2025-01-03 10:00',
      createdAt: '2024-06-12',
      permissions: ['visitor.view', 'reports.view']
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const getRoleInfo = (role) => {
    const roleConfigs = {
      [ROLES.ADMIN]: {
        label: 'Administrador',
        color: theme.palette.error.main,
        icon: <AdminPanelSettings />,
        description: 'Acceso completo al sistema'
      },
      [ROLES.MANAGER]: {
        label: 'Gerente',
        color: theme.palette.warning.main,
        icon: <Business />,
        description: 'Gestión operativa y reportes'
      },
      [ROLES.ANALYST]: {
        label: 'Analista',
        color: theme.palette.success.main,
        icon: <Analytics />,
        description: 'Consultas y análisis'
      }
    };
    return roleConfigs[role] || roleConfigs[ROLES.ANALYST];
  };

  const getStatusInfo = (status) => {
    return {
      active: { 
        label: 'Activo', 
        color: theme.palette.success.main,
        icon: <CheckCircle />
      },
      inactive: { 
        label: 'Inactivo', 
        color: theme.palette.error.main,
        icon: <Block />
      },
      pending: { 
        label: 'Pendiente', 
        color: theme.palette.warning.main,
        icon: <Warning />
      }
    }[status];
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === '' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = () => {
    setSelectedUser(null);
    setOpenDialog(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      setUsers(users.filter(user => user.id !== userId));
      setAlertMessage('Usuario eliminado exitosamente');
      setTimeout(() => setAlertMessage(''), 3000);
    }
  };

  const handleToggleStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const handleSaveUser = (userData) => {
    if (selectedUser) {
      // Editar usuario existente
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, ...userData } : user
      ));
      setAlertMessage('Usuario actualizado exitosamente');
    } else {
      // Crear nuevo usuario
      const newUser = {
        ...userData,
        id: Math.max(...users.map(u => u.id)) + 1,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: 'Nunca'
      };
      setUsers([...users, newUser]);
      setAlertMessage('Usuario creado exitosamente');
    }
    setOpenDialog(false);
    setTimeout(() => setAlertMessage(''), 3000);
  };

  const UserDialog = ({ open, onClose, user, onSave }) => {
    const [formData, setFormData] = useState({
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || ROLES.ANALYST,
      department: user?.department || '',
      permissions: user?.permissions || []
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre Completo"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    value={formData.role}
                    label="Rol"
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <MenuItem value={ROLES.ADMIN}>Administrador</MenuItem>
                    <MenuItem value={ROLES.MANAGER}>Gerente</MenuItem>
                    <MenuItem value={ROLES.ANALYST}>Analista</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Departamento"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            startIcon={user ? <Edit /> : <PersonAdd />}
          >
            {user ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const StatsCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}08 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  {users.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Usuarios
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                <Group />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.success.main}08 100%)`,
          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                  {users.filter(u => u.status === 'active').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Usuarios Activos
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                <CheckCircle />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.error.main}15 0%, ${theme.palette.error.main}08 100%)`,
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                  {users.filter(u => u.role === ROLES.ADMIN).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Administradores
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main }}>
                <AdminPanelSettings />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.warning.main}15 0%, ${theme.palette.warning.main}08 100%)`,
          border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                  {users.filter(u => u.role === ROLES.MANAGER).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gerentes
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}>
                <Business />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Gestión de Usuarios
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Administra usuarios, roles y permisos del sistema
          </Typography>
        </Box>
        
        {hasPermission('users.manage') && (
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={handleCreateUser}
            sx={{ borderRadius: 2 }}
          >
            Crear Usuario
          </Button>
        )}
      </Box>

      {alertMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {alertMessage}
        </Alert>
      )}

      <StatsCards />

      {/* Filtros y búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filtrar por rol</InputLabel>
                <Select
                  value={filterRole}
                  label="Filtrar por rol"
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <MenuItem value="">Todos los roles</MenuItem>
                  <MenuItem value={ROLES.ADMIN}>Administrador</MenuItem>
                  <MenuItem value={ROLES.MANAGER}>Gerente</MenuItem>
                  <MenuItem value={ROLES.ANALYST}>Analista</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button startIcon={<Download />} variant="outlined">
                  Exportar
                </Button>
                <Button startIcon={<Upload />} variant="outlined">
                  Importar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Departamento</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Último Acceso</TableCell>
                <TableCell>Fecha Creación</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                const statusInfo = getStatusInfo(user.status);
                
                return (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{ 
                            bgcolor: roleInfo.color,
                            width: 40,
                            height: 40
                          }}
                        >
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={roleInfo.icon}
                        label={roleInfo.label}
                        size="small"
                        sx={{
                          bgcolor: roleInfo.color,
                          color: 'white',
                          '& .MuiChip-icon': { color: 'white' }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.department}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={statusInfo.icon}
                        label={statusInfo.label}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: statusInfo.color,
                          color: statusInfo.color
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.lastLogin}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.createdAt}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Ver detalles">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {hasPermission('users.manage') && (
                          <>
                            <Tooltip title="Editar usuario">
                              <IconButton 
                                size="small" 
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar usuario">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteUser(user.id)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <UserDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        user={selectedUser}
        onSave={handleSaveUser}
      />
    </Box>
  );
};

export default UserManagement;