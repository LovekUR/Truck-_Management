import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { auth } from '../firebaseConfig';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { Mail, Lock, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Auth() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("Driver");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const selectedRole = sessionStorage.getItem("selectedRole") || role;

  const redirectByRole = (userRole) => {
    if (userRole === "Admin") {
      navigate('/admin-portal');
    } else if (userRole === "Manager") {
      navigate('/manager-portal');
    } else {
      navigate('/driver-portal');
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        const userSnap = await getDoc(doc(db, "users", userCredential.user.uid));

        if (!userSnap.exists()) {
          alert("User role not found in database");
          return;
        }

        const userRole = userSnap.data().role;
        redirectByRole(userRole);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: email,
          role: role
        });

        redirectByRole(role);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        backgroundImage: 'radial-gradient(circle at top right, #1e293b, #0f172a)',
        fontFamily: 'sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Floating Truck 1 */}
      <motion.div
        animate={{
          x: [0, 120, 0],
          y: [0, -25, 0]
        }}
        transition={{
          repeat: Infinity,
          duration: 8,
          ease: 'easeInOut'
        }}
        style={{
          position: 'absolute',
          top: '12%',
          left: '8%',
          opacity: 0.12
        }}
      >
        <Truck size={80} color="#38bdf8" />
      </motion.div>

      {/* Floating Truck 2 */}
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 25, 0]
        }}
        transition={{
          repeat: Infinity,
          duration: 10,
          ease: 'easeInOut'
        }}
        style={{
          position: 'absolute',
          bottom: '12%',
          right: '10%',
          opacity: 0.1
        }}
      >
        <Truck size={90} color="#38bdf8" />
      </motion.div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          display: 'flex',
          width: '900px',
          height: '550px',
          backgroundColor: '#1e293b',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
          border: '1px solid #334155',
          zIndex: 2
        }}
      >
        {/* LEFT PANEL */}
        <div
          style={{
            flex: 1.2,
            backgroundImage: 'linear-gradient(135deg, #1e40af 0%, #38bdf8 100%)',
            padding: '40px',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            borderRadius: isLogin ? '0 80px 80px 0' : '80px 0 0 80px',
            order: isLogin ? 0 : 1,
            transition: 'all 0.5s ease-in-out',
            boxShadow: 'inset 0 0 40px rgba(255,255,255,0.08)'
          }}
        >
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{
              repeat: Infinity,
              duration: 3
            }}
          >
            <Truck size={70} />
          </motion.div>

          <h1 style={{ fontSize: '38px', fontWeight: '800', marginTop: '20px' }}>
            {isLogin ? "Welcome Back!" : "New Here?"}
          </h1>

          <p style={{ margin: '20px 0', opacity: 0.9 }}>
            {isLogin
              ? "Log in to monitor your fleet assets."
              : "Join our network of professional logistics."}
          </p>

          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              marginTop: '10px',
              padding: '12px 40px',
              border: '2px solid white',
              background: 'transparent',
              color: 'white',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            {isLogin ? "CREATE ACCOUNT" : "LOGIN NOW"}
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div
          style={{
            flex: 1,
            padding: '50px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <form onSubmit={handleAuth}>
            <h2 style={{ color: 'white', margin: '0 0 10px 0' }}>
              {isLogin ? "Sign In" : "Register"}
            </h2>

            <p
              style={{
                color: '#94a3b8',
                fontSize: '14px',
                marginBottom: '30px'
              }}
            >
              Portal:
              <span
                style={{
                  color: '#38bdf8',
                  fontWeight: 'bold',
                  marginLeft: '5px'
                }}
              >
                {isLogin ? selectedRole : role}
              </span>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {!isLogin && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  {['Admin', 'Manager', 'Driver'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setRole(r);
                        sessionStorage.setItem("selectedRole", r);
                      }}
                      style={{
                        flex: 1,
                        fontSize: '11px',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #334155',
                        background: role === r ? '#38bdf8' : '#0f172a',
                        color: role === r ? '#0f172a' : '#94a3b8',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ position: 'relative' }}>
                <Mail size={18} style={iconStyle} />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={18} style={iconStyle} />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                marginTop: '30px',
                width: '100%',
                padding: '15px',
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 20px rgba(56,189,248,0.25)'
              }}
            >
              {isLogin ? "ACCESS COMMAND CENTER" : "CREATE ACCOUNT"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

const iconStyle = {
  position: 'absolute',
  left: '12px',
  top: '12px',
  color: '#64748b'
};

const inputStyle = {
  width: '100%',
  padding: '12px 12px 12px 40px',
  borderRadius: '10px',
  border: '1px solid #334155',
  backgroundColor: '#0f172a',
  color: 'white',
  outline: 'none',
  boxSizing: 'border-box'
};

export default Auth;