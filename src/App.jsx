import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import HealthUnitsList from './pages/HealthUnit/HealthUnitsList';
import HealthUnitForm from './pages/HealthUnit/HealthUnitForm';
import InstitutionsList from './pages/Institution/InstitutionsList';
import InstitutionForm from './pages/Institution/InstitutionForm';
import RegionsList from './pages/Regions/RegionsList';
import CoursesList from './pages/Courses/CoursesList';
import LocationsList from './pages/Location/LocationsList';
import EnrollmentPeriods from './pages/EnrollmentPeriods/EnrollmentPeriods';
import StudentsList from './pages/StudentsList';
import StudentForm from './pages/StudentForm';
import InternshipList from './pages/Internship/InternshipList';
import InternshipForm from './pages/Institution/InternshipForm';
import Agenda from './pages/Schedule/Schedule';
import './App.css';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<PrivateRoute><Layout><Home /></Layout></PrivateRoute>} />
      
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