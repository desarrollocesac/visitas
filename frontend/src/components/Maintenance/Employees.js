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
  MenuItem,
  Avatar,
  Grid,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  PhotoCamera,
  Person
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

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    document_type_id: '',
    document_number: '',
    first_name: '',
    last_name1: '',
    last_name2: '',
    nick_name: '',
    position_id: '',
    department_id: '',
    picture: null,
    is_active: true
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadEmployees(),
      loadDocumentTypes(),
      loadPositions(),
      loadDepartments()
    ]);
  };

  const loadEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const api = createAxiosInstance();
      const response = await api.get('/maintenance/employees');
      setEmployees(response.data);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentTypes = async () => {
    try {
      const api = createAxiosInstance();
      const response = await api.get('/maintenance/document-types');
      setDocumentTypes(response.data);
    } catch (err) {
      console.error('Error loading document types:', err);
    }
  };

  const loadPositions = async () => {
    try {
      const api = createAxiosInstance();
      const response = await api.get('/maintenance/positions');
      setPositions(response.data);
    } catch (err) {
      console.error('Error loading positions:', err);
    }
  };

  const loadDepartments = async () => {
    try {
      const api = createAxiosInstance();
      const response = await api.get('/maintenance/departments');
      setDepartments(response.data);
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code,
        document_type_id: item.document_type_id,
        document_number: item.document_number,
        first_name: item.first_name,
        last_name1: item.last_name1,
        last_name2: item.last_name2 || '',
        nick_name: item.nick_name || '',
        position_id: item.position_id,
        department_id: item.department_id,
        picture: item.picture,
        is_active: item.is_active
      });
    } else {
      setEditingItem(null);
      setFormData({
        code: '',
        document_type_id: '',
        document_number: '',
        first_name: '',
        last_name1: '',
        last_name2: '',
        nick_name: '',
        position_id: '',
        department_id: '',
        picture: null,
        is_active: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleInputChange = (field) => (event) => {
    let value = event.target.value;
    
    if (field === 'is_active') {
      value = event.target.checked;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          picture: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.first_name.trim() || !formData.last_name1.trim() || !formData.code.trim()) {
      setError('Los campos Nombre, Primer Apellido y Código son requeridos');
      return;
    }

    if (!formData.document_type_id || !formData.position_id || !formData.department_id) {
      setError('Tipo de documento, posición y departamento son requeridos');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const api = createAxiosInstance();
      
      if (editingItem) {
        // Update existing item
        await api.put(`/maintenance/employees/${editingItem.id}`, formData);
        setSuccess('Empleado actualizado exitosamente');
      } else {
        // Create new item
        await api.post('/maintenance/employees', formData);
        setSuccess('Empleado creado exitosamente');
      }
      
      handleCloseDialog();
      loadEmployees(); // Reload the list
    } catch (err) {
      console.error('Error saving employee:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al guardar empleado');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este empleado?')) {
      try {
        const api = createAxiosInstance();
        await api.delete(`/maintenance/employees/${id}`);
        setSuccess('Empleado eliminado exitosamente');
        loadEmployees(); // Reload the list
      } catch (err) {
        console.error('Error deleting employee:', err);
        setError('Error al eliminar empleado');
      }
    }
  };

  const getFullName = (employee) => {
    return `${employee.first_name} ${employee.last_name1} ${employee.last_name2 || ''}`.trim();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PeopleIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Empleados
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Nuevo Empleado
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
                <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Foto</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nombre Completo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Documento</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Posición</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Departamento</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id.substring(0, 8)}...</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{row.code}</TableCell>
                  <TableCell>
                    <Avatar
                      src={row.picture}
                      sx={{ width: 40, height: 40 }}
                    >
                      <Person />
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {getFullName(row)}
                      </Typography>
                      {row.nick_name && (
                        <Typography variant="caption" color="text.secondary">
                          "{row.nick_name}"
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {row.document_type_name}: {row.document_number}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.position_name || '-'}</TableCell>
                  <TableCell>{row.department_name || '-'}</TableCell>
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
          {editingItem ? 'Editar Empleado' : 'Nuevo Empleado'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              {/* Información Básica */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Información Básica
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Código de Empleado"
                  value={formData.code}
                  onChange={handleInputChange('code')}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Documento</InputLabel>
                  <Select
                    value={formData.document_type_id}
                    onChange={handleInputChange('document_type_id')}
                    label="Tipo de Documento"
                  >
                    {documentTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Número de Documento"
                  value={formData.document_number}
                  onChange={handleInputChange('document_number')}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Divider />
                <Typography variant="h6" sx={{ my: 2, color: 'primary.main' }}>
                  Información Personal
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Nombres"
                  value={formData.first_name}
                  onChange={handleInputChange('first_name')}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Primer Apellido"
                  value={formData.last_name1}
                  onChange={handleInputChange('last_name1')}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Segundo Apellido"
                  value={formData.last_name2}
                  onChange={handleInputChange('last_name2')}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Apodo/Nickname"
                  value={formData.nick_name}
                  onChange={handleInputChange('nick_name')}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={formData.picture}
                    sx={{ width: 80, height: 80 }}
                  >
                    <Person />
                  </Avatar>
                  <Box>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="picture-upload"
                      type="file"
                      onChange={handlePictureUpload}
                    />
                    <label htmlFor="picture-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<PhotoCamera />}
                        size="small"
                      >
                        Subir Foto
                      </Button>
                    </label>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider />
                <Typography variant="h6" sx={{ my: 2, color: 'primary.main' }}>
                  Información Laboral
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Posición</InputLabel>
                  <Select
                    value={formData.position_id}
                    onChange={handleInputChange('position_id')}
                    label="Posición"
                  >
                    {positions.map((position) => (
                      <MenuItem key={position.id} value={position.id}>
                        {position.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Departamento</InputLabel>
                  <Select
                    value={formData.department_id}
                    onChange={handleInputChange('department_id')}
                    label="Departamento"
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={handleInputChange('is_active')}
                    />
                  }
                  label="Empleado Activo"
                />
              </Grid>
            </Grid>
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

export default Employees;