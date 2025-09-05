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
  StepLabel,
  Autocomplete,
  Divider,
  Stack,
  IconButton
} from '@mui/material';
import {
  PhotoCamera,
  CameraAlt,
  PersonAdd,
  CheckCircle,
  Error as ErrorIcon,
  Search,
  Person,
  Business,
  ContactPhone,
  Email,
  Badge,
  Assignment
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
    documentType: 'Cedula',
    documentNumber: '',
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
  const [cameraMode, setCameraMode] = useState('visitor'); // 'visitor' or 'id'

  const steps = ['Identificación del Visitante', 'Documentos Requeridos', 'Información de Visita', 'Confirmar'];

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

  // Mock data for hosts/employees
  const hostOptions = [
    { name: 'Carlos Martín', department: 'Ventas', email: 'carlos.martin@empresa.com' },
    { name: 'Ana López', department: 'Marketing', email: 'ana.lopez@empresa.com' },
    { name: 'Luis Herrera', department: 'IT', email: 'luis.herrera@empresa.com' },
    { name: 'María García', department: 'Recursos Humanos', email: 'maria.garcia@empresa.com' },
    { name: 'José Rodríguez', department: 'Administración', email: 'jose.rodriguez@empresa.com' },
    { name: 'Laura Fernández', department: 'Contabilidad', email: 'laura.fernandez@empresa.com' },
    { name: 'Pedro Sánchez', department: 'Gerencia', email: 'pedro.sanchez@empresa.com' }
  ];

  const documentTypes = ['Cedula', 'Pasaporte'];

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
          documentNumber: Math.random().toString().substr(2, 11),
          firstName: 'Juan',
          lastName: 'Pérez'
        }));
        setLoading(false);
        // No avanzar automáticamente - el usuario decide cuándo continuar
      }, 2000);
    } catch (err) {
      setError('Error al extraer información del ID');
      setLoading(false);
    }
  };

  // Camera functions
  const startCamera = async (mode = 'visitor') => {
    setCameraMode(mode);
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
    console.log(`Iniciando captura de foto (${cameraMode})...`);
    
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
          const fileName = cameraMode === 'id' ? 'id-photo.jpg' : 'visitor-photo.jpg';
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          const previewUrl = URL.createObjectURL(file);
          
          console.log('Archivo creado:', {
            name: file.name,
            size: file.size,
            type: file.type,
            previewUrl: previewUrl,
            mode: cameraMode
          });
          
          // Set the appropriate photo based on camera mode
          if (cameraMode === 'id') {
            setIdPhoto(file);
            setIdPhotoPreview(previewUrl);
          } else {
            setVisitorPhoto(file);
            setVisitorPhotoPreview(previewUrl);
          }
          
          setError(''); // Clear any errors
          
          // Don't stop camera immediately, let user see preview first
          setTimeout(() => {
            stopCamera();
            // No avanzar automáticamente - el usuario puede continuar manualmente
          }, 500);
          
          console.log(`Foto ${cameraMode} capturada exitosamente`);
        } else {
          setError('Error al crear la imagen. Intente nuevamente.');
          console.error('Blob inválido o vacío');
        }
      }, 'image/jpeg', 0.92);
    } catch (err) {
      console.error('Error capturing photo:', err);
      setError('Error al capturar la foto. Intente nuevamente.');
    }
  }, [stream, cameraMode]);

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
      // No avanzar automáticamente - el usuario decide cuándo continuar
    }
  };

  const handleSubmit = async () => {
    if (!visitorPhoto || !idPhoto) {
      setError('Se requieren ambas fotos');
      return;
    }

    const submitFormData = new FormData();
    
    // Map form fields to match backend expectations
    const fieldMapping = {
      'documentType': 'documentType',
      'documentNumber': 'idNumber',
      'firstName': 'firstName',
      'lastName': 'lastName',
      'email': 'email',
      'phone': 'phone',
      'company': 'company',
      'hostName': 'hostName',
      'department': 'department',
      'purpose': 'purpose',
      'accessAreas': 'accessAreas'
    };
    
    // Add form fields with proper mapping
    Object.keys(formData).forEach(key => {
      const backendKey = fieldMapping[key] || key;
      if (key === 'accessAreas') {
        submitFormData.append(backendKey, JSON.stringify(formData[key]));
      } else {
        submitFormData.append(backendKey, formData[key]);
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
      documentType: 'Cedula',
      documentNumber: '',
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
          <Box sx={{ p: 4, maxWidth: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
              Paso 1: Identificación del Visitante
            </Typography>
            
            <Grid container spacing={4}>
              {/* Div de 12 columnas para todas las secciones */}
              <Grid item xs={12}>
                <Grid container spacing={3}>
                  {/* Sección: Identificación del Visitante */}
                  <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3, backgroundColor: 'rgba(25, 118, 210, 0.04)' }}>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                        <Badge color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          Identificación del Visitante
                        </Typography>
                      </Stack>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel>Tipo de Documento</InputLabel>
                            <Select
                              value={formData.documentType}
                              onChange={handleInputChange('documentType')}
                              label="Tipo de Documento"
                            >
                              {documentTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                  {type}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Número de Documento"
                            value={formData.documentNumber}
                            onChange={handleInputChange('documentNumber')}
                            fullWidth
                            variant="outlined"
                            required
                            placeholder="Ingrese el número del documento"
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={2}>
                          <Button
                            variant="contained"
                            startIcon={<Search />}
                            fullWidth
                            sx={{ height: '56px' }}
                            onClick={() => {
                              // Simulate search functionality
                              if (formData.documentNumber) {
                                setFormData(prev => ({
                                  ...prev,
                                  firstName: 'María',
                                  lastName: 'González',
                                  email: 'maria.gonzalez@email.com',
                                  phone: '+1 (555) 123-4567'
                                }));
                              }
                            }}
                          >
                            Buscar
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* Sección: Información Personal */}
                  <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3, backgroundColor: 'rgba(76, 175, 80, 0.04)' }}>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                        <Person color="success" />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                          Información Personal
                        </Typography>
                      </Stack>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Nombre"
                            value={formData.firstName}
                            onChange={handleInputChange('firstName')}
                            fullWidth
                            variant="outlined"
                            required
                            InputProps={{
                              startAdornment: <Person sx={{ color: 'text.secondary', mr: 1 }} />
                            }}
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
                            InputProps={{
                              startAdornment: <Person sx={{ color: 'text.secondary', mr: 1 }} />
                            }}
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
                            InputProps={{
                              startAdornment: <Email sx={{ color: 'text.secondary', mr: 1 }} />
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Teléfono"
                            value={formData.phone}
                            onChange={handleInputChange('phone')}
                            fullWidth
                            variant="outlined"
                            InputProps={{
                              startAdornment: <ContactPhone sx={{ color: 'text.secondary', mr: 1 }} />
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            label="Empresa"
                            value={formData.company}
                            onChange={handleInputChange('company')}
                            fullWidth
                            variant="outlined"
                            InputProps={{
                              startAdornment: <Business sx={{ color: 'text.secondary', mr: 1 }} />
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={() => setActiveStep(1)}
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: 3
                }}
                disabled={!formData.firstName || !formData.lastName || !formData.documentNumber}
              >
                Continuar a Documentos
              </Button>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ p: 4, maxWidth: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
              Paso 2: Documentos Requeridos ({formData.firstName} {formData.lastName})
            </Typography>
                
            <Grid container spacing={4}>
              {/* Div de 12 columnas con título */}
              <Grid item xs={12}>

                <Grid container spacing={3}>
                  {/* Columna 1 de 6 - Foto del ID */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3, textAlign: 'center', minHeight: 400, backgroundColor: 'rgba(25, 118, 210, 0.04)' }}>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3, justifyContent: 'center' }}>
                        <Badge color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          Foto del Documento de Identidad
                        </Typography>
                      </Stack>
                      
                      {idPhotoPreview ? (
                        <Box>
                          <img
                            src={idPhotoPreview}
                            alt="ID Preview"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '200px',
                              objectFit: 'contain',
                              border: '2px solid #4caf50',
                              borderRadius: '8px'
                            }}
                          />
                          <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
                            ✓ Documento cargado exitosamente
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ py: 4 }}>
                          <Badge sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                          <Typography variant="body2" color="text.secondary">
                            No se ha cargado el documento
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ mt: 3 }}>
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
                            fullWidth
                            sx={{ mb: 2 }}
                          >
                            Subir Foto del ID
                          </Button>
                        </label>
                        <Button
                          variant="outlined"
                          startIcon={<CameraAlt />}
                          fullWidth disabled
                          onClick={() => startCamera('id')}
                        >
                          Tomar Foto del ID
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Columna 2 de 6 - Foto del visitante */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3, textAlign: 'center', minHeight: 400, backgroundColor: 'rgba(76, 175, 80, 0.04)' }}>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3, justifyContent: 'center' }}>
                        <Person color="success" />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                          Foto del Visitante
                        </Typography>
                      </Stack>
                      
                      {visitorPhotoPreview ? (
                        <Box>
                          <img
                            src={visitorPhotoPreview}
                            alt="Visitor Preview"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '200px',
                              objectFit: 'contain',
                              border: '2px solid #4caf50',
                              borderRadius: '8px'
                            }}
                          />
                          <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
                            ✓ Foto del visitante capturada
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ py: 4 }}>
                          <Person sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                          <Typography variant="body2" color="text.secondary">
                            No se ha capturado la foto del visitante
                          </Typography>
                        </Box>
                      )}

                      {isCameraOpen ? (
                        <Box sx={{ mt: 3 }}>
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{ width: '100%', maxWidth: '300px', height: 'auto', borderRadius: '8px' }}
                          />
                          <canvas ref={canvasRef} style={{ display: 'none' }} />
                          <Box sx={{ mt: 2 }}>
                            <Button
                              variant="contained"
                              onClick={capturePhoto}
                              startIcon={<CameraAlt />}
                              sx={{ mr: 1 }}
                            >
                              Capturar
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
                        <Box sx={{ mt: 3 }}>
                          
                          <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="visitor-photo-upload"
                          type="file"
                          onChange={handleVisitorPhotoUpload}
                        />
                        <label htmlFor="visitor-photo-upload">
                          <Button
                            variant="contained"
                            component="span"
                            startIcon={<PhotoCamera />}
                            fullWidth
                            sx={{ mb: 2 }}
                          >
                            Subir Foto del Visitante
                          </Button>
                        </label>

                          <Button
                          variant="outlined"
                          startIcon={<CameraAlt />}
                          fullWidth disabled
                          onClick={() => startCamera('visitor')}
                        >
                          Tomar Foto del Visitante
                        </Button>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={() => setActiveStep(2)}
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: 3
                }}
                disabled={!visitorPhoto || !idPhoto}
              >
                Continuar a Información de Visita
              </Button>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 4, maxWidth: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 4, textAlign: 'center', fontWeight: 600, color: 'primary.main' }}>
              Paso 3: ¿A quién visitará en la institución?
            </Typography>
            
            <Grid container spacing={4}>
              {/* Div de 12 columnas para organizar todo */}
              <Grid item xs={12}>
                <Grid container spacing={4}>
                  
                  {/* Sección Principal: ¿A quién visitará? */}
                  <Grid item xs={12}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 4,
                        backgroundColor: 'rgba(156, 39, 176, 0.06)',
                        borderRadius: 3,
                        border: '1px solid rgba(156, 39, 176, 0.2)'
                      }}
                    >
                      <Grid container spacing={4}>
                        {/* Persona a visitar */}
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'secondary.main' }}>
                              👤 Persona a Visitar
                            </Typography>
                            <Autocomplete
                              options={hostOptions}
                              getOptionLabel={(option) => `${option.name} - ${option.department}`}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Busque por nombre o departamento"
                                  required
                                  variant="outlined"
                                  placeholder="Escriba para buscar empleados..."
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      backgroundColor: 'white',
                                      borderRadius: 2
                                    }
                                  }}
                                />
                              )}
                              renderOption={(props, option) => (
                                <Box component="li" {...props} sx={{ p: 2 }}>
                                  <Stack>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                      {option.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      📍 {option.department} • ✉️ {option.email}
                                    </Typography>
                                  </Stack>
                                </Box>
                              )}
                              onChange={(event, value) => {
                                setFormData(prev => ({
                                  ...prev,
                                  hostName: value?.name || '',
                                  department: value?.department || ''
                                }));
                              }}
                              value={hostOptions.find(opt => opt.name === formData.hostName) || null}
                            />
                          </Box>
                        </Grid>
                        
                        {/* Departamento */}
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'secondary.main' }}>
                              🏢 Departamento
                            </Typography>
                            <FormControl fullWidth variant="outlined" required>
                              <Select
                                value={formData.department}
                                onChange={handleInputChange('department')}
                                displayEmpty
                                sx={{
                                  backgroundColor: 'white',
                                  borderRadius: 2
                                }}
                              >
                                <MenuItem disabled value="">
                                  <em>Seleccione un departamento</em>
                                </MenuItem>
                                {departments.map((dept) => (
                                  <MenuItem key={dept} value={dept}>
                                    {dept}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>
                        </Grid>
                        
                        {/* Propósito de la visita */}
                        <Grid item xs={12}>
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'secondary.main' }}>
                              📝 Propósito de la Visita
                            </Typography>
                            <TextField
                              label="Describa el motivo de su visita"
                              value={formData.purpose}
                              onChange={handleInputChange('purpose')}
                              fullWidth
                              variant="outlined"
                              multiline
                              rows={4}
                              required
                              placeholder="Ej: Reunión de trabajo, consultoría, entrevista, capacitación..."
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: 'white',
                                  borderRadius: 2
                                }
                              }}
                            />
                          </Box>
                        </Grid>
                        
                        {/* Áreas de acceso */}
                        <Grid item xs={12}>
                          <Box>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'secondary.main' }}>
                              🔐 Áreas de Acceso Autorizadas
                            </Typography>
                            <FormControl fullWidth variant="outlined">
                              <Select
                                multiple
                                value={formData.accessAreas}
                                onChange={handleAccessAreasChange}
                                displayEmpty
                                sx={{
                                  backgroundColor: 'white',
                                  borderRadius: 2
                                }}
                                renderValue={(selected) => {
                                  if (selected.length === 0) {
                                    return <em style={{ color: '#9e9e9e' }}>Seleccione las áreas autorizadas</em>;
                                  }
                                  return (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                                      {selected.map((value) => (
                                        <Chip
                                          key={value}
                                          label={value}
                                          size="small"
                                          color="secondary"
                                          variant="filled"
                                          sx={{
                                            fontWeight: 500,
                                            borderRadius: 2
                                          }}
                                        />
                                      ))}
                                    </Box>
                                  );
                                }}
                              >
                                {accessAreas.map((area) => (
                                  <MenuItem key={area} value={area}>
                                    📍 {area}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Divider sx={{ my: 5, borderColor: 'rgba(156, 39, 176, 0.3)' }} />

            {/* Botón de registro mejorado */}
            <Box sx={{ textAlign: 'center' }}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  borderRadius: 3,
                  display: 'inline-block'
                }}
              >
                <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                  ¿Está todo listo? Proceda con el registro
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  startIcon={<PersonAdd />}
                  size="large"
                  sx={{
                    px: 6,
                    py: 2,
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    boxShadow: '0 8px 16px rgba(25, 118, 210, 0.3)',
                    background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                    '&:hover': {
                      boxShadow: '0 12px 20px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                  disabled={!formData.hostName || !formData.department || !formData.purpose}
                >
                  Registrar Visita
                </Button>
              </Paper>
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
    <Box sx={{ maxWidth: '85%', mx: 'auto', p: 2 }}>
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