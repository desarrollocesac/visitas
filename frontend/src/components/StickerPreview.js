import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
  Chip
} from '@mui/material';
import {
  Print,
  Download,
  CheckCircle,
  Person,
  Business,
  AccessTime,
  LocationOn
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const StickerPreview = ({ visitData, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [printSuccess, setPrintSuccess] = useState(false);

  const handlePrintSticker = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE}/api/visits/${visitData.visit.id}/print-sticker`);
      
      if (response.data.success) {
        setPrintSuccess(true);
        setTimeout(() => {
          setPrintSuccess(false);
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al imprimir sticker');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSticker = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${API_BASE}/api/visits/${visitData.visit.id}/print-sticker?format=image`,
        {},
        { responseType: 'blob' }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `visitor-sticker-${visitData.visit.id}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Error al descargar sticker');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 2 }}>
      <Grid container spacing={3}>
        {/* Vista Previa del Sticker Vertical */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: 'fit-content' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Vista Previa del Sticker
              </Typography>
              
              {/* Sticker Preview Mockup - Formato Vertical */}
              <Box
                sx={{
                  width: 200,
                  height: 300,
                  mx: 'auto',
                  border: '2px solid #ddd',
                  borderRadius: 3,
                  bgcolor: 'white',
                  position: 'relative',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              >
                {/* Header */}
                <Box sx={{
                  bgcolor: '#3498db',
                  color: 'white',
                  p: 1,
                  borderRadius: '10px 10px 0 0',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  VISITOR PASS
                </Box>
                
                {/* Photo Area */}
                <Box sx={{ py: 2 }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      mx: 'auto',
                      bgcolor: '#ecf0f1',
                      color: '#95a5a6'
                    }}
                  >
                    <Person />
                  </Avatar>
                </Box>
                
                {/* Visitor Name */}
                <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '11px' }}>
                  {visitData.visitor.firstName} {visitData.visitor.lastName}
                </Typography>
                
                {/* Company */}
                {visitData.visitor.company && (
                  <Typography variant="caption" sx={{ display: 'block', fontSize: '9px', color: 'text.secondary' }}>
                    {visitData.visitor.company}
                  </Typography>
                )}
                
                {/* Visit Info */}
                <Box sx={{ p: 1, mt: 1, fontSize: '8px', textAlign: 'left' }}>
                  <Typography variant="caption" sx={{ fontSize: '7px', color: 'text.secondary' }}>
                    ANFITRIÓN:
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', fontSize: '8px', mb: 0.5 }}>
                    {visitData.visit.hostName}
                  </Typography>
                  
                  <Typography variant="caption" sx={{ fontSize: '7px', color: 'text.secondary' }}>
                    DEPARTAMENTO:
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', fontSize: '8px', mb: 0.5 }}>
                    {visitData.visit.department}
                  </Typography>
                  
                  <Typography variant="caption" sx={{ fontSize: '7px', color: 'text.secondary' }}>
                    FECHA:
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', fontSize: '8px' }}>
                    {formatDate(visitData.visit.checkInTime)} - {formatTime(visitData.visit.checkInTime)}
                  </Typography>
                </Box>
                
                {/* QR Code Area */}
                <Box sx={{ position: 'absolute', bottom: 15, right: 10 }}>
                  <Box sx={{
                    width: 30,
                    height: 30,
                    bgcolor: '#f0f0f0',
                    border: '1px solid #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '6px'
                  }}>
                    QR
                  </Box>
                </Box>
                
                {/* Footer */}
                <Box sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: '#34495e',
                  color: 'white',
                  p: 0.5,
                  borderRadius: '0 0 10px 10px',
                  fontSize: '6px'
                }}>
                  ID: {visitData.visit.id.substring(0, 8)}...
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Información de la Visita */}
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom align="center">
                Sticker de Visitante Generado
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {printSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Sticker enviado a imprimir exitosamente
                </Alert>
              )}

              {/* Visitor Information */}
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Person />
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6">
                      {visitData.visitor.firstName} {visitData.visitor.lastName}
                    </Typography>
                    {visitData.visitor.company && (
                      <Typography variant="body2" color="text.secondary">
                        <Business sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        {visitData.visitor.company}
                      </Typography>
                    )}
                    {visitData.visitor.email && (
                      <Typography variant="body2" color="text.secondary">
                        {visitData.visitor.email}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Visit Details */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Anfitrión
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {visitData.visit.hostName}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Departamento
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {visitData.visit.department}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Propósito de la Visita
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {visitData.visit.purpose}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    <AccessTime sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    Fecha de Ingreso
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {formatDate(visitData.visit.checkInTime)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Hora de Ingreso
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {formatTime(visitData.visit.checkInTime)}
                  </Typography>
                </Grid>
              </Grid>

              {/* Access Areas */}
              {visitData.visit.accessAreas && visitData.visit.accessAreas.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    Áreas de Acceso Autorizadas
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {visitData.visit.accessAreas.map((area, index) => (
                      <Chip
                        key={index}
                        label={area}
                        variant="outlined"
                        size="small"
                        color="primary"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Visit ID */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  ID de Visita: {visitData.visit.id}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Action Buttons */}
              <Grid container spacing={2} justifyContent="center">
                <Grid item>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <Print />}
                    onClick={handlePrintSticker}
                    disabled={loading}
                    size="large"
                  >
                    Imprimir Sticker
                  </Button>
                </Grid>
                
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={loading ? <CircularProgress size={20} /> : <Download />}
                    onClick={handleDownloadSticker}
                    disabled={loading}
                    size="large"
                  >
                    Descargar
                  </Button>
                </Grid>
              </Grid>

              {/* Close Button */}
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  variant="text"
                  onClick={onClose}
                  size="large"
                >
                  Cerrar
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StickerPreview;