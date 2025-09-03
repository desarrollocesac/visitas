import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import VisitorRegistration from './components/VisitorRegistration';
import VisitorList from './components/VisitorList';
import Reports from './components/Reports';
import { PersonAdd, People, Assessment } from '@mui/icons-material';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [currentView, setCurrentView] = useState('registration');

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Sistema de Control de Visitas
            </Typography>
            <Box>
              <Button
                color="inherit"
                startIcon={<PersonAdd />}
                onClick={() => handleViewChange('registration')}
                variant={currentView === 'registration' ? 'outlined' : 'text'}
                sx={{ mr: 1 }}
              >
                Registrar Visita
              </Button>
              <Button
                color="inherit"
                startIcon={<People />}
                onClick={() => handleViewChange('list')}
                variant={currentView === 'list' ? 'outlined' : 'text'}
                sx={{ mr: 1 }}
              >
                Ver Visitantes
              </Button>
              <Button
                color="inherit"
                startIcon={<Assessment />}
                onClick={() => handleViewChange('reports')}
                variant={currentView === 'reports' ? 'outlined' : 'text'}
              >
                Reportes
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth={false} sx={{ mt: 2 }}>
          {currentView === 'registration' && <VisitorRegistration />}
          {currentView === 'list' && <VisitorList />}
          {currentView === 'reports' && <Reports />}
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;