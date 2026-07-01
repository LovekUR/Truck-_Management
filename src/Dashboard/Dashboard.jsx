import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import DriverDashboard from './DriverDashboard';

function Dashboard() {
  const [role, setRole] = useState(null);
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    const savedRole = sessionStorage.getItem("userRole");
    // Identifying the portal and preparing the UI
    const timer = setTimeout(() => {
      setRole(savedRole);
      setIsSyncing(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isSyncing) {
    return (
      <div style={gateStyles.fixedFullScreen}>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        >
          <Loader2 size={50} color="#38bdf8" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={gateStyles.loaderText}
        >
          INITIALIZING SECURE PORTAL...
        </motion.h2>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={role}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        // FORCED EDGE-TO-EDGE WRAPPER
        style={gateStyles.fixedFullScreen}
      >
        {role === "Admin" && <AdminDashboard />}
        {role === "Manager" && <ManagerDashboard />}
        {(role !== "Admin" && role !== "Manager") && <DriverDashboard />}
      </motion.div>
    </AnimatePresence>
  );
}

const gateStyles = {
  fixedFullScreen: {
    position: 'fixed',    // Ignores parent containers/padding
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0f172a',
    display: 'flex',       // Allows sidebars to align properly
    margin: 0,
    padding: 0,
    overflow: 'hidden',
    zIndex: 9999          // Sits above everything else
  },
  loaderText: {
    color: '#38bdf8',
    marginTop: '25px',
    fontSize: '11px',
    letterSpacing: '4px',
    fontWeight: '900',
    textAlign: 'center'
  }
};

export default Dashboard;
