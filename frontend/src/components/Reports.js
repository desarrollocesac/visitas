import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider
} from '@mui/material';
import {
  Assessment,
  Download,
  DateRange,
  People,
  AccessTime,
  TrendingUp
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const Reports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    startDate: new Date(),
    endDate: new Date(),
    department: ''
  });

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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setReportData(null);
    setError('');
  };

  const handleFilterChange = (field) => (value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateReport = async () => {
    setLoading(true);
    setError('');

    try {
      let url = '';
      let params = {};

      switch (activeTab) {
        case 0: // Daily Report
          url = `${API_BASE}/api/reports/daily`;
          params.date = filters.startDate.toISOString().split('T')[0];
          break;
        
        case 1: // Weekly Report
          url = `${API_BASE}/api/reports/weekly`;
          params.startDate = filters.startDate.toISOString().split('T')[0];
          params.endDate = filters.endDate.toISOString().split('T')[0];
          break;
        
        case 2: // Access Logs
          url = `${API_BASE}/api/reports/access-logs`;
          params.startDate = filters.startDate.toISOString().split('T')[0];
          params.endDate = filters.endDate.toISOString().split('T')[0];
          if (filters.department) {
            params.department = filters.department;
          }
          break;
        
        case 3: // Frequent Visitors
          url = `${API_BASE}/api/reports/frequent-visitors`;
          params.startDate = filters.startDate.toISOString().split('T')[0];
          params.endDate = filters.endDate.toISOString().split('T')[0];
          break;
        
        default:
          throw new Error('Tipo de reporte no válido');
      }

      const response = await axios.get(url, { params });
      setReportData(response.data.data);

    } catch (err) {
      setError(err.response?.data?.error || 'Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const renderDailyReport = () => {
    if (!reportData) return null;

    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" gutterBottom>
                  {reportData.statistics.totalVisits}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total de Visitas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" gutterBottom>
                  {reportData.statistics.activeVisits}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Visitas Activas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Assessment sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" gutterBottom>
                  {reportData.statistics.completedVisits}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Visitas Completadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <AccessTime sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" gutterBottom>
                  {reportData.statistics.averageDurationMinutes}m
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Duración Promedio
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Department Breakdown */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Visitas por Departamento
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(reportData.departmentBreakdown).map(([dept, count]) => (
                <Grid item key={dept}>
                  <Chip 
                    label={`${dept}: ${count}`}
                    variant="outlined"
                    color="primary"
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Visits Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Visitante</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>Anfitrión</TableCell>
                <TableCell>Departamento</TableCell>
                <TableCell>Hora Entrada</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Duración</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.visits.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell>{visit.visitor_name}</TableCell>
                  <TableCell>{visit.company || '-'}</TableCell>
                  <TableCell>{visit.host_name}</TableCell>
                  <TableCell>{visit.department}</TableCell>
                  <TableCell>{formatDateTime(visit.check_in_time)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={visit.status === 'active' ? 'Activa' : 'Completada'}
                      color={visit.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {Math.round(visit.duration_seconds / 60)} min
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderWeeklyReport = () => {
    if (!reportData) return null;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Reporte Semanal ({reportData.period.startDate} - {reportData.period.endDate})
        </Typography>
        
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell align="right">Total Visitas</TableCell>
                <TableCell align="right">Activas</TableCell>
                <TableCell align="right">Completadas</TableCell>
                <TableCell align="right">Duración Promedio (min)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.dailyStats.map((day) => (
                <TableRow key={day.date}>
                  <TableCell>{formatDate(day.date)}</TableCell>
                  <TableCell align="right">{day.totalVisits}</TableCell>
                  <TableCell align="right">{day.activeVisits}</TableCell>
                  <TableCell align="right">{day.completedVisits}</TableCell>
                  <TableCell align="right">{day.averageDurationMinutes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Departamentos
                </Typography>
                {reportData.topDepartments.map((dept, index) => (
                  <Box key={dept.department} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {index + 1}. {dept.department}: {dept.visit_count} visitas
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Empresas
                </Typography>
                {reportData.topCompanies.map((company, index) => (
                  <Box key={company.company} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {index + 1}. {company.company}: {company.visit_count} visitas
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderAccessLogsReport = () => {
    if (!reportData) return null;

    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4">{reportData.statistics.totalAttempts}</Typography>
                <Typography variant="body2">Total Intentos</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {reportData.statistics.grantedAttempts}
                </Typography>
                <Typography variant="body2">Accesos Concedidos</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {reportData.statistics.deniedAttempts}
                </Typography>
                <Typography variant="body2">Accesos Denegados</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {reportData.statistics.successRate}%
                </Typography>
                <Typography variant="body2">Tasa de Éxito</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Visitante</TableCell>
                <TableCell>Departamento</TableCell>
                <TableCell>Hora</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Motivo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.visitor_name}</TableCell>
                  <TableCell>{log.department}</TableCell>
                  <TableCell>{formatDateTime(log.access_time)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={log.access_granted ? 'Concedido' : 'Denegado'}
                      color={log.access_granted ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{log.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderFrequentVisitorsReport = () => {
    if (!reportData) return null;

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Visitante</TableCell>
              <TableCell>Empresa</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell align="right">Número de Visitas</TableCell>
              <TableCell>Primera Visita</TableCell>
              <TableCell>Última Visita</TableCell>
              <TableCell>Departamentos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.frequentVisitors.map((visitor) => (
              <TableRow key={visitor.id}>
                <TableCell>{visitor.visitor_name}</TableCell>
                <TableCell>{visitor.company || '-'}</TableCell>
                <TableCell>
                  <Box>
                    {visitor.email && <Typography variant="caption" display="block">{visitor.email}</Typography>}
                    {visitor.phone && <Typography variant="caption" display="block">{visitor.phone}</Typography>}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Chip label={visitor.visitCount} color="primary" />
                </TableCell>
                <TableCell>{formatDate(visitor.first_visit)}</TableCell>
                <TableCell>{formatDate(visitor.last_visit)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {visitor.departments_visited.map((dept, index) => (
                      <Chip key={index} label={dept} size="small" variant="outlined" />
                    ))}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const tabLabels = [
    'Reporte Diario',
    'Reporte Semanal',
    'Logs de Acceso',
    'Visitantes Frecuentes'
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h4" gutterBottom>
          Reportes del Sistema
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
              {tabLabels.map((label, index) => (
                <Tab key={index} label={label} />
              ))}
            </Tabs>

            <Divider sx={{ mb: 2 }} />

            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {activeTab !== 0 && (
                <Grid item xs={12} sm={4}>
                  <DatePicker
                    label="Fecha Inicio"
                    value={filters.startDate}
                    onChange={handleFilterChange('startDate')}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              )}
              
              {activeTab === 0 && (
                <Grid item xs={12} sm={4}>
                  <DatePicker
                    label="Fecha"
                    value={filters.startDate}
                    onChange={handleFilterChange('startDate')}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              )}
              
              {activeTab !== 0 && (
                <Grid item xs={12} sm={4}>
                  <DatePicker
                    label="Fecha Fin"
                    value={filters.endDate}
                    onChange={handleFilterChange('endDate')}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              )}
              
              {activeTab === 2 && (
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Departamento</InputLabel>
                    <Select
                      value={filters.department}
                      onChange={(e) => handleFilterChange('department')(e.target.value)}
                      label="Departamento"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              <Grid item xs={12} sm={4}>
                <Button
                  variant="contained"
                  onClick={generateReport}
                  startIcon={loading ? <CircularProgress size={20} /> : <Assessment />}
                  disabled={loading}
                  fullWidth
                  size="large"
                >
                  Generar Reporte
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {reportData && !loading && (
          <Card>
            <CardContent>
              {activeTab === 0 && renderDailyReport()}
              {activeTab === 1 && renderWeeklyReport()}
              {activeTab === 2 && renderAccessLogsReport()}
              {activeTab === 3 && renderFrequentVisitorsReport()}
            </CardContent>
          </Card>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default Reports;