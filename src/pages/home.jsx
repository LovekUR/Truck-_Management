import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Shield,
  User,
  Map,
  ChevronRight
} from 'lucide-react';

function Home() {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Company Admin",
      icon: <Shield size={40} />,
      color: "#38bdf8",
      desc: "Full system control, fleet management, and security settings."
    },
    {
      title: "Fleet Manager",
      icon: <User size={40} />,
      color: "#fbbf24",
      desc: "Route optimization, driver assignments, and load tracking."
    },
    {
      title: "Truck Driver",
      icon: <Map size={40} />,
      color: "#10b981",
      desc: "Shift logs, delivery status updates, and digital route maps."
    }
  ];

  const goToLogin = (role) => {
    sessionStorage.setItem("selectedRole", role);
    navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8f5ef',
        padding: '40px 70px',
        fontFamily: 'sans-serif'
      }}
    >
      {/* NAVBAR */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '60px'
        }}
      >
        <h2 style={{ fontSize: '28px', fontWeight: '700' }}>
          TransTrack <span style={{ color: '#38bdf8' }}>Pro</span>
        </h2>

        <nav
          style={{
            display: 'flex',
            gap: '30px',
            fontSize: '15px',
            color: '#555'
          }}
        >
          <span>Home</span>
          <span>Services</span>
          <span>About</span>
          <span>Contact</span>
        </nav>

        <button
          style={{
            background: '#111',
            color: 'white',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
      </header>

      {/* HERO SECTION */}
      <section
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '80px',
          gap: '50px'
        }}
      >
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: '64px',
              fontWeight: '700',
              lineHeight: '1.1',
              marginBottom: '20px',
              color: '#111'
            }}
          >
            Smart logistics <br />
            for modern fleets
          </h1>

          <p
            style={{
              fontSize: '18px',
              color: '#666',
              maxWidth: '500px',
              lineHeight: '1.7',
              marginBottom: '30px'
            }}
          >
            Enterprise-grade truck and fleet management portal for
            admins, managers, and drivers.
          </p>

          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              style={{
                background: '#111',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Get Started
            </button>

            <button
              style={{
                background: 'transparent',
                border: '1px solid #111',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Learn More
            </button>
          </div>
        </div>

        {/* RIGHT HERO VISUAL */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              width: '100%',
              height: '350px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d"
              alt="truck"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>
      </section>

      {/* ROLE CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px'
        }}
      >
        {roles.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -8 }}
            style={{
              background: 'white',
              padding: '35px',
              borderRadius: '18px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
              borderTop: `4px solid ${item.color}`
            }}
          >
            <div style={{ color: item.color, marginBottom: '20px' }}>
              {item.icon}
            </div>

            <h2
              style={{
                fontSize: '24px',
                marginBottom: '14px'
              }}
            >
              {item.title}
            </h2>

            <p
              style={{
                color: '#666',
                marginBottom: '25px',
                lineHeight: '1.6'
              }}
            >
              {item.desc}
            </p>

            <button
              onClick={() => goToLogin(item.title)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: `1px solid ${item.color}`,
                background: 'transparent',
                color: item.color,
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Enter Portal
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Home;