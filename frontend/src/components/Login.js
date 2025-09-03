import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Fade,
  Grid,
  Chip,
  Paper,
  Avatar,
  Container,
  Stack,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Business,
  Security,
  Analytics,
  AdminPanelSettings,
  Person,
  ArrowForward,
  Shield,
  TrendingUp,
  Speed
} from '@mui/icons-material';
import { useAuth, ROLES } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Por favor, complete todos los campos');
      return;
    }

    setLoading(true);
    const result = await login(formData.username, formData.password);
    
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  const demoUsers = [
    {
      role: ROLES.ADMIN,
      username: 'admin',
      password: 'admin123',
      name: 'Rinaldy Molina',
      description: 'Administrador del Sistema',
      icon: <AdminPanelSettings />,
      color: '#8B5CF6',
      bgColor: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
      permissions: ['Gestión completa', 'Configuraciones', 'Usuarios']
    },
    {
      role: ROLES.MANAGER,
      username: 'manager',
      password: 'manager123',
      name: 'Jose Salazar',
      description: 'Gerente de Operaciones',
      icon: <Business />,
      color: '#F59E0B',
      bgColor: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
      permissions: ['Supervisión', 'Reportes', 'Monitoreo']
    },
    {
      role: ROLES.ANALYST,
      username: 'analyst',
      password: 'analyst123',
      name: 'Luis Kendry',
      description: 'Analista de Datos',
      icon: <Analytics />,
      color: '#10B981',
      bgColor: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      permissions: ['Análisis', 'Reportes', 'Consultas']
    }
  ];

  const quickLogin = (user) => {
    setFormData({
      username: user.username,
      password: user.password
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 25% 25%, #8B5CF6 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, #10B981 0%, transparent 50%),
          linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%)
        `,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 100px,
              rgba(139, 92, 246, 0.03) 101px,
              rgba(139, 92, 246, 0.03) 103px,
              transparent 104px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 100px,
              rgba(16, 185, 129, 0.03) 101px,
              rgba(16, 185, 129, 0.03) 103px,
              transparent 104px
            )
          `,
          pointerEvents: 'none',
        }
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          py: 4
        }}>
          <Grid container spacing={6} alignItems="center" justifyContent="center" sx={{ maxWidth: '1000px' }}>
            {/* Left Panel - Branding and Features */}
            <Grid item xs={12} md={6}>
              <Fade in timeout={800}>
                <Box sx={{ color: 'white', textAlign: { xs: 'center', md: 'left' } }}>
                {/* Logo and Brand */}
                <Box sx={{ mb: 6 }}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #8B5CF6 50%, #10B981 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2,
                      letterSpacing: '-0.02em'
                    }}
                  >
                    Control de Visitas
                  </Typography>
                  
                  <Typography
                    variant="h5"
                    sx={{
                      opacity: 0.9,
                      fontWeight: 300,
                      mb: 1,
                      color: '#E5E7EB'
                    }}
                  >
                    Sistema de Control de Visitas
                  </Typography>
                </Box>
                </Box>
              </Fade>
            </Grid>

            {/* Right Panel - Login Form */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Fade in timeout={1200}>
              <Card
                elevation={0}
                sx={{
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: 'linear-gradient(90deg, #8B5CF6 0%, #10B981 50%, #F59E0B 100%)'
                  }
                }}
              >
                <CardContent sx={{ p: 6 }}>
                  {/* Header */}
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: '#1F2937',
                        mb: 1
                      }}
                    >
                      Iniciar Sesión
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#6B7280'
                      }}
                    >
                      Digita tus credenciales para acceder al sistema.
                    </Typography>
                  </Box>

                  {error && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 3,
                        '& .MuiAlert-icon': {
                          color: '#EF4444'
                        }
                      }}
                    >
                      {error}
                    </Alert>
                  )}

                  {/* Login Form */}
                  <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
                    <TextField
                      fullWidth
                      label="Usuario"
                      value={formData.username}
                      onChange={handleInputChange('username')}
                      margin="normal"
                      variant="outlined"
                      disabled={loading}
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          background: '#F9FAFB',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: '#F3F4F6',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#8B5CF6'
                            }
                          },
                          '&.Mui-focused': {
                            background: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#8B5CF6',
                              borderWidth: 2
                            }
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#8B5CF6'
                        }
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Contraseña"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      margin="normal"
                      variant="outlined"
                      disabled={loading}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ color: '#6B7280' }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 4,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          background: '#F9FAFB',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: '#F3F4F6',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#8B5CF6'
                            }
                          },
                          '&.Mui-focused': {
                            background: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#8B5CF6',
                              borderWidth: 2
                            }
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#8B5CF6'
                        }
                      }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                      sx={{
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: 3,
                        textTransform: 'none',
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                        boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.4)',
                        border: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          transition: 'left 0.5s ease'
                        },
                        '&:hover': {
                          background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                          boxShadow: '0 15px 35px -5px rgba(139, 92, 246, 0.5)',
                          transform: 'translateY(-1px)',
                          '&::before': {
                            left: '100%'
                          }
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                        }
                      }}
                    >
                      {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                  </Box>

                  <Divider sx={{ my: 3, '&::before, &::after': { borderColor: '#E5E7EB' } }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', px: 2 }}>
                      Usuarios Demo
                    </Typography>
                  </Divider>

                  {/* Demo Users */}
                  <Stack spacing={2}>
                    {demoUsers.map((user, index) => (
                      <Fade in timeout={1400 + index * 100} key={user.role}>
                        <Paper
                          elevation={0}
                          onClick={() => quickLogin(user)}
                          sx={{
                            p: 3,
                            background: '#F9FAFB',
                            border: '2px solid transparent',
                            borderRadius: 3,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 3,
                              background: user.bgColor,
                              transform: 'scaleX(0)',
                              transition: 'transform 0.3s ease',
                              transformOrigin: 'left'
                            },
                            '&:hover': {
                              background: 'white',
                              borderColor: user.color,
                              transform: 'translateY(-2px)',
                              boxShadow: `0 10px 25px -5px ${user.color}20`,
                              '&::before': {
                                transform: 'scaleX(1)'
                              }
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Avatar
                              sx={{
                                width: 48,
                                height: 48,
                                background: user.bgColor,
                                color: 'white'
                              }}
                            >
                              {user.icon}
                            </Avatar>
                            
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937' }}>
                                  {user.name}
                                </Typography>
                                <Chip
                                  label={user.role}
                                  size="small"
                                  sx={{
                                    background: user.bgColor,
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.7rem'
                                  }}
                                />
                              </Box>
                              <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                                {user.description}
                              </Typography>
                              <Typography variant="caption" sx={{ 
                                fontFamily: 'monospace',
                                color: '#9CA3AF',
                                fontSize: '0.75rem'
                              }}>
                                {user.username} / {user.password}
                              </Typography>
                            </Box>
                            
                            <ArrowForward sx={{ color: user.color, opacity: 0.7 }} />
                          </Box>
                        </Paper>
                      </Fade>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Fade>
            </Box>
          </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;