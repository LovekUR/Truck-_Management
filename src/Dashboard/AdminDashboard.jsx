import React, { useState, useEffect } from 'react';
import {
  collection, addDoc, getDocs, doc, getDoc, setDoc, deleteDoc
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { 
  LayoutDashboard, UserPlus, Database, ShieldAlert, LogOut, Search, Bell, 
  Zap, BarChart3, Users, DollarSign, Activity, Plus, Trash2, ShieldCheck, 
  Lock, Download, TrendingUp, ArrowUpRight, RefreshCw, UserMinus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// --- DATA FOR REAL-TIME GRAPH ---
const chartData = [
  { name: 'Mon', revenue: 4000, load: 2400 },
  { name: 'Tue', revenue: 3000, load: 1398 },
  { name: 'Wed', revenue: 5000, load: 9800 },
  { name: 'Thu', revenue: 2780, load: 3908 },
  { name: 'Fri', revenue: 1890, load: 4800 },
  { name: 'Sat', revenue: 2390, load: 3800 },
  { name: 'Sun', revenue: 3490, load: 4300 },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("System Stats");

  // STATES
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [securityLogs, setSecurityLogs] = useState([]);
  const [threatCount, setThreatCount] = useState(0);
  const [failedLogins, setFailedLogins] = useState(0);
  const [baseFare, setBaseFare] = useState("");
  const [perKmRate, setPerKmRate] = useState("");
  const [emergencyFee, setEmergencyFee] = useState("");
  const [surgeMultiplier, setSurgeMultiplier] = useState("");
  const [managers, setManagers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // FETCHING LOGIC
  const fetchManagers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const managerList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === "Manager") managerList.push({ id: doc.id, ...data });
      });
      setManagers(managerList);
    } catch (error) { console.log(error); }
  };

  const fetchPricingRules = async () => {
    try {
      const pricingSnap = await getDoc(doc(db, "pricingRules", "mainPricing"));
      if (pricingSnap.exists()) {
        const data = pricingSnap.data();
        setBaseFare(data.baseFare || "");
        setPerKmRate(data.perKmRate || "");
        setEmergencyFee(data.emergencyFee || "");
        setSurgeMultiplier(data.surgeMultiplier || "");
      }
    } catch (error) { console.log(error); }
  };

  const fetchSecurityLogs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "securityLogs"));
      const logs = [];
      let threats = 0; let failed = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({ id: doc.id, ...data });
        if (data.status === "Blocked") threats++;
        if (data.action === "Failed Login") failed++;
      });
      setSecurityLogs(logs.reverse().slice(0, 6));
      setThreatCount(threats);
      setFailedLogins(failed);
    } catch (error) { console.log(error); }
  };

  useEffect(() => {
    fetchManagers();
    fetchPricingRules();
    fetchSecurityLogs();
  }, []);

  // ACTIONS
  const handleAddManager = async () => {
    if(!managerName || !managerEmail) return alert("Please fill details");
    try {
      await addDoc(collection(db, "users"), {
        name: managerName, email: managerEmail, phone: managerPhone,
        role: "Manager", status: "active", createdAt: new Date()
      });
      setManagerName(""); setManagerEmail(""); setManagerPhone("");
      fetchManagers();
    } catch (error) { alert("Error saving data"); }
  };
  const handleDeleteManager = async (id) => {
  try {
    await deleteDoc(doc(db, "users", id));
    fetchManagers();
    alert("Manager deleted successfully");
  } catch (error) {
    console.log(error);
    alert("Delete failed");
  }
};

  const handleSavePricing = async () => {
    try {
      await setDoc(doc(db, "pricingRules", "mainPricing"), {
        baseFare: Number(baseFare), perKmRate: Number(perKmRate),
        emergencyFee: Number(emergencyFee), surgeMultiplier: Number(surgeMultiplier),
        updatedAt: new Date()
      });
      alert("Pricing Rules Synchronized");
    } catch (error) { alert("Sync Failed"); }
  };

  const exportManagerPDF = () => {
    const doc = new jsPDF();
    doc.text("TransTrack Pro - Manager Registry", 20, 10);
    const tableRows = managers.map(m => [m.name, m.email, m.phone || 'N/A', m.status]);
    doc.autoTable({ head: [['Name', 'Email', 'Phone', 'Status']], body: tableRows });
    doc.save('managers_report.pdf');
  };

const handleSearch = (value) => {
  setSearchQuery(value);

  const query = value.toLowerCase();

  // switch tab based on search
  if (
    query.includes("manager") ||
    query.includes("user") ||
    managers.some((m) =>
      m.name?.toLowerCase().includes(query)
    )
  ) {
    setTab("Manage Users");
  } 
  else if (
    query.includes("price") ||
    query.includes("fare")
  ) {
    setTab("Pricing Rules");
  } 
  else if (
    query.includes("security") ||
    query.includes("threat")
  ) {
    setTab("Security");
  } 
  else {
    setTab("System Stats");
  }
};

// filtered manager list
const filteredManagers = managers.filter((m) =>
  m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  m.phone?.toLowerCase().includes(searchQuery.toLowerCase())
);

  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} style={styles.sidebar}>
        <div style={styles.logoSection}>
          <Zap size={24} color="#38bdf8" fill="#38bdf8" />
          <h2 style={{ fontSize: '20px', fontWeight: '800' }}>ADMIN<span style={{color:'#38bdf8'}}>PRO</span></h2>
        </div>

        <nav style={{ flex: 1 }}>
          {[
            { n: 'System Stats', i: <LayoutDashboard size={20}/>, c: '#10b981' },
            { n: 'Manage Users', i: <UserPlus size={20}/>, c: '#38bdf8' },
            { n: 'Pricing Rules', i: <Database size={20}/>, c: '#f59e0b' },
            { n: 'Security', i: <ShieldAlert size={20}/>, c: '#ef4444' }
          ].map((item) => (
            <motion.div
              key={item.n}
              whileHover={{ x: 8, backgroundColor: 'rgba(255,255,255,0.05)' }}
              onClick={() => setTab(item.n)}
              style={{
                ...styles.navItem,
                color: tab === item.n ? item.c : '#94a3b8',
                borderLeft: tab === item.n ? `4px solid ${item.c}` : '4px solid transparent',
                background: tab === item.n ? `${item.c}10` : 'transparent'
              }}
            >
              {item.i} <span style={{ marginLeft: '12px' }}>{item.n}</span>
            </motion.div>
          ))}
        </nav>

        <div style={styles.logoutBtn} onClick={() => window.location.href = '/'}>
          <LogOut size={20} /> <span style={{marginLeft:'10px'}}>Logout</span>
        </div>
      </motion.aside>
      

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={{fontSize:'28px', margin:0}}>{tab}</h1>
            <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'5px'}}>
              <div style={{width:'8px', height:'8px', background:'#10b981', borderRadius:'50%'}}></div>
              <span style={{fontSize:'12px', color:'#94a3b8'}}>System Core Active</span>
            </div>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.searchBar}>
              <Search size={18} color="#64748b" />
               <input
                type="text"
                placeholder="Search dashboard..."
                style={styles.searchInput}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div style={styles.iconCircle}><Bell size={20}/></div>
          </div>
        </header>

        <AnimatePresence mode="wait">
        

  {/* TAB 1: SYSTEM STATS */}
  {tab === "System Stats" && (
    <motion.div
      key="stats"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
     
      
      {/* STATS */}
      <div style={styles.statsGrid}>
        <StatCard
          label="Total Managers"
          val={managers.length}
          icon={<Users color="#38bdf8" />}
          trend="+2 new"
        />
        <StatCard
          label="Security Threats"
          val={threatCount}
          icon={<ShieldAlert color="#ef4444" />}
          trend="Critical"
        />
        <StatCard
          label="Failed Logins"
          val={failedLogins}
          icon={<Lock color="#f59e0b" />}
          trend="Warning"
        />
        <StatCard
          label="Base Fare"
          val={`$${baseFare}`}
          icon={<DollarSign color="#10b981" />}
          trend="Active"
        />
      </div>

      {/* CHART */}
      <div style={styles.card}>
        <h3>Revenue & System Load Analytics</h3>

        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#38bdf8"
                fill="#38bdf8"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )}

  {/* TAB 2: MANAGE USERS */}
  {tab === "Manage Users" && (
  <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

    {/* TOP BANNER */}
    <div
      style={{
        ...styles.card,
        marginBottom: '25px',
      
        backgroundImage:
          "linear-gradient(rgba(15,23,42,0.75), rgba(15,23,42,0.75)), url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '220px'
      }}
    >
      <h2>User Management Center</h2>
      <p>Manage all fleet managers and access roles.</p>
    </div>

    {/* ADD MANAGER FORM */}
    <div style={styles.card}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      >
        <h3>Register Management Personnel</h3>

        <button
          onClick={exportManagerPDF}
          style={styles.secondaryBtn}
        >
          <Download size={16} />
          Export List
        </button>
      </div>

      <div style={styles.formGrid}>
        <input
          style={styles.input}
          placeholder="Full Name"
          value={managerName}
          onChange={(e) => setManagerName(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Email Address"
          value={managerEmail}
          onChange={(e) => setManagerEmail(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Phone"
          value={managerPhone}
          onChange={(e) => setManagerPhone(e.target.value)}
        />

        <button
          style={styles.primaryBtn}
          onClick={handleAddManager}
        >
          <Plus size={18} />
          Add Manager
        </button>
      </div>
    </div>

    {/* MANAGER LIST TABLE */}
    <div
      style={{
        ...styles.card,
        marginTop: '25px',
        padding: 0,
        overflow: 'hidden'
      }}
    >
      <table style={styles.table}>
        <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
          <tr>
            <th style={styles.th}>Manager</th>
            <th style={styles.th}>Contact</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredManagers.map((m) => (
            <tr
              key={m.id}
              style={{ borderBottom: '1px solid #334155' }}
            >
              <td style={styles.td}>
                <div style={{ fontWeight: '600' }}>
                  {m.name}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#64748b'
                  }}
                >
                  Manager ID: {m.id.slice(0, 5)}
                </div>
              </td>

              <td style={styles.td}>
                {m.email}
                <br />
                <span
                  style={{
                    fontSize: '12px',
                    color: '#94a3b8'
                  }}
                >
                  {m.phone}
                </span>
              </td>

              <td style={styles.td}>
                <span style={styles.badge}>
                  {m.status}
                </span>
              </td>

              <td style={styles.td}>
                <Trash2
              size={18}
              color="#ef4444"
              style={{ cursor: 'pointer' }}
              onClick={() => handleDeleteManager(m.id)}
            />
                          </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </motion.div>
)}
  {/* TAB 3: PRICING RULES */}
  {tab === "Pricing Rules" && (
    <motion.div key="pricing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      <div
        style={{
          ...styles.card,
          marginBottom: '25px',
          marginTop: '25px',
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.75), rgba(15,23,42,0.75)), url('https://images.unsplash.com/photo-1554224155-6726b3ff858f')",
          backgroundSize: 'cover',
          minHeight: '220px'
        }}
      >
        <h2>Pricing Intelligence</h2>
        <p>Fare optimization and global transport cost rules.</p>
      </div>

      <div style={{ ...styles.card, maxWidth: '100%' }}>
        <h3>Global Fare Configuration</h3>

        <ConfigInput label="Base Fare ($)" val={baseFare} set={setBaseFare} />
        <ConfigInput label="Rate Per KM ($)" val={perKmRate} set={setPerKmRate} />
        <ConfigInput label="Emergency Fee ($)" val={emergencyFee} set={setEmergencyFee} />
        <ConfigInput label="Surge Multiplier" val={surgeMultiplier} set={setSurgeMultiplier} />

        <button
          style={{ ...styles.primaryBtn, marginTop: '20px' }}
          onClick={handleSavePricing}
        >
          Save Pricing
        </button>
      </div>
    </motion.div>
  )}

  {/* TAB 4: SECURITY */}
  {tab === "Security" && (
    <motion.div key="security" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      <div
        style={{
          ...styles.card,
          marginBottom: '25px',
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.75), rgba(15,23,42,0.75)), url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3')",
          backgroundSize: 'cover',
          minHeight: '220px'
        }}
      >
        <h2>Security Control Center</h2>
        <p>Threat intelligence and system protection.</p>
      </div>

      <div style={styles.card}>
        <h3>Live Threat Logs</h3>

        {securityLogs.map(log => (
          <div key={log.id} style={styles.logRow}>
            <div>{log.action}</div>
            <span>{log.status}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )}

</AnimatePresence>
        {/* HERO SHOWCASE SECTION */}
<motion.div
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7 }}
  style={{
    marginTop: '35px',
    marginBottom: '35px',
    borderRadius: '28px',
    overflow: 'hidden',
    position: 'relative',
    minHeight: '320px',
    backgroundImage:
      "linear-gradient(rgba(15,23,42,0.65), rgba(15,23,42,0.65)), url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '50px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.25)'
  }}
>
  <div style={{ maxWidth: '520px' }}>
    <p
      style={{
        color: '#facc15',
        fontSize: '14px',
        fontWeight: '700',
        letterSpacing: '1px',
        marginBottom: '10px'
      }}
    >
      SMART TRANSPORT OPERATIONS
    </p>

    <h1
      style={{
        fontSize: '46px',
        fontWeight: '800',
        lineHeight: '1.2',
        marginBottom: '18px'
      }}
    >
      Fleet Command
      <br />
      Dashboard Hub
    </h1>

    <p
      style={{
        color: '#e2e8f0',
        fontSize: '16px',
        lineHeight: '1.8',
        marginBottom: '24px'
      }}
    >
      Complete logistics monitoring, real-time analytics, and manager
      performance insights in one place.
    </p>

    <button
      style={{
        background: '#59a1a3fb',
        color: '#0f172a',
        border: 'none',
        padding: '14px 24px',
        borderRadius: '12px',
        fontWeight: 'bold',
        cursor: 'pointer'
      }}
    >
      View Operations
    </button>
  </div>

  <div
    style={{
      width: '350px',
      borderRadius: '20px',
      background: 'rgba(255,255,255,0.12)',
      backdropFilter: 'blur(12px)',
      padding: '25px'
    }}
  >
    <h3 style={{ marginBottom: '20px' }}>Manager Insights</h3>

    <div style={{ marginBottom: '16px' }}>
      <p>Delivery Efficiency</p>
      <div
        style={{
          height: '8px',
          background: '#1e293b',
          borderRadius: '20px'
        }}
      >
        <div
          style={{
            width: '91%',
            height: '100%',
            background: '#1a1950',
            borderRadius: '20px'
          }}
        />
      </div>
    </div>

    <div style={{ marginBottom: '16px' }}>
      <p>Fleet Utilization</p>
      <div
        style={{
          height: '8px',
          background: '#1e293b',
          borderRadius: '20px'
        }}
      >
        <div
          style={{
            width: '84%',
            height: '100%',
            background: '#1b2d4b',
            borderRadius: '20px'
          }}
        />
      </div>
    </div>

    <div>
      <p>Security Status</p>
      <div
        style={{
          height: '8px',
          background: '#1e293b',
          borderRadius: '20px'
        }}
      >
        <div
          style={{
            width: '96%',
            height: '100%',
            background: '#1f1b3a86',
            borderRadius: '20px'
          }}
        />
      </div>
    </div>
  </div>
</motion.div>

{/* MANAGER REVIEWS SECTION */}
<div
  style={{
    marginBottom: '35px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px'
  }}
>
  {[
    {
      name: 'Rahul Sharma',
      role: 'Senior Fleet Manager',
      review: 'System analytics improved route efficiency by 30%.'
    },
    {
      name: 'Priya Mehta',
      role: 'Operations Lead',
      review: 'Best transport management dashboard we have used.'
    },
    {
      name: 'Arjun Verma',
      role: 'Security Head',
      review: 'Threat logs and manager access control are excellent.'
    }
  ].map((item, index) => (
    <div
      key={index}
      style={{
        background: 'rgba(30,41,59,0.72)',
        padding: '24px',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.06)'
      }}
    >
      <img
        src={`https://i.pravatar.cc/100?img=${index + 10}`}
        alt="manager"
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          marginBottom: '14px'
        }}
      />

      <h4>{item.name}</h4>
      <p style={{ color: '#94a3b8', fontSize: '13px' }}>
        {item.role}
      </p>
      <p style={{ marginTop: '12px', lineHeight: '1.6' }}>
        "{item.review}"
      </p>
    </div>
  ))}
</div>

{/* FOOTER */}
<div
  style={{
    marginBottom: '30px',
    padding: '20px',
    borderRadius: '18px',
    background: 'rgba(30,41,59,0.65)',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px'
  }}
>
  © 2026 TransTrack Pro | Logistics Intelligence Platform
</div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---
const StatCard = ({ label, val, icon, trend }) => (
  <motion.div whileHover={{ y: -5 }} style={styles.statCard}>
    <div style={{display:'flex', justifyContent:'space-between'}}>
      <div style={styles.iconBox}>{icon}</div>
      <span style={{fontSize:'12px', color:'#10b981', fontWeight:'bold'}}>{trend}</span>
    </div>
    <div style={{fontSize:'28px', fontWeight:'800', marginTop:'15px'}}>{val}</div>
    <div style={{color:'#94a3b8', fontSize:'13px'}}>{label}</div>
  </motion.div>
);

const ConfigInput = ({ label, val, set }) => (
  <div style={{marginBottom:'15px'}}>
    <label style={{display:'block', color:'#94a3b8', fontSize:'12px', marginBottom:'5px'}}>{label}</label>
    <input type="number" style={styles.input} value={val} onChange={e=>set(e.target.value)} />
  </div>
);

// --- STYLES OBJECT ---
const styles = {
  layout: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    background:
      'radial-gradient(circle at top right, rgba(56,189,248,0.08), transparent 30%), radial-gradient(circle at bottom left, rgba(16,185,129,0.06), transparent 35%), #0f172a',
    color: 'white',
    overflow: 'hidden',
    position: 'relative'
  },

  sidebar: {
    width: '270px',
    minWidth: '270px',
    backdropFilter: 'blur(18px)',
    background: 'rgba(30, 41, 59, 0.75)',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    padding: '30px 0',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 0 40px rgba(0,0,0,0.25)'
  },

  logoSection: {
    padding: '0 30px',
    marginBottom: '45px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '1px'
  },

  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '18px 30px',
    cursor: 'pointer',
    transition: 'all 0.35s ease',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '0 14px 14px 0',
    marginRight: '12px'
  },

  main: {
    flex: 1,
    padding: '40px',
    overflowY: 'auto',
    position: 'relative'
  },

  header: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '40px',
    alignItems: 'center',
    padding: '20px',
    borderRadius: '20px',
    backdropFilter: 'blur(16px)',
    background: 'rgba(30, 41, 59, 0.65)',
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.18)'
  },

  headerRight: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },

  searchBar: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(15,23,42,0.85)',
    padding: '12px 16px',
    borderRadius: '14px',
    width: '300px',
    border: '1px solid rgba(255,255,255,0.05)'
  },

  searchInput: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    marginLeft: '10px',
    outline: 'none',
    width: '100%',
    fontSize: '14px'
  },

  iconCircle: {
    background: 'rgba(30,41,59,0.8)',
    padding: '12px',
    borderRadius: '50%',
    boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '22px',
    marginBottom: '30px'
  },

  statCard: {
    backdropFilter: 'blur(14px)',
    background: 'rgba(30,41,59,0.75)',
    padding: '24px',
    borderRadius: '22px',
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 12px 30px rgba(0,0,0,0.22)',
    transition: 'all 0.35s ease'
  },

  iconBox: {
    background: 'rgba(15,23,42,0.9)',
    padding: '10px',
    borderRadius: '12px'
  },

  card: {
    backdropFilter: 'blur(18px)',
    background: 'rgba(30,41,59,0.72)',
    padding: '28px',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
    transition: 'all 0.35s ease'
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr auto',
    gap: '16px'
  },

  input: {
    background: 'rgba(15,23,42,0.9)',
    border: '1px solid rgba(255,255,255,0.06)',
    color: 'white',
    padding: '14px',
    borderRadius: '12px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '14px'
  },

  primaryBtn: {
    background: '#38bdf8',
    color: '#0f172a',
    border: 'none',
    padding: '13px 20px',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 8px 20px rgba(56,189,248,0.25)'
  },

  secondaryBtn: {
    background: 'rgba(51,65,85,0.85)',
    color: 'white',
    border: 'none',
    padding: '11px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },

  th: {
    textAlign: 'left',
    padding: '16px',
    color: '#94a3b8',
    fontSize: '13px'
  },

  td: {
    padding: '16px',
    fontSize: '14px'
  },

  badge: {
    padding: '5px 12px',
    background: 'rgba(16,185,129,0.15)',
    color: '#10b981',
    borderRadius: '14px',
    fontSize: '11px',
    fontWeight: 'bold'
  },

  logRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    alignItems: 'center'
  },

  logoutBtn: {
    padding: '22px 30px',
    color: '#ef4444',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    marginTop: 'auto',
    fontWeight: '600'
  }
};