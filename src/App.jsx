import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/Login';
import ProtectedRoute from './routes/ProtectedRoute';

import Dashboard from './Dashboard/Dashboard';
import DriverDashboard from './Dashboard/DriverDashboard';
import ManagerDashboard from './Dashboard/ManagerDashboard';
import AdminDashboard from './Dashboard/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/driver-portal" element={<DriverDashboard />} />
        <Route path="/manager-portal" element={<ManagerDashboard />} />
        <Route path="/admin-portal" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;