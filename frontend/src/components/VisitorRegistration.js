import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  PhotoCamera,
  CameraAlt,
  PersonAdd,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import axios from 'axios';
import StickerPreview from './StickerPreview';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const VisitorRegistration = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registrationResult, setRegistrationResult] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    idNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    hostName: '',
    department: '',
    purpose: '',
    accessAreas: []
  });

  // File states
  const [visitorPhoto, setVisitorPhoto] = useState(null);
  const [idPhoto, setIdPhoto] = useState(null);
  const [visitorPhotoPreview, setVisitorPhotoPreview] = useState(null);
  const [idPhotoPreview, setIdPhotoPreview] = useState(null);

  // Refs
  const visitorPhotoRef = useRef();
  const idPhotoRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();

  // Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);

  const steps = ['Escanear ID', 'Tomar Foto', 'Información de Visita', 'Confirmar'];

  const departments = [
    'Recepción',
    'Administración', 
    'Ventas',
    'Marketing',
    'IT',
    'Recursos Humanos',
    'Contabilidad',
    'Gerencia'
  ];

  const accessAreas = [
    'Planta Baja',
    'Primer Piso',
    'Segundo Piso',
    'Sala de Juntas',
    'Cafetería',
    'Estacionamiento'
  ];

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      if (visitorPhotoPreview) {
        URL.revokeObjectURL(visitorPhotoPreview);
      }
      if (idPhotoPreview) {
        URL.revokeObjectURL(idPhotoPreview);
      }
      stopCamera();
    };
  }, []);

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleAccessAreasChange = (event) => {
    setFormData(prev => ({
      ...prev,
      accessAreas: event.target.value
    }));
  };

  // File upload handlers
  const handleIdPhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!allowedTypes.includes(file.type)) {
        setError('Solo se permiten archivos JPEG, JPG y PNG');
        return;
      }
      
      if (file.size > maxSize) {
        setError('El archivo es demasiado grande. Máximo 10MB permitido');
        return;
      }
      
      setIdPhoto(file);
      setIdPhotoPreview(URL.createObjectURL(file));
      
      // Simulate ID extraction
      setTimeout(() => {
        extractIdInfo(file);
      }, 1000);
    }
  };

  const extractIdInfo = async (file) => {
    setLoading(true);
    try {
      // Simulate OCR extraction - in real app, send to backend
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          idNumber: `ID${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          firstName: 'Juan',
          lastName: 'Pérez'
        }));
        setLoading(false);
        setActiveStep(1);
      }, 2000);
    } catch (err) {
      setError('Error al extraer información del ID');
      setLoading(false);
    }
  };

  // Camera functions
  const startCamera = async () => {
    try {
      setError(''); // Clear any previous errors
      console.log('Iniciando cámara...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      console.log('Stream obtenido:', {
        active: mediaStream.active,
        tracks: mediaStream.getVideoTracks().length
      });
      
      setStream(mediaStream);
      setIsCameraOpen(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata cargada:', {
            videoWidth: videoRef.current.videoWidth,
            videoHeight: videoRef.current.videoHeight,
            duration: videoRef.current.duration
          });
          
          videoRef.current.play().then(() => {
            console.log('Video reproduciendo correctamente');
          }).catch(err => {
            console.error('Error reproduciendo video:', err);
            setError('Error reproduciendo el video de la cámara');
          });
        };
        
        videoRef.current.onerror = (err) => {
          console.error('Error en video element:', err);
          setError('Error en la visualización de la cámara');
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      let errorMessage = 'No se pudo acceder a la cámara. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Permisos denegados. Por favor, permita el acceso a la cámara.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No se encontró una cámara en este dispositivo.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'La cámara está siendo usada por otra aplicación.';
      } else {
        errorMessage += 'Verifique los permisos y que la cámara esté disponible.';
      }
      
      setError(errorMessage);
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = useCallback(() => {
    console.log('Iniciando captura de foto...');
    
    if (!videoRef.current || !canvasRef.current || !stream) {
      setError('La cámara no está lista. Abra la cámara nuevamente.');
      console.error('Referencias no disponibles:', {
        video: !!videoRef.current,
        canvas: !!canvasRef.current,
        stream: !!stream
      });
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    console.log('Estado del video:', {
      readyState: video.readyState,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      paused: video.paused,
      currentTime: video.currentTime
    });
    
    // Check if video is ready
    if (video.readyState !== 4) {
      setError('La cámara aún se está cargando. Espere un momento e intente nuevamente.');
      return;
    }
    
    // Check if video has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('La cámara no está lista. Intente nuevamente en unos segundos.');
      return;
    }
    
    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    console.log('Dimensiones del canvas:', {
      width: canvas.width,
      height: canvas.height
    });
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas and draw video frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Verify that something was drawn
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const isEmpty = !imageData.data.some(channel => channel !== 0);
    
    if (isEmpty) {
      setError('No se pudo capturar la imagen. Verifique que la cámara esté funcionando.');
      console.error('Canvas está vacío después de dibujar');
      return;
    }
    
    console.log('Imagen dibujada en canvas, creando blob...');
    
    // Use higher quality and add error handling for blob creation
    try {
      canvas.toBlob((blob) => {
        console.log('Blob creado:', {
          size: blob?.size,
          type: blob?.type
        });
        
        if (blob && blob.size > 0) {
          const file = new File([blob], 'visitor-photo.jpg', { type: 'image/jpeg' });
          const previewUrl = URL.createObjectURL(file);
          
          console.log('Archivo creado:', {
            name: file.name,
            size: file.size,
            type: file.type,
            previewUrl: previewUrl
          });
          
          setVisitorPhoto(file);
          setVisitorPhotoPreview(previewUrl);
          setError(''); // Clear any errors
          
          // Don't stop camera immediately, let user see preview first
          setTimeout(() => {
            stopCamera();
            setActiveStep(2);
          }, 500);
          
          console.log('Foto capturada exitosamente');
        } else {
          setError('Error al crear la imagen. Intente nuevamente.');
          console.error('Blob inválido o vacío');
        }
      }, 'image/jpeg', 0.92);
    } catch (err) {
      console.error('Error capturing photo:', err);
      setError('Error al capturar la foto. Intente nuevamente.');
    }
  }, [stream]);

  const handleVisitorPhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!allowedTypes.includes(file.type)) {
        setError('Solo se permiten archivos JPEG, JPG y PNG');
        return;
      }
      
      if (file.size > maxSize) {
        setError('El archivo es demasiado grande. Máximo 10MB permitido');
        return;
      }
      
      setVisitorPhoto(file);
      setVisitorPhotoPreview(URL.createObjectURL(file));
      setActiveStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!visitorPhoto || !idPhoto) {
      setError('Se requieren ambas fotos');
      return;
    }

    const submitFormData = new FormData();
    
    // Add form fields
    Object.keys(formData).forEach(key => {
      if (key === 'accessAreas') {
        submitFormData.append(key, JSON.stringify(formData[key]));
      } else {
        submitFormData.append(key, formData[key]);
      }
    });

    // Add files
    submitFormData.append('photo', visitorPhoto);
    submitFormData.append('idPhoto', idPhoto);

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/visitors/register`, submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccess('Visita registrada exitosamente');
        setRegistrationResult(response.data.data);
        setActiveStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar la visita');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      idNumber: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      hostName: '',
      department: '',
      purpose: '',
      accessAreas: []
    });
    setVisitorPhoto(null);
    setIdPhoto(null);
    setVisitorPhotoPreview(null);
    setIdPhotoPreview(null);
    setActiveStep(0);
    setError('');
    setSuccess('');
    setRegistrationResult(null);
    stopCamera();
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Paso 1: Escanear Identificación
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Por favor, capture o suba una foto clara de su identificación
            </Typography>
            
            {idPhotoPreview && (
              <Box sx={{ mb: 3 }}>
                <img 
                  src={idPhotoPreview} 
                  alt="ID Preview" 
                  style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'contain' }}
                />
              </Box>
            )}

            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="id-photo-upload"
              type="file"
              ref={idPhotoRef}
              onChange={handleIdPhotoUpload}
            />
            <label htmlFor="id-photo-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<PhotoCamera />}
                size="large"
                sx={{ minWidth: 200 }}
              >
                Subir Foto de ID
              </Button>
            </label>

            {loading && (
              <Box sx={{ mt: 3 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Extrayendo información del ID...
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Paso 2: Tomar Foto del Visitante
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Capture una foto del visitante para completar el registro
            </Typography>

            {visitorPhotoPreview && (
              <Box sx={{ mb: 3, p: 2, border: '2px solid #4caf50', borderRadius: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>
                <Typography variant="h6" color="success.main" gutterBottom>
                  ✓ Foto Capturada
                </Typography>
                <img
                  src={visitorPhotoPreview}
                  alt="Visitor Preview"
                  style={{
                    maxWidth: '300px',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                  onLoad={() => console.log('Imagen preview cargada exitosamente')}
                  onError={(e) => {
                    console.error('Error cargando imagen preview:', e);
                    setError('Error mostrando la imagen capturada');
                  }}
                />
              </Box>
            )}

            {isCameraOpen ? (
              <Box sx={{ mb: 3 }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', maxWidth: '400px', height: 'auto' }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={capturePhoto}
                    startIcon={<CameraAlt />}
                    sx={{ mr: 2 }}
                  >
                    Capturar Foto
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={stopCamera}
                  >
                    Cancelar
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Button
                  variant="contained"
                  onClick={startCamera}
                  startIcon={<CameraAlt />}
                  size="large"
                  sx={{ mr: 2, minWidth: 150 }}
                >
                  Abrir Cámara
                </Button>
                
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="visitor-photo-upload"
                  type="file"
                  onChange={handleVisitorPhotoUpload}
                />
                <label htmlFor="visitor-photo-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    size="large"
                    sx={{ minWidth: 150 }}
                  >
                    Subir Foto
                  </Button>
                </label>
                
                {visitorPhotoPreview && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setVisitorPhoto(null);
                        setVisitorPhotoPreview(null);
                        setError('');
                      }}
                      color="warning"
                    >
                      Retomar Foto
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Paso 3: Información de la Visita
            </Typography>
            
            <Grid container spacing={3}>
              {/* Información personal extraída */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Información Personal (Extraída del ID)
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Número de ID"
                  value={formData.idNumber}
                  onChange={handleInputChange('idNumber')}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Nombre"
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  fullWidth
                  variant="outlined"
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Apellido"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  fullWidth
                  variant="outlined"
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Teléfono"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Empresa"
                  value={formData.company}
                  onChange={handleInputChange('company')}
                  fullWidth
                  variant="outlined"
                />
              </Grid>

              {/* Información de la visita */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Información de la Visita
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Persona a Visitar"
                  value={formData.hostName}
                  onChange={handleInputChange('hostName')}
                  fullWidth
                  variant="outlined"
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel>Departamento</InputLabel>
                  <Select
                    value={formData.department}
                    onChange={handleInputChange('department')}
                    label="Departamento"
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Propósito de la Visita"
                  value={formData.purpose}
                  onChange={handleInputChange('purpose')}
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={2}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Áreas de Acceso</InputLabel>
                  <Select
                    multiple
                    value={formData.accessAreas}
                    onChange={handleAccessAreasChange}
                    label="Áreas de Acceso"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {accessAreas.map((area) => (
                      <MenuItem key={area} value={area}>
                        {area}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<PersonAdd />}
                size="large"
                disabled={!formData.firstName || !formData.lastName || !formData.hostName || !formData.department || !formData.purpose}
              >
                Registrar Visita
              </Button>
            </Box>
          </Box>
        );

      case 3:
        return registrationResult ? (
          <StickerPreview
            visitData={registrationResult}
            onClose={resetForm}
          />
        ) : (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              ¡Registro Completado!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              La visita ha sido registrada exitosamente. El visitante puede proceder.
            </Typography>
            <Button
              variant="contained"
              onClick={resetForm}
              size="large"
            >
              Registrar Otra Visita
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Sistema de Control de Visitas
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
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

          {loading && activeStep !== 3 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <CircularProgress />
            </Box>
          )}

          {renderStepContent()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default VisitorRegistration;