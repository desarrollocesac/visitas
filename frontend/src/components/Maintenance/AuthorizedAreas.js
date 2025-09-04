import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
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

const AuthorizedAreas = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    security_level: 'Bajo',
    requires_escort: false,
    max_occupancy: '',
    location: '',
    is_active: true
  });

  const securityLevels = ['Bajo', 'Medio', 'Alto', 'Crítico'];

  const getSecurityLevelColor = (level) => {
    const colors = {
      'Bajo': 'success',
      'Medio': 'warning',
      'Alto': 'error',
      'Crítico': 'error'
    };
    return colors[level] || 'default';
  };

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    setLoading(true);
    setError('');
    try {
      const api = createAxiosInstance();
      const response = await api.get('/maintenance/authorized-areas');
      setAreas(response.data);
    } catch (err) {
      console.error('Error loading authorized areas:', err);
      setError('Error al cargar áreas autorizadas');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        security_level: item.security_level,
        requires_escort: item.requires_escort || false,
        max_occupancy: item.max_occupancy || '',
        location: item.location || '',
        is_active: item.is_active
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        security_level: 'Bajo',
        requires_escort: false,
        max_occupancy: '',
        location: '',
        is_active: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      security_level: 'Bajo',
      requires_escort: false,
      max_occupancy: '',
      location: '',
      is_active: true
    });
  };

  const handleInputChange = (field) => (event) => {
    const value = field === 'is_active' || field === 'requires_escort'
      ? event.target.checked
      : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('El nombre del área es requerido');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const api = createAxiosInstance();
      
      if (editingItem) {
        // Update existing item
        await api.put(`/maintenance/authorized-areas/${editingItem.id}`, formData);
        setSuccess('Área autorizada actualizada exitosamente');
      } else {
        // Create new item
        await api.post('/maintenance/authorized-areas', formData);
        setSuccess('Área autorizada creada exitosamente');
      }
      
      handleCloseDialog();
      loadAreas(); // Reload the list
    } catch (err) {
      console.error('Error saving authorized area:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al guardar área autorizada');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta área autorizada?')) {
      try {
        const api = createAxiosInstance();
        await api.delete(`/maintenance/authorized-areas/${id}`);
        setSuccess('Área autorizada eliminada exitosamente');
        loadAreas(); // Reload the list
      } catch (err) {
        console.error('Error deleting authorized area:', err);
        setError('Error al eliminar área autorizada');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SecurityIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Áreas Autorizadas
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Nueva Área
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nivel Seguridad</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ubicación</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Requisitos</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {areas.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id.substring(0, 8)}...</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.security_level}
                      color={getSecurityLevelColor(row.security_level)}
                      size="small"
                      variant={row.security_level === 'Crítico' ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>{row.location || '-'}</TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.requires_escort ? 'Requiere escolta' : 'Acceso libre'}
                      {row.max_occupancy && ` (Max: ${row.max_occupancy})`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.is_active ? 'Activo' : 'Inactivo'}
                      color={row.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(row)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(row.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog for Create/Edit */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          {editingItem ? 'Editar Área Autorizada' : 'Nueva Área Autorizada'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Nombre del Área"
              value={formData.name}
              onChange={handleInputChange('name')}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Descripción"
              value={formData.description}
              onChange={handleInputChange('description')}
              fullWidth
              margin="normal"
              multiline
              rows={2}
              placeholder="Describa el área y su propósito"
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Nivel de Seguridad</InputLabel>
                <Select
                  value={formData.security_level}
                  onChange={handleInputChange('security_level')}
                  label="Nivel de Seguridad"
                >
                  {securityLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      <Chip
                        label={level}
                        color={getSecurityLevelColor(level)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Ubicación/Piso"
                value={formData.location}
                onChange={handleInputChange('location')}
                fullWidth
                placeholder="Ej: Piso 3 - Ala Norte"
              />
            </Box>
            <TextField
              label="Capacidad Máxima"
              value={formData.max_occupancy}
              onChange={handleInputChange('max_occupancy')}
              fullWidth
              margin="normal"
              type="number"
              placeholder="Número máximo de personas permitidas"
            />
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.requires_escort}
                    onChange={handleInputChange('requires_escort')}
                  />
                }
                label="Requiere Escolta"
              />
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={handleInputChange('is_active')}
                />
              }
              label="Área Activa"
              sx={{ mt: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
          >
            {editingItem ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuthorizedAreas;