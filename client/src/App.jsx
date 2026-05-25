import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from './store/useAuthStore';
import { AnimatePresence } from 'framer-motion';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import PatientMedications from './pages/PatientMedications';
import PharmacyDashboard from './pages/PharmacyDashboard';
import PharmacyMedicines from './pages/PharmacyMedicines';
import DrugInteractions from './pages/DrugInteractions';
import PharmacyPrescriptions from './pages/PharmacyPrescriptions';
import PharmacyPatients from './pages/PharmacyPatients';
import HospitalDashboard from './pages/HospitalDashboard';
import HospitalUsers from './pages/HospitalUsers';
import BookAppointment from './pages/BookAppointment';
import WritePrescription from './pages/WritePrescription';
import DoctorSettings from './pages/DoctorSettings';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorPatients from './pages/DoctorPatients';
import DoctorAlerts from './pages/DoctorAlerts';
import PatientSettings from './pages/PatientSettings';
import CompleteProfilePage from './pages/CompleteProfilePage';
import DashboardLayout from './components/layout/DashboardLayout';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }
  return <DashboardLayout>{children}</DashboardLayout>;
};

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Router>
      <div className="min-h-screen bg-background-dark text-foreground-dark overflow-x-hidden">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/complete-profile" element={<CompleteProfilePage />} />

            <Route path="/doctor/dashboard" element={
              <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } />

            <Route path="/doctor/appointments" element={
              <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                <DoctorAppointments />
              </ProtectedRoute>
            } />

            <Route path="/doctor/patients" element={
              <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                <DoctorPatients />
              </ProtectedRoute>
            } />

            <Route path="/doctor/alerts" element={
              <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                <DoctorAlerts />
              </ProtectedRoute>
            } />

            <Route path="/doctor/prescribe" element={
              <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                <WritePrescription />
              </ProtectedRoute>
            } />

            <Route path="/doctor/settings" element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorSettings />
              </ProtectedRoute>
            } />

            {/* Patient Routes */}
            <Route path="/patient/dashboard" element={
              <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />

            <Route path="/patient/medications" element={
              <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
                <PatientMedications />
              </ProtectedRoute>
            } />

            <Route path="/patient/settings" element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientSettings />
              </ProtectedRoute>
            } />

            <Route path="/book-appointment" element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <BookAppointment />
              </ProtectedRoute>
            } />

            {/* Other Roles */}
            <Route path="/pharmacy/dashboard" element={
              <ProtectedRoute allowedRoles={['PHARMACIST', 'ADMIN']}>
                <PharmacyDashboard />
              </ProtectedRoute>
            } />

            <Route path="/pharmacy/medicines" element={
              <ProtectedRoute allowedRoles={['PHARMACIST', 'ADMIN']}>
                <PharmacyMedicines />
              </ProtectedRoute>
            } />

            <Route path="/pharmacy/interactions" element={
              <ProtectedRoute allowedRoles={['PHARMACIST', 'ADMIN']}>
                <DrugInteractions />
              </ProtectedRoute>
            } />

            <Route path="/pharmacy/prescriptions" element={
              <ProtectedRoute allowedRoles={['PHARMACIST', 'ADMIN']}>
                <PharmacyPrescriptions />
              </ProtectedRoute>
            } />

            <Route path="/pharmacy/patients" element={
              <ProtectedRoute allowedRoles={['PHARMACIST', 'ADMIN']}>
                <PharmacyPatients />
              </ProtectedRoute>
            } />

            <Route path="/hospital/dashboard" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <HospitalDashboard />
              </ProtectedRoute>
            } />

            <Route path="/hospital/users" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <HospitalUsers />
              </ProtectedRoute>
            } />

          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
