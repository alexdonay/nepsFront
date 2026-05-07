import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import HealthUnitsList from './pages/HealthUnitsList';
import HealthUnitForm from './pages/HealthUnitForm';
import InstitutionsList from './pages/InstitutionsList';
import InstitutionForm from './pages/InstitutionForm';
import RegionsList from './pages/RegionsList';
import CoursesList from './pages/CoursesList';
import LocationsList from './pages/LocationsList';
import EnrollmentPeriods from './pages/EnrollmentPeriods';
import StudentsList from './pages/StudentsList';
import StudentForm from './pages/StudentForm';
import InternshipList from './pages/InternshipList';
import InternshipForm from './pages/InternshipForm';
import Agenda from './pages/Agenda';
import './App.css';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<PrivateRoute><Layout><h1>Início</h1></Layout></PrivateRoute>} />
      
      <Route path="/units" element={<PrivateRoute><Layout><HealthUnitsList /></Layout></PrivateRoute>} />
      <Route path="/units/new" element={<PrivateRoute><Layout><HealthUnitForm /></Layout></PrivateRoute>} />
      <Route path="/units/:id" element={<PrivateRoute><Layout><HealthUnitForm /></Layout></PrivateRoute>} />
      
      <Route path="/institutions" element={<PrivateRoute><Layout><InstitutionsList /></Layout></PrivateRoute>} />
      <Route path="/institutions/new" element={<PrivateRoute><Layout><InstitutionForm /></Layout></PrivateRoute>} />
      
      <Route path="/regions" element={<PrivateRoute><Layout><RegionsList /></Layout></PrivateRoute>} />
      <Route path="/courses" element={<PrivateRoute><Layout><CoursesList /></Layout></PrivateRoute>} />
      <Route path="/locations" element={<PrivateRoute><Layout><LocationsList /></Layout></PrivateRoute>} />
      
      <Route path="/periods" element={<PrivateRoute><Layout><EnrollmentPeriods /></Layout></PrivateRoute>} />
      <Route path="/students" element={<PrivateRoute><Layout><StudentsList /></Layout></PrivateRoute>} />
      <Route path="/students/new" element={<PrivateRoute><Layout><StudentForm /></Layout></PrivateRoute>} />
      <Route path="/students/:id" element={<PrivateRoute><Layout><StudentForm /></Layout></PrivateRoute>} />
      
      <Route path="/internships" element={<PrivateRoute><Layout><InternshipList /></Layout></PrivateRoute>} />
      <Route path="/internships/new" element={<PrivateRoute><Layout><InternshipForm /></Layout></PrivateRoute>} />
      
      <Route path="/dashboard" element={<PrivateRoute><Layout><Agenda /></Layout></PrivateRoute>} />
    </Routes>
  );
}