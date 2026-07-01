import React, { useState, useEffect } from 'react';
import { 
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where, serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { 
  LayoutDashboard, PlusCircle, Users, Navigation, Wallet, AlertCircle, 
  Search, Bell, LogOut, Zap, BarChart3, MapPin, Truck, Fuel, Wrench, 
  CheckCircle, Clock, Trash2, TrendingUp, ArrowUpRight, DollarSign, ShieldAlert, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ManagerDashboard() {
  const [tab, setTab] = useState("Dashboard");

  // DATA STATES
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [issues, setIssues] = useState([]);
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("All");

  // FORM STATES
  const [loadForm, setLoadForm] = useState({ origin: "", dest: "", price: "", type: "Standard", distance: "" });
  const [newDriver, setNewDriver] = useState({ name: "", email: "", phone: "" });

  const refreshData = async () => {
    try {
      const dSnap = await getDocs(query(collection(db, "users"), where("role", "==", "Driver")));
      setDrivers(dSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const tSnap = await getDocs(query(collection(db, "trips"), orderBy("createdAt", "desc")));
      setTrips(tSnap.docs.map(t => ({ id: t.id, ...t.data() })));

      const iSnap = await getDocs(collection(db, "issues"));
      setIssues(iSnap.docs.map(i => ({ id: i.id, ...i.data() })));

      const pSnap = await getDocs(collection(db, "payments"));
      setPayments(pSnap.docs.map(p => ({ id: p.id, ...p.data() })));
    } catch (e) { console.error("Sync Error:", e); }
  };

  useEffect(() => { refreshData(); }, [tab]);

  // --- ACTIONS ---
  const handlePostLoad = async () => {
    if(!loadForm.origin || !loadForm.dest) return alert("Fill route details");
    await addDoc(collection(db, "trips"), { ...loadForm, status: "Available", progress: "0%", createdAt: serverTimestamp() });
    alert("Load Broadcasted to Fleet!");
    setLoadForm({ origin: "", dest: "", price: "", type: "Standard", distance: "" });
    setTab("Trip Monitor");
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "users"), { ...newDriver, role: "Driver", status: "Free", rating: 5.0, totalTrips: 0 });
    alert("Driver Added!");
    setNewDriver({ name: "", email: "", phone: "" });
    refreshData();
  };

  const updateItemStatus = async (col, id, newStatus) => {
    await updateDoc(doc(db, col, id), { status: newStatus });
    refreshData();
  };

  const deleteItem = async (col, id) => {
    if(window.confirm("Confirm Deletion?")) {
      await deleteDoc(doc(db, col, id));
      refreshData();
    }
  };

  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.logoSection}>
          <Zap size={24} color="#38bdf8" fill="#38bdf8" />
          <h2 style={styles.logoText}>MANAGER<span style={{color:'#38bdf8'}}>PRO</span></h2>
        </div>
        <nav style={{ flex: 1 }}>
          {[
            { n: 'Dashboard', i: <LayoutDashboard size={20}/>, c: '#38bdf8' },
            { n: 'Create Load', i: <PlusCircle size={20}/>, c: '#10b981' },
            { n: 'Driver Manager', i: <Users size={20}/>, c: '#818cf8' },
            { n: 'Trip Monitor', i: <Navigation size={20}/>, c: '#38bdf8' },
            { n: 'Payments', i: <Wallet size={20}/>, c: '#f59e0b' },
            { n: 'Issues', i: <AlertCircle size={20}/>, c: '#ef4444' }
          ].map((item) => (
            <div key={item.n} onClick={() => setTab(item.n)} style={{
                ...styles.navItem,
                color: tab === item.n ? (item.n === 'Issues' ? '#ef4444' : item.c) : '#94a3b8',
                backgroundColor: tab === item.n ? `${item.c}15` : 'transparent',
                borderLeft: tab === item.n ? `4px solid ${item.c}` : '4px solid transparent'
            }}>
              {item.i} <span style={{ marginLeft: '12px' }}>{item.n}</span>
            </div>
          ))}
        </nav>
        <div style={styles.logoutBtn} onClick={()=>window.location.href='/'}><LogOut size={20} /> Logout</div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        <header style={styles.header}>
          <h1 style={{fontSize:'28px', margin:0}}>{tab}</h1>
          <div style={styles.headerRight}>
            <div style={styles.searchBar}><Search size={18}/><input placeholder="Fleet search..." style={styles.searchInput}/></div>
            <div style={styles.iconCircle}><Bell size={20}/></div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {/* 1. DASHBOARD */}
          {tab === "Dashboard" && (
            <motion.div key="dash" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={styles.statsGrid}>
                <StatCard label="Live Trips" val={trips.length} icon={<Truck color="#38bdf8"/>} trend="Active" />
                <StatCard label="Available Drivers" val={drivers.filter(d => d.status === 'Free').length} icon={<Users color="#818cf8"/>} trend="Online" />
                <StatCard label="Pending Issues" val={issues.length} icon={<AlertCircle color="#ef4444"/>} trend="Check" />
                <StatCard label="Revenue" val="$24.8k" icon={<BarChart3 color="#10b981"/>} trend="+12%" />
              </div>
              <div style={styles.card}>
                <h3 style={{marginBottom:'20px'}}>Fleet Activity Graph</h3>
                <div style={styles.barChart}>
                  {[40, 70, 45, 90, 65, 80, 30, 95, 55, 75].map((h, i) => (
                    <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} style={styles.bar} whileHover={{background:'#38bdf8'}} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. CREATE LOAD */}
          {tab === "Create Load" && (
            <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={styles.card}>
               <h3 style={{marginBottom:'25px'}}><MapPin color="#10b981"/> Configure New Trip</h3>
               <div style={styles.formGrid}>
                  <input style={styles.input} placeholder="Pickup" value={loadForm.origin} onChange={e=>setLoadForm({...loadForm, origin: e.target.value})} />
                  <input style={styles.input} placeholder="Drop" value={loadForm.dest} onChange={e=>setLoadForm({...loadForm, dest: e.target.value})} />
                  <input style={styles.input} placeholder="Distance (KM)" value={loadForm.distance} onChange={e=>setLoadForm({...loadForm, distance: e.target.value})} />
                  <input style={styles.input} placeholder="Price ($)" type="number" value={loadForm.price} onChange={e=>setLoadForm({...loadForm, price: e.target.value})} />
                  <select style={styles.input} value={loadForm.type} onChange={e=>setLoadForm({...loadForm, type: e.target.value})}>
                     <option>Standard</option><option>Heavy</option><option>Liquid</option>
                  </select>
                  <button style={styles.primaryBtn} onClick={handlePostLoad}>Broadcast Load</button>
               </div>
            </motion.div>
          )}

          {/* 3. DRIVER MANAGER */}
          {tab === "Driver Manager" && (
            <motion.div key="drivers" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <div style={styles.card}>
                  <h3>Add Driver</h3>
                  <div style={styles.formGrid}>
                    <input style={styles.input} placeholder="Name" value={newDriver.name} onChange={e=>setNewDriver({...newDriver, name: e.target.value})} />
                    <input style={styles.input} placeholder="Email" value={newDriver.email} onChange={e=>setNewDriver({...newDriver, email: e.target.value})} />
                    <button style={styles.primaryBtn} onClick={handleAddDriver}>Register</button>
                  </div>
               </div>
               <div style={styles.driverGrid}>
                  {drivers.map(d => (
                    <motion.div whileHover={{y:-5}} key={d.id} style={styles.driverCard}>
                      <div style={styles.avatar}>{d.name?.charAt(0)}</div>
                      <h4>{d.name}</h4>
                      <span style={{fontSize:'12px', color: d.status === 'Free' ? '#10b981' : '#ef4444'}}>{d.status}</span>
                      <button onClick={()=>deleteItem('users', d.id)} style={styles.deleteIcon}><Trash2 size={16}/></button>
                    </motion.div>
                  ))}
               </div>
            </motion.div>
          )}

          {/* 4. TRIP MONITOR */}
          {tab === "Trip Monitor" && (
             <div style={styles.tableCard}>
                <table style={styles.table}>
                   <thead><tr style={styles.thRow}><th>Trip Details</th><th>Live Progress</th><th>Status</th><th>Action</th></tr></thead>
                   <tbody>
                      {trips.map(t => (
                        <tr key={t.id} style={styles.tr}>
                           <td style={styles.td}>{t.origin} → {t.dest}</td>
                           <td style={styles.td}><div style={styles.pTrack}><div style={{...styles.pBar, width: t.progress || '30%'}}></div></div></td>
                           <td style={styles.td}><span style={styles.statusPill}>{t.status}</span></td>
                           <td style={styles.td}><Trash2 size={18} color="#ef4444" style={{cursor:'pointer'}} onClick={()=>deleteItem('trips', t.id)}/></td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          )}

          {/* 5. PAYMENTS (ADVANCED INTERACTIVE) */}
          {tab === "Payments" && (
            <motion.div key="pay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.paymentWrapper}>
              <div style={styles.statsGrid}>
                <PaymentStat label="Total Revenue" val="$14.2k" icon={<TrendingUp color="#10b981"/>} color="#10b981" />
                <PaymentStat label="Pending Payouts" val="$3.4k" icon={<Clock color="#f59e0b"/>} color="#f59e0b" />
                <PaymentStat label="Completed" val="$8.8k" icon={<CheckCircle color="#38bdf8"/>} color="#38bdf8" />
              </div>
              <div style={styles.payList}>
                {payments.map(p => (
                  <div key={p.id} style={styles.payItem}>
                    <div style={styles.payLeft}>
                      <div style={{...styles.statusDot, background: p.status === 'Done' ? '#10b981' : '#f59e0b'}}></div>
                      <div><strong>{p.driverName}</strong><br/><small style={{color:'#64748b'}}>ID: {p.id.slice(0,5)}</small></div>
                    </div>
                    <div style={{fontSize:'20px', fontWeight:'800'}}>${p.amount}</div>
                    <div style={{display:'flex', gap:'15px'}}>
                      {p.status !== 'Done' && <button onClick={()=>updateItemStatus('payments', p.id, 'Done')} style={styles.approveBtn}>Approve</button>}
                      <Trash2 size={20} color="#ef4444" style={{cursor:'pointer'}} onClick={()=>deleteItem('payments', p.id)}/>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

         
            {tab === "Issues" && (
              <motion.div
                key="issues"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={styles.issueGrid}
              >
                {issues.length === 0 ? (
                  <div style={{ ...styles.card, gridColumn: "1 / -1", textAlign: "center", color: "#94a3b8" }}>
                    <AlertCircle size={28} color="#ef4444" />
                    <h3 style={{ marginTop: "10px" }}>No Driver Issues Reported</h3>
                    <p>Drivers haven’t reported any fuel, engine, or breakdown issues yet.</p>
                  </div>
                ) : (
                  issues.map((iss) => (
                    <div
                      key={iss.id}
                      style={{ ...styles.card, borderLeft: "4px solid #ef4444" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          {iss.type === "Fuel" && <Fuel color="#ef4444" />}
                          {iss.type === "Engine" && <Wrench color="#ef4444" />}
                          {!iss.type && <AlertCircle color="#ef4444" />}

                          <h4 style={{ margin: 0 }}>
                            {iss.driverName || "Unknown Driver"} - {iss.type || "General Issue"}
                          </h4>
                        </div>

                        <span style={{ fontSize: "12px", color: "#f59e0b" }}>
                          {iss.status || "Pending"}
                        </span>
                      </div>

                      <p style={{ color: "#94a3b8", fontSize: "14px", margin: "15px 0" }}>
                        {iss.description}
                      </p>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          style={styles.primaryBtn}
                          onClick={() => updateItemStatus("issues", iss.id, "Resolved")}
                        >
                          Mark Resolved
                        </button>

                        <button
                          style={styles.secondaryBtn}
                          onClick={() => alert(`Contacting ${iss.driverName}`)}
                        >
                          Contact Driver
                        </button>

                        <Trash2
                          size={18}
                          color="#ef4444"
                          style={{ cursor: "pointer" }}
                          onClick={() => deleteItem("issues", iss.id)}
                        />
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// SHARED COMPONENTS
const StatCard = ({ label, val, icon, trend }) => (
  <div style={styles.statCard}>
    <div style={{display:'flex', justifyContent:'space-between'}}><div style={styles.iconBox}>{icon}</div><span style={{fontSize:'12px', color:'#10b981'}}>{trend}</span></div>
    <div style={{fontSize:'28px', fontWeight:'800', marginTop:'15px'}}>{val}</div>
    <div style={{color:'#94a3b8', fontSize:'13px'}}>{label}</div>
  </div>
);

const PaymentStat = ({ label, val, icon, color }) => (
  <div style={{...styles.statCard, borderLeft: `4px solid ${color}`}}>
    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}><div style={styles.iconBox}>{icon}</div><ArrowUpRight size={16} color="#64748b"/></div>
    <div style={{fontSize:'24px', fontWeight:'800'}}>{val}</div>
    <div style={{color:'#94a3b8', fontSize:'13px'}}>{label}</div>
  </div>
);

// STYLES
const styles = {
  layout: { display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#0f172a', color: 'white', overflow: 'hidden' },
  sidebar: { width: '260px', minWidth: '260px', backgroundColor: '#1e293b', padding: '30px 0', display: 'flex', flexDirection: 'column', borderRight: '1px solid #334155' },
  logoSection: { padding: '0 30px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' },
  logoText: { fontSize: '18px', fontWeight: '800' },
  navItem: { display: 'flex', alignItems: 'center', padding: '16px 30px', cursor: 'pointer', transition: '0.3s', fontSize: '14px' },
  main: { flex: 1, padding: '40px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '40px' },
  headerRight: { display: 'flex', gap: '20px' },
  searchBar: { display: 'flex', alignItems: 'center', background: '#1e293b', padding: '8px 15px', borderRadius: '12px', width: '250px' },
  searchInput: { background: 'transparent', border: 'none', color: 'white', marginLeft: '10px', outline: 'none' },
  iconCircle: { background: '#1e293b', padding: '10px', borderRadius: '50%' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' },
  statCard: { background: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' },
  iconBox: { background: '#0f172a', padding: '8px', borderRadius: '10px' },
  card: { background: '#1e293b', padding: '25px', borderRadius: '24px', border: '1px solid #334155', marginBottom: '20px' },
  barChart: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', gap: '8px' },
  bar: { flex: 1, background: 'rgba(56, 189, 248, 0.2)', borderRadius: '4px 4px 0 0' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', width:'100%' },
  input: { background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '12px', borderRadius: '10px', outline: 'none', width:'100%', boxSizing:'border-box' },
  primaryBtn: { background: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  secondaryBtn: { background: '#334155', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer' },
  driverGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px', marginTop: '20px' },
  driverCard: { background: '#1e293b', padding: '20px', borderRadius: '20px', textAlign: 'center', position: 'relative', border: '1px solid #334155' },
  avatar: { width: '50px', height: '50px', background: '#38bdf8', borderRadius: '50%', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  deleteIcon: { position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' },
  tableCard: { background: '#1e293b', borderRadius: '24px', border: '1px solid #334155', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { background: 'rgba(255,255,255,0.02)', textAlign: 'left' },
  td: { padding: '20px', fontSize: '14px' },
  tr: { borderBottom: '1px solid #334155' },
  pTrack: { width: '100px', height: '6px', background: '#0f172a', borderRadius: '10px' },
  pBar: { height: '100%', background: '#38bdf8', borderRadius: '10px' },
  statusPill: { padding: '4px 12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '20px', fontSize: '12px' },
  paymentWrapper: { display: 'flex', flexDirection: 'column', gap: '20px' },
  payList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  payItem: { background: '#1e293b', padding: '20px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #334155' },
  payLeft: { display: 'flex', alignItems: 'center', gap: '15px' },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%' },
  approveBtn: { background: '#10b981', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  issueGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  logoutBtn: { padding: '20px 30px', color: '#ef4444', display: 'flex', alignItems: 'center', cursor: 'pointer', borderTop: '1px solid #334155', marginTop: 'auto' }
};
