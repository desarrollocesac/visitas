import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MaintenanceMenu from './MaintenanceMenu';
import DocumentTypes from './DocumentTypes';
import Employees from './Employees';
import Departments from './Departments';
import AuthorizedAreas from './AuthorizedAreas';

const MaintenanceIndex = () => {
  return (
    <Routes>
      {/* Default route - shows menu */}
      <Route 
        path="/" 
        element={
          <MaintenanceMenu>
            {/* This will show the welcome screen */}
          </MaintenanceMenu>
        } 
      />
      
      {/* Document Types */}
      <Route 
        path="/document-types" 
        element={
          <MaintenanceMenu currentSection="document-types">
            <DocumentTypes />
          </MaintenanceMenu>
        } 
      />
      
      {/* Employees */}
      <Route 
        path="/employees" 
        element={
          <MaintenanceMenu currentSection="employees">
            <Employees />
          </MaintenanceMenu>
        } 
      />
      
      {/* Departments */}
      <Route 
        path="/departments" 
        element={
          <MaintenanceMenu currentSection="departments">
            <Departments />
          </MaintenanceMenu>
        } 
      />
      
      {/* Authorized Areas */}
      <Route 
        path="/authorized-areas" 
        element={
          <MaintenanceMenu currentSection="authorized-areas">
            <AuthorizedAreas />
          </MaintenanceMenu>
        } 
      />

      {/* Catch all - redirect to main maintenance */}
      <Route path="*" element={<Navigate to="/maintenance" replace />} />
    </Routes>
  );
};

export default MaintenanceIndex;