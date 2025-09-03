import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  IconButton,
  LinearProgress,
  Chip,
  Button,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  alpha,
  Divider,
  Fade,
  Grow
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  PersonAdd,
  ExitToApp,
  Security,
  Schedule,
  Business,
  LocationOn,
  Assessment,
  Refresh,
  MoreVert,
  CheckCircle,
  Warning,
  Error,
  Info,
  Timer,
  Group,
  Today,
  CalendarMonth,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useAuth, ROLES } from '../../contexts/AuthContext';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

const Dashboard = () => {
  const theme = useTheme();
  const { user, hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setDashboardData(getMockData());
      setLoading(false);
    }, 1000);
  }, []);

  const getMockData = () => ({
    stats: {
      totalVisitors: 1247,
      todayVisitors: 89,
      activeVisitors: 24,
      departments: 8,
      avgVisitDuration: '2h 15m',
      securityAlerts: 3,
      peakHour: '2:00 PM',
      occupancyRate: 78
    },
    recentActivity: [
      {
        id: 1,
        visitor: 'Juan Pérez',
        action: 'check_in',
        department: 'IT',
        time: '10:30 AM',
        status: 'active',
        avatar: null
      },
      {
        id: 2,
        visitor: 'María García',
        action: 'check_out',
        department: 'Marketing',
        time: '10:15 AM',
        status: 'completed',
        avatar: null
      },
      {
        id: 3,
        visitor: 'Carlos López',
        action: 'check_in',
        department: 'Ventas',
        time: '9:45 AM',
        status: 'active',
        avatar: null
      },
      {
        id: 4,
        visitor: 'Ana Rodríguez',
        action: 'security_alert',
        department: 'Recepción',
        time: '9:30 AM',
        status: 'alert',
        avatar: null
      }
    ],
    visitorTrends: [
      { name: 'Lun', visitors: 45, checkouts: 42 },
      { name: 'Mar', visitors: 52, checkouts: 51 },
      { name: 'Mie', visitors: 49, checkouts: 45 },
      { name: 'Jue', visitors: 63, checkouts: 60 },
      { name: 'Vie', visitors: 89, checkouts: 85 },
      { name: 'Sab', visitors: 28, checkouts: 26 },
      { name: 'Dom', visitors: 15, checkouts: 14 }
    ],
    departmentData: [
      { name: 'IT', value: 25, color: '#2196f3' },
      { name: 'Marketing', value: 20, color: '#4caf50' },
      { name: 'Ventas', value: 18, color: '#ff9800' },
      { name: 'RRHH', value: 15, color: '#f44336' },
      { name: 'Administración', value: 12, color: '#9c27b0' },
      { name: 'Otros', value: 10, color: '#607d8b' }
    ],
    hourlyData: [
      { hour: '8AM', visitors: 12 },
      { hour: '9AM', visitors: 28 },
      { hour: '10AM', visitors: 45 },
      { hour: '11AM', visitors: 38 },
      { hour: '12PM', visitors: 22 },
      { hour: '1PM', visitors: 15 },
      { hour: '2PM', visitors: 52 },
      { hour: '3PM', visitors: 41 },
      { hour: '4PM', visitors: 35 },
      { hour: '5PM', visitors: 18 }
    ]
  });

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';
    return `${greeting}, ${user.name}`;
  };

  const StatCard = ({ title, value, change, changeType, icon, color, subtitle }) => (
    <Grow in timeout={500}>
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
          border: `1px solid ${alpha(color, 0.2)}`,
          borderRadius: 3,
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 25px ${alpha(color, 0.25)}`
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
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
            </Box>
            <Avatar
              sx={{
                bgcolor: alpha(color, 0.1),
                color: color,
                width: 48,
                height: 48
              }}
            >
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
                {change}% vs semana anterior
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Grow>
  );

  const RecentActivityCard = () => (
    <Fade in timeout={800}>
      <Card sx={{ height: '100%', borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Actividad Reciente
            </Typography>
            <IconButton size="small">
              <Refresh />
            </IconButton>
          </Box>
          
          <List sx={{ p: 0 }}>
            {dashboardData?.recentActivity.map((activity, index) => (
              <ListItem
                key={activity.id}
                sx={{
                  px: 0,
                  py: 1,
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04)
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: getActivityColor(activity.action),
                      width: 36,
                      height: 36
                    }}
                  >
                    {getActivityIcon(activity.action)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                      {activity.visitor}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {getActivityText(activity.action)} - {activity.department}
                      </Typography>
                      <Chip
                        label={activity.status}
                        size="small"
                        sx={{
                          ml: 1,
                          height: 20,
                          fontSize: '0.7rem',
                          bgcolor: getStatusColor(activity.status),
                          color: 'white'
                        }}
                      />
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Typography variant="caption" color="text.secondary">
                    {activity.time}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Fade>
  );

  const getActivityColor = (action) => {
    const colors = {
      check_in: theme.palette.success.main,
      check_out: theme.palette.info.main,
      security_alert: theme.palette.error.main
    };
    return colors[action] || theme.palette.grey[500];
  };

  const getActivityIcon = (action) => {
    const icons = {
      check_in: <PersonAdd sx={{ fontSize: 18 }} />,
      check_out: <ExitToApp sx={{ fontSize: 18 }} />,
      security_alert: <Security sx={{ fontSize: 18 }} />
    };
    return icons[action] || <Info sx={{ fontSize: 18 }} />;
  };

  const getActivityText = (action) => {
    const texts = {
      check_in: 'Ingreso',
      check_out: 'Salida',
      security_alert: 'Alerta de seguridad'
    };
    return texts[action] || 'Actividad';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: theme.palette.success.main,
      completed: theme.palette.info.main,
      alert: theme.palette.error.main
    };
    return colors[status] || theme.palette.grey[500];
  };

  const VisitorTrendsChart = () => (
    <Fade in timeout={1000}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Tendencia de Visitantes (Últimos 7 días)
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dashboardData?.visitorTrends}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCheckouts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
              <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
              <YAxis stroke={theme.palette.text.secondary} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: 'none',
                  borderRadius: 8,
                  boxShadow: theme.shadows[8]
                }}
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke={theme.palette.primary.main}
                fillOpacity={1}
                fill="url(#colorVisitors)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="checkouts"
                stroke={theme.palette.success.main}
                fillOpacity={1}
                fill="url(#colorCheckouts)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Fade>
  );

  const QuickActions = () => (
    <Fade in timeout={600}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Acciones Rápidas
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<PersonAdd />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #388e3c, #4caf50)',
                  }
                }}
              >
                Registrar
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Assessment />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                Reportes
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Fade>
  );

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  const stats = dashboardData?.stats;

  return (
    <Box>
      {/* Welcome Section */}
      <Fade in timeout={400}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {getWelcomeMessage()}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Aquí tienes un resumen de la actividad del sistema de visitantes
          </Typography>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Visitantes Hoy"
            value={stats?.todayVisitors}
            change={15}
            changeType="increase"
            icon={<Today />}
            color={theme.palette.primary.main}
            subtitle="Total de ingresos"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Visitantes Activos"
            value={stats?.activeVisitors}
            change={8}
            changeType="increase"
            icon={<Group />}
            color={theme.palette.success.main}
            subtitle="En las instalaciones"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ocupación"
            value={`${stats?.occupancyRate}%`}
            change={5}
            changeType="decrease"
            icon={<Business />}
            color={theme.palette.warning.main}
            subtitle="Capacidad utilizada"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Alertas"
            value={stats?.securityAlerts}
            icon={<Security />}
            color={theme.palette.error.main}
            subtitle="Requieren atención"
          />
        </Grid>
      </Grid>

      {/* Charts and Activity */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <VisitorTrendsChart />
        </Grid>
        <Grid item xs={12} lg={4}>
          <RecentActivityCard />
        </Grid>
      </Grid>

      {/* Additional Stats and Actions */}
      {hasRole(ROLES.ADMIN) && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Fade in timeout={1200}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Visitantes por Hora (Hoy)
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dashboardData?.hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                      <XAxis dataKey="hour" stroke={theme.palette.text.secondary} />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: 'none',
                          borderRadius: 8,
                          boxShadow: theme.shadows[8]
                        }}
                      />
                      <Bar
                        dataKey="visitors"
                        fill={theme.palette.primary.main}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
          <Grid item xs={12} md={4}>
            <QuickActions />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;