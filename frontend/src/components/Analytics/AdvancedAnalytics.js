import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  useTheme,
  alpha,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  Business,
  Schedule,
  LocationOn,
  CalendarToday,
  AccessTime,
  Analytics as AnalyticsIcon,
  Download,
  Refresh,
  FilterList,
  DateRange,
  Timeline,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ComposedChart,
  ReferenceLine
} from 'recharts';

const AdvancedAnalytics = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(false);

  // Mock data for analytics
  const mockData = {
    visitorTrends: [
      { date: '2025-01-01', visitors: 45, checkIns: 45, checkOuts: 42, avgDuration: 125 },
      { date: '2025-01-02', visitors: 52, checkIns: 52, checkOuts: 48, avgDuration: 135 },
      { date: '2025-01-03', visitors: 38, checkIns: 38, checkOuts: 35, avgDuration: 145 },
      { date: '2025-01-04', visitors: 67, checkIns: 67, checkOuts: 63, avgDuration: 155 },
      { date: '2025-01-05', visitors: 41, checkIns: 41, checkOuts: 39, avgDuration: 140 },
      { date: '2025-01-06', visitors: 58, checkIns: 58, checkOuts: 55, avgDuration: 160 },
      { date: '2025-01-07', visitors: 73, checkIns: 73, checkOuts: 70, avgDuration: 170 }
    ],
    departmentStats: [
      { name: 'IT', visitors: 145, color: '#2196f3', percentage: 28.5 },
      { name: 'Marketing', visitors: 132, color: '#4caf50', percentage: 26.0 },
      { name: 'Ventas', visitors: 98, color: '#ff9800', percentage: 19.3 },
      { name: 'RRHH', visitors: 76, color: '#f44336', percentage: 14.9 },
      { name: 'Administración', visitors: 58, color: '#9c27b0', percentage: 11.4 }
    ],
    hourlyDistribution: [
      { hour: '8:00', visitors: 12, efficiency: 65 },
      { hour: '9:00', visitors: 28, efficiency: 78 },
      { hour: '10:00', visitors: 45, efficiency: 85 },
      { hour: '11:00', visitors: 38, efficiency: 82 },
      { hour: '12:00', visitors: 22, efficiency: 70 },
      { hour: '13:00', visitors: 15, efficiency: 60 },
      { hour: '14:00', visitors: 52, efficiency: 90 },
      { hour: '15:00', visitors: 41, efficiency: 88 },
      { hour: '16:00', visitors: 35, efficiency: 75 },
      { hour: '17:00', visitors: 18, efficiency: 68 }
    ],
    kpis: {
      totalVisitors: 2847,
      avgDailyVisitors: 94.9,
      peakHour: '14:00',
      avgVisitDuration: 145,
      conversionRate: 89.2,
      satisfactionScore: 4.6,
      capacityUtilization: 78.4,
      securityIncidents: 3
    },
    topVisitors: [
      { name: 'Juan Pérez', visits: 12, lastVisit: '2025-01-03', department: 'IT', type: 'frequent' },
      { name: 'María García', visits: 8, lastVisit: '2025-01-02', department: 'Marketing', type: 'regular' },
      { name: 'Carlos López', visits: 6, lastVisit: '2025-01-03', department: 'Ventas', type: 'regular' },
      { name: 'Ana Rodríguez', visits: 5, lastVisit: '2025-01-01', department: 'RRHH', type: 'occasional' }
    ],
    securityAlerts: [
      { id: 1, type: 'access_denied', location: 'Planta Alta', time: '14:30', severity: 'medium' },
      { id: 2, type: 'unauthorized_area', location: 'Sala Servidores', time: '11:15', severity: 'high' },
      { id: 3, type: 'extended_visit', location: 'Marketing', time: '09:45', severity: 'low' }
    ]
  };

  const MetricCard = ({ title, value, change, changeType, icon, color, subtitle, progress }) => (
    <Card sx={{ 
      height: '100%',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
      border: `1px solid ${alpha(color, 0.2)}`
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color, mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {progress !== undefined && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption">Progreso</Typography>
                  <Typography variant="caption">{progress}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: alpha(color, 0.1),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: color
                    }
                  }} 
                />
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: alpha(color, 0.1), color: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Box>
        
        {change && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            {changeType === 'increase' ? (
              <TrendingUp sx={{ color: theme.palette.success.main, mr: 0.5, fontSize: 18 }} />
            ) : (
              <TrendingDown sx={{ color: theme.palette.error.main, mr: 0.5, fontSize: 18 }} />
            )}
            <Typography
              variant="caption"
              sx={{
                color: changeType === 'increase' ? theme.palette.success.main : theme.palette.error.main,
                fontWeight: 500
              }}
            >
              {change}% vs período anterior
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const VisitorTrendsChart = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Tendencias de Visitantes
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip label="Check-ins" size="small" sx={{ bgcolor: theme.palette.primary.main, color: 'white' }} />
            <Chip label="Check-outs" size="small" sx={{ bgcolor: theme.palette.success.main, color: 'white' }} />
            <Chip label="Duración Prom." size="small" sx={{ bgcolor: theme.palette.warning.main, color: 'white' }} />
          </Box>
        </Box>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={mockData.visitorTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
            <YAxis yAxisId="visitors" stroke={theme.palette.text.secondary} />
            <YAxis yAxisId="duration" orientation="right" stroke={theme.palette.text.secondary} />
            <ChartTooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: 'none',
                borderRadius: 8,
                boxShadow: theme.shadows[8]
              }}
            />
            <Area
              yAxisId="visitors"
              type="monotone"
              dataKey="checkIns"
              fill={alpha(theme.palette.primary.main, 0.3)}
              stroke={theme.palette.primary.main}
              strokeWidth={2}
            />
            <Line
              yAxisId="visitors"
              type="monotone"
              dataKey="checkOuts"
              stroke={theme.palette.success.main}
              strokeWidth={2}
              dot={{ fill: theme.palette.success.main, strokeWidth: 2, r: 4 }}
            />
            <Bar
              yAxisId="duration"
              dataKey="avgDuration"
              fill={alpha(theme.palette.warning.main, 0.6)}
              radius={[4, 4, 0, 0]}
            />
            <ReferenceLine yAxisId="duration" y={150} stroke={theme.palette.warning.main} strokeDasharray="2 2" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const DepartmentPieChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Distribución por Departamento
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={mockData.departmentStats}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="visitors"
            >
              {mockData.departmentStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: 'none',
                borderRadius: 8,
                boxShadow: theme.shadows[8]
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <Box sx={{ mt: 2 }}>
          {mockData.departmentStats.map((dept, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: dept.color }} />
                <Typography variant="body2">{dept.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {dept.visitors} visitas
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {dept.percentage}%
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  const HourlyAnalysis = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Análisis Horario
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={mockData.hourlyDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis dataKey="hour" stroke={theme.palette.text.secondary} />
            <YAxis yAxisId="visitors" stroke={theme.palette.text.secondary} />
            <YAxis yAxisId="efficiency" orientation="right" stroke={theme.palette.text.secondary} />
            <ChartTooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: 'none',
                borderRadius: 8,
                boxShadow: theme.shadows[8]
              }}
            />
            <Bar
              yAxisId="visitors"
              dataKey="visitors"
              fill={theme.palette.primary.main}
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="efficiency"
              type="monotone"
              dataKey="efficiency"
              stroke={theme.palette.success.main}
              strokeWidth={3}
              dot={{ fill: theme.palette.success.main, strokeWidth: 2, r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const TopVisitors = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Visitantes Frecuentes
        </Typography>
        <Box>
          {mockData.topVisitors.map((visitor, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, borderBottom: index < mockData.topVisitors.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 36, height: 36 }}>
                  {visitor.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {visitor.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {visitor.department} • Última visita: {visitor.lastVisit}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {visitor.visits}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  visitas
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  const SecurityAlerts = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Alertas de Seguridad Recientes
        </Typography>
        <Box>
          {mockData.securityAlerts.map((alert) => (
            <Box key={alert.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Avatar sx={{ 
                bgcolor: alert.severity === 'high' ? theme.palette.error.main : 
                         alert.severity === 'medium' ? theme.palette.warning.main : 
                         theme.palette.info.main,
                width: 32, 
                height: 32 
              }}>
                •
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {alert.type === 'access_denied' ? 'Acceso Denegado' : 
                   alert.type === 'unauthorized_area' ? 'Área No Autorizada' : 
                   'Visita Extendida'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {alert.location} • {alert.time}
                </Typography>
              </Box>
              <Chip
                label={alert.severity === 'high' ? 'Alta' : alert.severity === 'medium' ? 'Media' : 'Baja'}
                size="small"
                color={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Análisis Avanzado
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Métricas detalladas y análisis predictivo del sistema de visitantes
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={timeRange}
              label="Período"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7">Última semana</MenuItem>
              <MenuItem value="30">Último mes</MenuItem>
              <MenuItem value="90">Últimos 3 meses</MenuItem>
              <MenuItem value="365">Último año</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => {}}
          >
            Exportar
          </Button>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
          >
            Actualizar
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Visitantes"
            value={mockData.kpis.totalVisitors.toLocaleString()}
            change={15.2}
            changeType="increase"
            icon={<People />}
            color={theme.palette.primary.main}
            subtitle="Últimos 30 días"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Promedio Diario"
            value={mockData.kpis.avgDailyVisitors}
            change={8.7}
            changeType="increase"
            icon={<CalendarToday />}
            color={theme.palette.success.main}
            subtitle="Visitantes por día"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Hora Pico"
            value={mockData.kpis.peakHour}
            icon={<AccessTime />}
            color={theme.palette.warning.main}
            subtitle="Mayor tráfico"
            progress={mockData.kpis.capacityUtilization}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Duración Promedio"
            value={`${mockData.kpis.avgVisitDuration}m`}
            change={-2.1}
            changeType="decrease"
            icon={<Schedule />}
            color={theme.palette.info.main}
            subtitle="Por visita"
          />
        </Grid>
      </Grid>

      {/* Tabs for different analysis views */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            icon={<ShowChart />}
            iconPosition="start"
            label="Tendencias"
          />
          <Tab
            icon={<PieChartIcon />}
            iconPosition="start"
            label="Distribución"
          />
          <Tab
            icon={<BarChartIcon />}
            iconPosition="start"
            label="Análisis Horario"
          />
          <Tab
            icon={<Timeline />}
            iconPosition="start"
            label="Predictivo"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <VisitorTrendsChart />
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <DepartmentPieChart />
          </Grid>
          <Grid item xs={12} lg={4}>
            <TopVisitors />
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <HourlyAnalysis />
          </Grid>
          <Grid item xs={12} lg={4}>
            <SecurityAlerts />
          </Grid>
        </Grid>
      )}

      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <AnalyticsIcon sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Análisis Predictivo
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Funciones de machine learning y predicción de tendencias en desarrollo
                </Typography>
                <Button variant="contained" startIcon={<Timeline />}>
                  Próximamente
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdvancedAnalytics;