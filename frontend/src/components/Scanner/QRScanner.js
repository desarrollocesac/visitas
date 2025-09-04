import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
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
  MoreVert,
  PhotoCamera,
  FlipCameraIos
} from '@mui/icons-material';

const QRScanner = () => {
  const theme = useTheme();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [capturedImage, setCapturedImage] = useState(null);
  const scanIntervalRef = useRef(null);

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

  // Improved video constraints for better compatibility
  const videoConstraints = {
    width: { ideal: 640, min: 320, max: 1280 },
    height: { ideal: 480, min: 240, max: 720 },
    facingMode: facingMode,
    frameRate: { ideal: 30, min: 10, max: 60 }
  };

  const startScanning = useCallback(() => {
    setError('');
    setLoading(true);
    setCapturedImage(null);
    
    // Add timeout to handle camera loading issues
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Timeout al inicializar la cámara. Intenta de nuevo o verifica los permisos de cámara.');
      }
    }, 10000); // 10 second timeout
    
    // Set scanning state after a short delay to ensure camera loads
    setTimeout(() => {
      clearTimeout(loadingTimeout);
      setLoading(false);
      setIsScanning(true);
      
      // Start scanning for QR codes
      scanIntervalRef.current = setInterval(() => {
        scanForQR();
      }, 100);
    }, 1000); // Increased delay for better camera initialization
  }, [loading]);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  }, []);

  const scanForQR = useCallback(() => {
    if (webcamRef.current && canvasRef.current) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          console.log('QR Code detected:', code.data);
          stopScanning();
          processQRCode(code.data);
        }
      }
    }
  }, [stopScanning]);

  const processQRCode = (qrData) => {
    // Process the QR code data
    const mockScanResult = {
      visitorId: qrData.includes('VIS-') ? qrData : 'VIS-2025-001',
      visitorName: 'Ana Rodríguez',
      company: 'Tech Solutions Inc.',
      purpose: 'Reunión de negocios',
      hostName: 'Carlos Martín',
      department: 'Ventas',
      validAreas: ['Planta Baja', 'Sala de Juntas A'],
      issueDate: '2025-01-03',
      expiryDate: '2025-01-03',
      photo: null,
      status: 'valid',
      qrData: qrData
    };

    setScanResult(mockScanResult);
    setShowResultDialog(true);
    
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

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
    }
  }, []);

  const switchCamera = useCallback(() => {
    setFacingMode(prevFacingMode =>
      prevFacingMode === 'environment' ? 'user' : 'environment'
    );
  }, []);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

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

  const renderScannerContent = () => {
    if (!isScanning && !loading) {
      return (
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
      );
    }
    
    if (isScanning) {
      return (
        <Box>
          <Box sx={{
            position: 'relative',
            display: 'inline-block',
            borderRadius: 2,
            overflow: 'hidden',
            border: `3px solid ${theme.palette.primary.main}`,
            boxShadow: theme.shadows[8]
          }}>
            <Webcam
              ref={webcamRef}
              audio={false}
              width={500}
              height={375}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMedia={() => {
                setError('');
                console.log('Camera access granted successfully');
              }}
              onUserMediaError={(error) => {
                console.error('Webcam error:', error);
                let errorMessage = 'Error al acceder a la cámara. ';
                
                if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                  errorMessage += 'Permisos de cámara denegados. Por favor, permite el acceso a la cámara y recarga la página.';
                } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                  errorMessage += 'No se encontró ninguna cámara. Verifica que tu dispositivo tenga una cámara conectada.';
                } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                  errorMessage += 'La cámara está siendo usada por otra aplicación. Cierra otras aplicaciones que puedan estar usando la cámara.';
                } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
                  errorMessage += 'La configuración de cámara solicitada no es compatible con tu dispositivo.';
                } else if (error.name === 'NotSupportedError') {
                  errorMessage += 'Tu navegador no soporta el acceso a la cámara. Intenta con Chrome, Firefox o Safari.';
                } else {
                  errorMessage += `Error específico: ${error.name || error.message}. Intenta recargar la página.`;
                }
                
                setError(errorMessage);
                setIsScanning(false);
                setLoading(false);
              }}
            />
            
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              <Box sx={{
                width: 200,
                height: 200,
                border: `2px solid ${theme.palette.success.main}`,
                borderRadius: 2,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -10,
                  left: -10,
                  right: -10,
                  bottom: -10,
                  border: `2px dashed ${alpha(theme.palette.success.main, 0.6)}`,
                  borderRadius: 2,
                  animation: 'pulse 2s infinite'
                }
              }} />
            </Box>
          </Box>
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Escaneando códigos QR...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Coloca el código QR dentro del marco verde
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={stopScanning}
                startIcon={<Close />}
              >
                Detener
              </Button>
              <Button
                variant="outlined"
                onClick={capturePhoto}
                startIcon={<PhotoCamera />}
              >
                Capturar
              </Button>
              <Button
                variant="outlined"
                onClick={switchCamera}
                startIcon={<FlipCameraIos />}
              >
                Cambiar Cámara
              </Button>
            </Box>
          </Box>

          {capturedImage && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Imagen Capturada
              </Typography>
              <img
                src={capturedImage}
                alt="Captured"
                style={{
                  maxWidth: '300px',
                  width: '100%',
                  borderRadius: theme.shape.borderRadius
                }}
              />
            </Box>
          )}
        </Box>
      );
    }
    
    if (loading) {
      return (
        <Box>
          <Box sx={{
            position: 'relative',
            display: 'inline-block',
            borderRadius: 2,
            overflow: 'hidden',
            border: `3px solid ${theme.palette.primary.main}`,
            boxShadow: theme.shadows[8]
          }}>
            <Webcam
              ref={webcamRef}
              audio={false}
              width={500}
              height={375}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMedia={() => {
                setError('');
                console.log('Camera initialized successfully');
              }}
              onUserMediaError={(error) => {
                console.error('Webcam error during loading:', error);
                let errorMessage = 'Error al acceder a la cámara. ';
                
                if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                  errorMessage += 'Permisos de cámara denegados. Por favor, permite el acceso a la cámara y recarga la página.';
                } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                  errorMessage += 'No se encontró ninguna cámara. Verifica que tu dispositivo tenga una cámara conectada.';
                } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                  errorMessage += 'La cámara está siendo usada por otra aplicación. Cierra otras aplicaciones que puedan estar usando la cámara.';
                } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
                  errorMessage += 'La configuración de cámara solicitada no es compatible con tu dispositivo.';
                } else if (error.name === 'NotSupportedError') {
                  errorMessage += 'Tu navegador no soporta el acceso a la cámara. Intenta con Chrome, Firefox o Safari.';
                } else {
                  errorMessage += `Error específico: ${error.name || error.message}. Intenta recargar la página.`;
                }
                
                setError(errorMessage);
                setLoading(false);
                setIsScanning(false);
              }}
            />
            
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              pointerEvents: 'none'
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={60} sx={{ mb: 2, color: theme.palette.primary.main }} />
                <Typography variant="h6" color="primary">
                  Iniciando cámara...
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Preparando el escáner QR
            </Typography>
          </Box>
        </Box>
      );
    }
    
    return null;
  };

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
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError('')}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<Refresh />}
              onClick={() => {
                setError('');
                startScanning();
              }}
            >
              Reintentar
            </Button>
          }
        >
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Error de cámara
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
            {window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && (
              <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
                ⚠️ Nota: Estás usando HTTP en lugar de HTTPS. Algunos navegadores requieren HTTPS para acceder a la cámara.
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              💡 Consejos: Asegúrate de que ninguna otra aplicación esté usando la cámara, permite los permisos cuando el navegador lo solicite, y considera usar Chrome o Firefox para mejor compatibilidad.
            </Typography>
          </Box>
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
                {renderScannerContent()}
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