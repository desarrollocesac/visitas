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
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon
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

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager: '',
    location: '',
    is_active: true
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    setError('');
    try {
      const api = createAxiosInstance();
      const response = await api.get('/maintenance/departments');
      setDepartments(response.data);
    } catch (err) {
      console.error('Error loading departments:', err);
      setError('Error al cargar departamentos');
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
        manager: item.manager || '',
        location: item.location || '',
        is_active: item.is_active
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        manager: '',
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
      manager: '',
      location: '',
      is_active: true
    });
  };

  const handleInputChange = (field) => (event) => {
    const value = field === 'is_active' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('El nombre del departamento es requerido');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const api = createAxiosInstance();
      
      if (editingItem) {
        // Update existing item
        await api.put(`/maintenance/departments/${editingItem.id}`, formData);
        setSuccess('Departamento actualizado exitosamente');
      } else {
        // Create new item
        await api.post('/maintenance/departments', formData);
        setSuccess('Departamento creado exitosamente');
      }
      
      handleCloseDialog();
      loadDepartments(); // Reload the list
    } catch (err) {
      console.error('Error saving department:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al guardar departamento');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este departamento?')) {
      try {
        const api = createAxiosInstance();
        await api.delete(`/maintenance/departments/${id}`);
        setSuccess('Departamento eliminado exitosamente');
        loadDepartments(); // Reload the list
      } catch (err) {
        console.error('Error deleting department:', err);
        setError('Error al eliminar departamento');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BusinessIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Departamentos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Nuevo Departamento
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
                <TableCell sx={{ fontWeight: 600 }}>Gerente</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ubicación</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Fecha Creación</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id.substring(0, 8)}...</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.manager || '-'}</TableCell>
                  <TableCell>{row.location || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.is_active ? 'Activo' : 'Inactivo'}
                      color={row.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
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
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          {editingItem ? 'Editar Departamento' : 'Nuevo Departamento'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Nombre del Departamento"
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
              rows={3}
              placeholder="Describa las funciones y responsabilidades del departamento"
            />
            <TextField
              label="Gerente/Responsable"
              value={formData.manager}
              onChange={handleInputChange('manager')}
              fullWidth
              margin="normal"
              placeholder="Nombre del gerente o responsable"
            />
            <TextField
              label="Ubicación/Piso"
              value={formData.location}
              onChange={handleInputChange('location')}
              fullWidth
              margin="normal"
              placeholder="Ej: Piso 2 - Ala Norte"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={handleInputChange('is_active')}
                />
              }
              label="Departamento Activo"
              sx={{ mt: 2 }}
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

export default Departments;