import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  QrCodeScanner,
  CameraAlt,
  CheckCircle,
  Error,
  ExitToApp,
  PersonAdd,
  History,
  Security,
  LocationOn,
  AccessTime,
  Person,
  Business,
  Refresh,
  Close,
  Warning,
  Info,
  MoreVert
} from '@mui/icons-material';

const QRScanner = () => {
  const theme = useTheme();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data for recent scans
  const mockRecentScans = [
    {
      id: 1,
      visitorName: 'Juan Pérez',
      action: 'check_in',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      location: 'Recepción Principal',
      department: 'IT',
      status: 'success'
    },
    {
      id: 2,
      visitorName: 'María García',
      action: 'check_out',
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      location: 'Salida Principal',
      department: 'Marketing',
      status: 'success'
    },
    {
      id: 3,
      visitorName: 'Carlos López',
      action: 'access_denied',
      timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      location: 'Área Restringida',
      department: 'Ventas',
      status: 'error'
    }
  ];

  useEffect(() => {
    setRecentScans(mockRecentScans);
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError('');
      setLoading(true);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment' // Use back camera on mobile
        }
      });

      setStream(mediaStream);
      setIsScanning(true);
      setLoading(false);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      // Simulate QR scanning
      setTimeout(() => {
        simulateQRScan();
      }, 3000);

    } catch (err) {
      setError('No se pudo acceder a la cámara. Verifique los permisos.');
      setLoading(false);
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
    setLoading(false);
  };

  const simulateQRScan = () => {
    // Simulate successful QR scan
    const mockScanResult = {
      visitorId: 'VIS-2025-001',
      visitorName: 'Ana Rodríguez',
      company: 'Tech Solutions Inc.',
      purpose: 'Reunión de negocios',
      hostName: 'Carlos Martín',
      department: 'Ventas',
      validAreas: ['Planta Baja', 'Sala de Juntas A'],
      issueDate: '2025-01-03',
      expiryDate: '2025-01-03',
      photo: null,
      status: 'valid'
    };

    setScanResult(mockScanResult);
    setShowResultDialog(true);
    stopScanning();
    
    // Add to recent scans
    const newScan = {
      id: Date.now(),
      visitorName: mockScanResult.visitorName,
      action: 'check_in',
      timestamp: new Date(),
      location: 'Escáner Principal',
      department: mockScanResult.department,
      status: 'success'
    };
    
    setRecentScans(prev => [newScan, ...prev.slice(0, 9)]);
  };

  const handleManualEntry = () => {
    // Simulate manual entry
    const mockManualResult = {
      visitorId: 'VIS-2025-002',
      visitorName: 'Luis Herrera',
      company: 'Consulting Group',
      purpose: 'Consultoría',
      hostName: 'Ana López',
      department: 'Marketing',
      validAreas: ['Primer Piso', 'Sala de Juntas B'],
      issueDate: '2025-01-03',
      expiryDate: '2025-01-03',
      photo: null,
      status: 'valid'
    };

    setScanResult(mockManualResult);
    setShowResultDialog(true);
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'check_in':
        return <PersonAdd sx={{ color: theme.palette.success.main }} />;
      case 'check_out':
        return <ExitToApp sx={{ color: theme.palette.info.main }} />;
      case 'access_denied':
        return <Error sx={{ color: theme.palette.error.main }} />;
      default:
        return <Info sx={{ color: theme.palette.primary.main }} />;
    }
  };

  const getActionText = (action) => {
    switch (action) {
      case 'check_in':
        return 'Ingreso';
      case 'check_out':
        return 'Salida';
      case 'access_denied':
        return 'Acceso Denegado';
      default:
        return 'Acción';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      default:
        return theme.palette.info.main;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return timestamp.toLocaleDateString();
  };

  const ScannerStats = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.success.main}08 100%)`,
          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                  127
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Escaneos Hoy
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                <QrCodeScanner />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}08 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  89
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ingresos
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                <PersonAdd />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.info.main}08 100%)`,
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                  76
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Salidas
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}>
                <ExitToApp />
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
                  3
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Alertas
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}>
                <Security />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const ResultDialog = () => (
    <Dialog 
      open={showResultDialog} 
      onClose={() => setShowResultDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {scanResult?.status === 'valid' ? (
            <CheckCircle sx={{ color: theme.palette.success.main }} />
          ) : (
            <Error sx={{ color: theme.palette.error.main }} />
          )}
          <Typography variant="h6">
            Resultado del Escaneo
          </Typography>
        </Box>
        <IconButton onClick={() => setShowResultDialog(false)}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        {scanResult && (
          <Box>
            <Alert 
              severity={scanResult.status === 'valid' ? 'success' : 'error'}
              sx={{ mb: 3 }}
            >
              {scanResult.status === 'valid' 
                ? 'Código QR válido - Acceso autorizado'
                : 'Código QR inválido o expirado'
              }
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mx: 'auto', 
                      mb: 2,
                      bgcolor: theme.palette.primary.main,
                      fontSize: '2rem'
                    }}
                  >
                    {scanResult.visitorName?.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {scanResult.visitorName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {scanResult.visitorId}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Business sx={{ color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Empresa
                      </Typography>
                      <Typography variant="body1">
                        {scanResult.company}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Person sx={{ color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Persona a visitar
                      </Typography>
                      <Typography variant="body1">
                        {scanResult.hostName} - {scanResult.department}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Info sx={{ color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Propósito
                      </Typography>
                      <Typography variant="body1">
                        {scanResult.purpose}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocationOn sx={{ color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Áreas autorizadas
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        {scanResult.validAreas?.map((area, index) => (
                          <Chip
                            key={index}
                            label={area}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AccessTime sx={{ color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Validez
                      </Typography>
                      <Typography variant="body1">
                        {scanResult.issueDate} - {scanResult.expiryDate}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setShowResultDialog(false)}>
          Cerrar
        </Button>
        {scanResult?.status === 'valid' && (
          <Button variant="contained" startIcon={<CheckCircle />}>
            Autorizar Acceso
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Escáner QR
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Escanea códigos QR de visitantes para control de acceso
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <ScannerStats />

      <Grid container spacing={3}>
        {/* Scanner Section */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Escáner de Códigos QR
              </Typography>
              
              <Box sx={{ textAlign: 'center' }}>
                {!isScanning && !loading ? (
                  <Box sx={{ py: 6 }}>
                    <QrCodeScanner 
                      sx={{ 
                        fontSize: 120, 
                        color: theme.palette.primary.main, 
                        mb: 3,
                        opacity: 0.7 
                      }} 
                    />
                    <Typography variant="h6" gutterBottom>
                      Listo para escanear
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                      Presiona el botón para iniciar el escáner de códigos QR
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<CameraAlt />}
                        onClick={startScanning}
                        sx={{ minWidth: 160 }}
                      >
                        Iniciar Escáner
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={handleManualEntry}
                        sx={{ minWidth: 160 }}
                      >
                        Entrada Manual
                      </Button>
                    </Box>
                  </Box>
                ) : loading ? (
                  <Box sx={{ py: 6 }}>
                    <CircularProgress size={60} sx={{ mb: 3 }} />
                    <Typography variant="h6" gutterBottom>
                      Iniciando cámara...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Por favor, permita el acceso a la cámara
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      style={{
                        width: '100%',
                        maxWidth: '500px',
                        height: 'auto',
                        borderRadius: theme.shape.borderRadius,
                        border: `2px solid ${theme.palette.primary.main}`
                      }}
                    />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Escaneando...
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Coloca el código QR dentro del marco
                      </Typography>
                      
                      <Button
                        variant="outlined"
                        onClick={stopScanning}
                        startIcon={<Close />}
                      >
                        Detener Escáner
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Scans */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Escaneos Recientes
                </Typography>
                <Badge badgeContent={recentScans.length} color="primary">
                  <History />
                </Badge>
              </Box>
              
              <List sx={{ p: 0 }}>
                {recentScans.map((scan, index) => (
                  <React.Fragment key={scan.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getStatusColor(scan.status), width: 36, height: 36 }}>
                          {getActionIcon(scan.action)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                            {scan.visitorName}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {getActionText(scan.action)} • {scan.location}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {formatTimeAgo(scan.timestamp)}
                            </Typography>
                          </Box>
                        }
                      />
                      <Tooltip title={`Estado: ${scan.status}`}>
                        <IconButton size="small">
                          <MoreVert />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                    {index < recentScans.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              
              {recentScans.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <History sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No hay escaneos recientes
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ResultDialog />
    </Box>
  );
};

export default QRScanner;