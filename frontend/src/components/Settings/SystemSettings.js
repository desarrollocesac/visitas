import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Settings,
  Security,
  Notifications,
  Storage,
  Wifi,
  Camera,
  Print,
  Email,
  Sms,
  Schedule,
  LocationOn,
  Group,
  AdminPanelSettings,
  Save,
  Restore,
  Download,
  Upload,
  Warning,
  CheckCircle,
  Error,
  Info
} from '@mui/icons-material';

const SystemSettings = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({
    // General Settings
    companyName: 'Mi Empresa S.A.',
    companyAddress: 'Av. Principal 123, Ciudad',
    timezone: 'America/Mexico_City',
    language: 'es',
    dateFormat: 'DD/MM/YYYY',
    
    // Security Settings
    enableTwoFactor: true,
    sessionTimeout: 30,
    passwordComplexity: 'high',
    enableAuditLog: true,
    maxFailedAttempts: 3,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notifyOnEntry: true,
    notifyOnExit: false,
    notifyOnAlert: true,
    
    // System Settings
    enableBackup: true,
    backupFrequency: 'daily',
    retentionDays: 90,
    enableMaintenance: false,
    maxConcurrentUsers: 50,
    
    // Access Control
    enableQRScanner: true,
    enableBiometric: false,
    defaultAccessLevel: 'basic',
    visitDurationLimit: 480, // minutes
    enableGeoFencing: true
  });
  
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [backupDialog, setBackupDialog] = useState(false);

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = () => {
    // Simulate saving settings
    setAlertMessage('Configuración guardada exitosamente');
    setAlertSeverity('success');
    setTimeout(() => setAlertMessage(''), 3000);
  };

  const handleBackup = () => {
    // Simulate backup creation
    setBackupDialog(false);
    setAlertMessage('Respaldo creado exitosamente');
    setAlertSeverity('success');
    setTimeout(() => setAlertMessage(''), 3000);
  };

  const GeneralSettings = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Settings />
          Configuración General
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nombre de la Empresa"
              value={settings.companyName}
              onChange={(e) => handleSettingChange('companyName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Zona Horaria</InputLabel>
              <Select
                value={settings.timezone}
                label="Zona Horaria"
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
              >
                <MenuItem value="America/Mexico_City">Ciudad de México (UTC-6)</MenuItem>
                <MenuItem value="America/New_York">Nueva York (UTC-5)</MenuItem>
                <MenuItem value="America/Los_Angeles">Los Ángeles (UTC-8)</MenuItem>
                <MenuItem value="Europe/Madrid">Madrid (UTC+1)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Dirección de la Empresa"
              multiline
              rows={2}
              value={settings.companyAddress}
              onChange={(e) => handleSettingChange('companyAddress', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Idioma</InputLabel>
              <Select
                value={settings.language}
                label="Idioma"
                onChange={(e) => handleSettingChange('language', e.target.value)}
              >
                <MenuItem value="es">Español</MenuItem>
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="fr">Français</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Formato de Fecha</InputLabel>
              <Select
                value={settings.dateFormat}
                label="Formato de Fecha"
                onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
              >
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const SecuritySettings = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security />
          Configuración de Seguridad
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableTwoFactor}
                  onChange={(e) => handleSettingChange('enableTwoFactor', e.target.checked)}
                />
              }
              label="Habilitar Autenticación de Dos Factores"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableAuditLog}
                  onChange={(e) => handleSettingChange('enableAuditLog', e.target.checked)}
                />
              }
              label="Habilitar Registro de Auditoría"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Tiempo de Sesión (minutos)</Typography>
            <Slider
              value={settings.sessionTimeout}
              onChange={(e, value) => handleSettingChange('sessionTimeout', value)}
              min={5}
              max={120}
              marks={[
                { value: 5, label: '5m' },
                { value: 30, label: '30m' },
                { value: 60, label: '1h' },
                { value: 120, label: '2h' }
              ]}
              valueLabelDisplay="on"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Complejidad de Contraseña</InputLabel>
              <Select
                value={settings.passwordComplexity}
                label="Complejidad de Contraseña"
                onChange={(e) => handleSettingChange('passwordComplexity', e.target.value)}
              >
                <MenuItem value="low">Baja (6+ caracteres)</MenuItem>
                <MenuItem value="medium">Media (8+ caracteres, números)</MenuItem>
                <MenuItem value="high">Alta (12+ caracteres, símbolos)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Máximo Intentos Fallidos"
              value={settings.maxFailedAttempts}
              onChange={(e) => handleSettingChange('maxFailedAttempts', parseInt(e.target.value))}
              inputProps={{ min: 1, max: 10 }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const NotificationSettings = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Notifications />
          Configuración de Notificaciones
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email />
                Email
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  />
                }
                label="Habilitar Email"
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Sms />
                SMS
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.smsNotifications}
                    onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                  />
                }
                label="Habilitar SMS"
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Notifications />
                Push
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.pushNotifications}
                    onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                  />
                }
                label="Habilitar Push"
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Eventos de Notificación
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifyOnEntry}
                  onChange={(e) => handleSettingChange('notifyOnEntry', e.target.checked)}
                />
              }
              label="Notificar al Ingresar"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifyOnExit}
                  onChange={(e) => handleSettingChange('notifyOnExit', e.target.checked)}
                />
              }
              label="Notificar al Salir"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifyOnAlert}
                  onChange={(e) => handleSettingChange('notifyOnAlert', e.target.checked)}
                />
              }
              label="Notificar Alertas"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const SystemManagement = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Storage />
          Gestión del Sistema
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Estado del Sistema
              </Typography>
              <Typography variant="body2">
                El sistema está funcionando correctamente. Última actualización: 03/01/2025 10:30
              </Typography>
            </Alert>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableBackup}
                  onChange={(e) => handleSettingChange('enableBackup', e.target.checked)}
                />
              }
              label="Habilitar Respaldos Automáticos"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Frecuencia de Respaldo</InputLabel>
              <Select
                value={settings.backupFrequency}
                label="Frecuencia de Respaldo"
                onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                disabled={!settings.enableBackup}
              >
                <MenuItem value="hourly">Cada hora</MenuItem>
                <MenuItem value="daily">Diario</MenuItem>
                <MenuItem value="weekly">Semanal</MenuItem>
                <MenuItem value="monthly">Mensual</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Días de Retención"
              value={settings.retentionDays}
              onChange={(e) => handleSettingChange('retentionDays', parseInt(e.target.value))}
              inputProps={{ min: 1, max: 365 }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Máximo Usuarios Concurrentes"
              value={settings.maxConcurrentUsers}
              onChange={(e) => handleSettingChange('maxConcurrentUsers', parseInt(e.target.value))}
              inputProps={{ min: 1, max: 1000 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => setBackupDialog(true)}
              >
                Crear Respaldo
              </Button>
              <Button
                variant="outlined"
                startIcon={<Upload />}
                component="label"
              >
                Restaurar Respaldo
                <input type="file" hidden accept=".backup" />
              </Button>
              <Button
                variant="outlined"
                startIcon={<Restore />}
                color="warning"
              >
                Reiniciar Sistema
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const AccessControlSettings = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AdminPanelSettings />
          Control de Acceso
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableQRScanner}
                  onChange={(e) => handleSettingChange('enableQRScanner', e.target.checked)}
                />
              }
              label="Habilitar Escáner QR"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableBiometric}
                  onChange={(e) => handleSettingChange('enableBiometric', e.target.checked)}
                />
              }
              label="Habilitar Biométrico"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableGeoFencing}
                  onChange={(e) => handleSettingChange('enableGeoFencing', e.target.checked)}
                />
              }
              label="Habilitar Geo-cercado"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Nivel de Acceso Predeterminado</InputLabel>
              <Select
                value={settings.defaultAccessLevel}
                label="Nivel de Acceso Predeterminado"
                onChange={(e) => handleSettingChange('defaultAccessLevel', e.target.value)}
              >
                <MenuItem value="basic">Básico</MenuItem>
                <MenuItem value="standard">Estándar</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Límite de Duración de Visita (horas)</Typography>
            <Slider
              value={settings.visitDurationLimit / 60}
              onChange={(e, value) => handleSettingChange('visitDurationLimit', value * 60)}
              min={1}
              max={24}
              marks={[
                { value: 1, label: '1h' },
                { value: 4, label: '4h' },
                { value: 8, label: '8h' },
                { value: 24, label: '24h' }
              ]}
              valueLabelDisplay="on"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const BackupDialog = () => (
    <Dialog open={backupDialog} onClose={() => setBackupDialog(false)}>
      <DialogTitle>Crear Respaldo del Sistema</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          El proceso de respaldo puede tardar varios minutos. No cierre esta ventana durante el proceso.
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Se creará un respaldo completo incluyendo:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Base de datos de visitantes" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Configuración del sistema" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Archivos de usuario" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Logs del sistema" />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setBackupDialog(false)}>Cancelar</Button>
        <Button variant="contained" onClick={handleBackup} startIcon={<Download />}>
          Crear Respaldo
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Configuración del Sistema
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Administra todas las configuraciones y ajustes del sistema
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
        >
          Guardar Cambios
        </Button>
      </Box>

      {alertMessage && (
        <Alert severity={alertSeverity} sx={{ mb: 3 }}>
          {alertMessage}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            icon={<Settings />}
            iconPosition="start"
            label="General"
          />
          <Tab
            icon={<Security />}
            iconPosition="start"
            label="Seguridad"
          />
          <Tab
            icon={<Notifications />}
            iconPosition="start"
            label="Notificaciones"
          />
          <Tab
            icon={<Storage />}
            iconPosition="start"
            label="Sistema"
          />
          <Tab
            icon={<AdminPanelSettings />}
            iconPosition="start"
            label="Control de Acceso"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {tabValue === 0 && <GeneralSettings />}
        {tabValue === 1 && <SecuritySettings />}
        {tabValue === 2 && <NotificationSettings />}
        {tabValue === 3 && <SystemManagement />}
        {tabValue === 4 && <AccessControlSettings />}
      </Box>

      <BackupDialog />
    </Box>
  );
};

export default SystemSettings;