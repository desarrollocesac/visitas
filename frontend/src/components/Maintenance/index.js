import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DocumentTypes from './DocumentTypes';
import Employees from './Employees';
import Departments from './Departments';
import AuthorizedAreas from './AuthorizedAreas';
import { Box, Typography } from '@mui/material';
import { Build } from '@mui/icons-material';

const MaintenanceIndex = () => {
  return (
    <Routes>
      {/* Default maintenance route - shows welcome */}
      <Route 
        path="/" 
        element={
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Build sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
              Sistema de Mantenimientos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Seleccione una opción del menú lateral para gestionar los datos maestros del sistema.
            </Typography>
          </Box>
        } 
      />
      
      {/* Direct routes to each CRUD */}
      <Route path="/document-types" element={<DocumentTypes />} />
      <Route path="/employees" element={<Employees />} />
      <Route path="/departments" element={<Departments />} />
      <Route path="/authorized-areas" element={<AuthorizedAreas />} />

      {/* Catch all - redirect to main maintenance */}
      <Route path="*" element={<Navigate to="/maintenance" replace />} />
    </Routes>
  );
};

export default MaintenanceIndex;