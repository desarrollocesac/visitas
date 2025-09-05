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
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance with auth header
const createAxiosInstance = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: `${API_BASE}/api`,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
};

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
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const api = createAxiosInstance();
      const response = await api.get('/users');
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (role) => {
    const roleConfigs = {
      'ADMIN': {
        label: 'Administrador',
        color: theme.palette.error.main,
        icon: <AdminPanelSettings />,
        description: 'Acceso completo al sistema'
      },
      'MANAGER': {
        label: 'Gerente',
        color: theme.palette.warning.main,
        icon: <Business />,
        description: 'Gestión operativa y reportes'
      },
      'ANALYST': {
        label: 'Analista',
        color: theme.palette.success.main,
        icon: <Analytics />,
        description: 'Consultas y análisis'
      }
    };
    return roleConfigs[role] || roleConfigs['ANALYST'];
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
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      try {
        const api = createAxiosInstance();
        await api.delete(`/users/${userId}`);
        setAlertMessage('Usuario eliminado exitosamente');
        loadUsers(); // Reload the list
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Error al eliminar usuario');
      }
      setTimeout(() => setAlertMessage(''), 3000);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      const api = createAxiosInstance();
      await api.put(`/users/${userId}`, {
        is_active: !user.is_active
      });
      setAlertMessage('Estado del usuario actualizado');
      loadUsers(); // Reload the list
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError('Error al cambiar estado del usuario');
    }
  };

  const handleSaveUser = async (userData) => {
    setLoading(true);
    setError('');
    
    try {
      const api = createAxiosInstance();
      
      if (selectedUser) {
        // Update existing user
        await api.put(`/users/${selectedUser.id}`, userData);
        setAlertMessage('Usuario actualizado exitosamente');
      } else {
        // Create new user
        await api.post('/users', userData);
        setAlertMessage('Usuario creado exitosamente');
      }
      
      setOpenDialog(false);
      loadUsers(); // Reload the list
    } catch (err) {
      console.error('Error saving user:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al guardar usuario');
      }
    } finally {
      setLoading(false);
    }
    setTimeout(() => setAlertMessage(''), 3000);
  };

  const UserDialog = ({ open, onClose, user, onSave }) => {
    const [formData, setFormData] = useState({
      first_name: user ? user.first_name || '' : '',
      last_name: user ? user.last_name || '' : '',
      username: user?.username || '',
      email: user?.email || '',
      password: '', // Only for new users
      role: user?.role || 'ANALYST',
      phone: user?.phone || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      
      // Validate required fields
      if (!formData.first_name || !formData.last_name || !formData.username || !formData.email || !formData.role) {
        setError('Todos los campos son requeridos');
        return;
      }
      
      // For new users, password is required
      if (!user && !formData.password) {
        setError('La contraseña es requerida para usuarios nuevos');
        return;
      }
      
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
                  label="Nombre"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Usuario"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
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
              {!user && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contraseña"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required={!user}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
                    <MenuItem value="ADMIN">Administrador</MenuItem>
                    <MenuItem value="MANAGER">Gerente</MenuItem>
                    <MenuItem value="ANALYST">Analista</MenuItem>
                  </Select>
                </FormControl>
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
                  {users.filter(u => u.is_active === true).length}
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
                  {users.filter(u => u.role === 'ADMIN').length}
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
                  {users.filter(u => u.role === 'MANAGER').length}
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
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setAlertMessage('')}>
          {alertMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
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
                  <MenuItem value="ADMIN">Administrador</MenuItem>
                  <MenuItem value="MANAGER">Gerente</MenuItem>
                  <MenuItem value="ANALYST">Analista</MenuItem>
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
                <TableCell>Teléfono</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Último Acceso</TableCell>
                <TableCell>Fecha Creación</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                const statusInfo = getStatusInfo(user.is_active ? 'active' : 'inactive');
                const fullName = `${user.first_name} ${user.last_name}`;
                
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
                          {user.first_name[0]}{user.last_name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {fullName}
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
                        {user.phone || '-'}
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
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Nunca'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(user.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={user.is_active ? 'Desactivar usuario' : 'Activar usuario'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(user.id)}
                            color={user.is_active ? 'success' : 'error'}
                          >
                            {user.is_active ? <CheckCircle /> : <Block />}
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