import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid,
  Divider
} from '@mui/material';
import {
  Search,
  Visibility,
  Person,
  Email,
  Phone,
  Business,
  Badge,
  CalendarToday,
  Close
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const VisitorList = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Load visitors on component mount
  useEffect(() => {
    loadVisitors();
  }, []);

  const loadVisitors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/visitors`);
      if (response.data.success) {
        setVisitors(response.data.data.visitors);
      } else {
        setError('Error al cargar los visitantes');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error('Error loading visitors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (visitorId) => {
    try {
      const response = await axios.get(`${API_BASE}/api/visitors/${visitorId}`);
      if (response.data.success) {
        setSelectedVisitor(response.data.data);
        setDialogOpen(true);
      }
    } catch (err) {
      setError('Error al cargar los detalles del visitante');
    }
  };

  const filteredVisitors = visitors.filter(visitor =>
    visitor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.idNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getImageUrl = (photoPath) => {
    return `${API_BASE}/uploads/${photoPath}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1">
              Registro de Visitantes
            </Typography>
            <Button
              variant="outlined"
              onClick={loadVisitors}
              disabled={loading}
            >
              Actualizar
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar visitantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          <Typography variant="h6" sx={{ mb: 2 }}>
            Total de Visitantes: {filteredVisitors.length}
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Foto</TableCell>
                  <TableCell>Nombre Completo</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Empresa</TableCell>
                  <TableCell>Fecha Registro</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVisitors.map((visitor) => (
                  <TableRow key={visitor.id} hover>
                    <TableCell>
                      <Avatar
                        src={getImageUrl(visitor.photoPath)}
                        alt={`${visitor.firstName} ${visitor.lastName}`}
                        sx={{ width: 50, height: 50 }}
                      >
                        <Person />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {visitor.firstName} {visitor.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={visitor.idNumber} variant="outlined" />
                    </TableCell>
                    <TableCell>{visitor.email || '-'}</TableCell>
                    <TableCell>{visitor.phone || '-'}</TableCell>
                    <TableCell>{visitor.company || '-'}</TableCell>
                    <TableCell>{formatDate(visitor.createdAt)}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewDetails(visitor.id)}
                        title="Ver detalles"
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredVisitors.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body1" color="text.secondary">
                        {searchTerm ? 'No se encontraron visitantes con ese criterio de búsqueda' : 'No hay visitantes registrados'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Visitor Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedVisitor && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Detalles del Visitante
                </Typography>
                <IconButton onClick={() => setDialogOpen(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Información Personal
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          src={getImageUrl(selectedVisitor.photoPath)}
                          sx={{ width: 80, height: 80, mr: 2 }}
                        >
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {selectedVisitor.firstName} {selectedVisitor.lastName}
                          </Typography>
                          <Chip label={selectedVisitor.idNumber} />
                        </Box>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Email sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography>{selectedVisitor.email || 'No especificado'}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography>{selectedVisitor.phone || 'No especificado'}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Business sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography>{selectedVisitor.company || 'No especificado'}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography>
                          Registrado: {formatDate(selectedVisitor.createdAt)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Foto de Identificación
                      </Typography>
                      <Box sx={{ textAlign: 'center' }}>
                        <img
                          src={getImageUrl(selectedVisitor.idPhotoPath)}
                          alt="ID del visitante"
                          style={{
                            maxWidth: '100%',
                            height: 'auto',
                            borderRadius: '8px',
                            border: '1px solid #ddd'
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default VisitorList;