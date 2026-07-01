import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Briefcase, Navigation, Wallet, UserCircle, 
  Headset, LogOut, TrendingUp, Clock, MapPin, DollarSign,
  CheckCircle, XCircle, Star, Award, Activity, Search, Bell, Send, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

export default function DriverDashboard() {
  const [tab, setTab] = useState("My Work");
  const [jobs, setJobs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [msg, setMsg] = useState("");

  // FETCH DATA
  const fetchData = async () => {
    try {
      const jobSnap = await getDocs(collection(db, "loads"));
      setJobs(jobSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(j => j.status === "Available"));
      
      const ticketSnap = await getDocs(collection(db, "issues"));
      setTickets(ticketSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, [tab]);

  // CRUD OPERATIONS
  const handleAcceptJob = async (jobId) => {
    try {
      await updateDoc(doc(db, "loads", jobId), { status: "En Route", driverId: "Current_Driver_ID" });
      alert("Job Accepted! Drive Safe.");
      fetchData();
    } catch (e) { alert("Error accepting job"); }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if(!msg) return;
    try {
      await addDoc(collection(db, "issues"), {
        type: "Driver Report",
        description: msg,
        status: "Pending",
        driverName: "John Doe",
        createdAt: serverTimestamp()
      });
      setMsg("");
      alert("Support ticket sent to Manager.");
      fetchData();
    } catch (e) { console.error(e); }
  };

  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} style={styles.sidebar}>
        <div style={styles.logoSection}>
          <h2 style={styles.logoText}>DRIVER<span style={{color:'#38bdf8'}}>PRO</span></h2>
          <div style={styles.statusIndicator}><div style={styles.statusDot}></div><span style={styles.statusText}>Online</span></div>
        </div>

        <nav style={{ flex: 1 }}>
          {[
            { n: "My Work", i: <LayoutDashboard size={20} />, c: '#38bdf8' },
            { n: "New Jobs", i: <Briefcase size={20} />, c: '#10b981' },
            { n: "Earnings", i: <Wallet size={20} />, c: '#f59e0b' },
            { n: "Support", i: <Headset size={20} />, c: '#8b5cf6' }
          ].map((item) => (
            <div key={item.n} onClick={() => setTab(item.n)} style={{
              ...styles.navItem,
              color: tab === item.n ? item.c : '#94a3b8',
              background: tab === item.n ? `${item.c}15` : 'transparent',
              borderLeft: tab === item.n ? `4px solid ${item.c}` : '4px solid transparent'
            }}>
              {item.i} <span style={{ marginLeft: '12px' }}>{item.n}</span>
            </div>
          ))}
        </nav>

        <div style={styles.logoutBtn} onClick={() => window.location.href='/'}><LogOut size={20} /> Logout</div>
      </motion.aside>

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        <header style={styles.header}>
          <h1 style={{fontSize:'28px', margin:0}}>{tab}</h1>
          <div style={styles.headerRight}><div style={styles.searchBar}><Search size={18}/><input placeholder="Search..." style={styles.searchInput}/></div><Bell size={20} color="#94a3b8"/></div>
        </header>

        <AnimatePresence mode="wait">
          {/* TAB 1: MY WORK */}
          {tab === "My Work" && (
            <motion.div key="work" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={styles.statsGrid}>
                <div style={styles.earningsCard}>
                  <DollarSign size={32} color="#10b981" />
                  <h1 style={{fontSize:'42px', margin:'10px 0'}}>$450.00</h1>
                  <p style={{color:'#94a3b8'}}>Today's Revenue</p>
                </div>
                <div style={styles.statBox}><Star color="#f59e0b"/> <h3>4.9</h3><p>Rating</p></div>
                <div style={styles.statBox}><Clock color="#38bdf8"/> <h3>6.5h</h3><p>Driven</p></div>
              </div>

              <div style={styles.nextTripCard}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                   <h3>Next Trip: Starts in 2h</h3>
                   <span style={styles.badge}>DOWNTOWN PICKUP</span>
                </div>
                <div style={styles.pTrack}><motion.div initial={{width:0}} animate={{width:'60%'}} style={styles.pBar}/></div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: NEW JOBS (CRUD) */}
         
            {tab === "New Jobs" && (
              <motion.div 
                key="jobs" 
                initial={{ opacity: 0, x: 50 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -50 }} 
                style={styles.tabContent}
              >
                <div style={styles.sectionHeader}>
                  <h3 style={{margin: 0}}>Available Freight ({jobs.length})</h3>
                  <p style={{color: '#94a3b8', fontSize: '14px'}}>Accept a load to start earning.</p>
                </div>

                <div style={styles.jobList}>
                  {jobs.length > 0 ? jobs.map((job, idx) => (
                    <motion.div 
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -5, borderColor: '#10b981' }}
                      style={styles.jobCard}
                    >
                      <div style={styles.jobHeader}>
                        <div style={styles.jobIcon}><Truck size={20} /></div>
                        <div style={styles.jobPrice}>${job.price || '0.00'}</div>
                      </div>

                      <div style={styles.routeContainer}>
                        <div style={styles.routePoint}>
                          <div style={{...styles.pointDot, background: '#10b981'}}></div>
                          <span>{job.origin || 'Pickup City'}</span>
                        </div>
                        <div style={styles.routeLine}></div>
                        <div style={styles.routePoint}>
                          <div style={{...styles.pointDot, background: '#ef4444'}}></div>
                          <span>{job.dest || 'Drop-off City'}</span>
                        </div>
                      </div>

                      <div style={styles.jobMeta}>
                        <div style={styles.metaItem}><Navigation size={14}/> {job.distance || '0'} KM</div>
                        <div style={styles.metaItem}><Package size={14}/> {job.type || 'Standard'}</div>
                      </div>

                      <div style={styles.jobActions}>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          style={styles.applyBtn}
                          onClick={() => handleAcceptJob(job.id)}
                        >
                          Apply for this Job
                        </motion.button>
                        <button style={styles.detailsBtn}>View Map</button>
                      </div>
                    </motion.div>
                  )) : (
                    <div style={styles.emptyState}>
                      <Briefcase size={48} color="#334155" />
                      <h4>No Jobs Available</h4>
                      <p>Check back later for new freight opportunities.</p>
                    </div>
                  )}
                </div>
              </motion.div>

          )}

          {/* TAB 3: EARNINGS */}
          {tab === "Earnings" && (
            <motion.div key="earn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.tabContent}>
               <div style={styles.card}>
                 <h3>Payout History</h3>
                 <div style={styles.tableCard}>
                    <table style={styles.table}>
                       <thead><tr><th>Date</th><th>Route</th><th>Earned</th><th>Status</th></tr></thead>
                       <tbody>
                         <tr style={styles.tr}><td>Apr 12</td><td>NY → TX</td><td>$1,200</td><td><span style={styles.badge}>Paid</span></td></tr>
                         <tr style={styles.tr}><td>Apr 14</td><td>LA → SF</td><td>$850</td><td><span style={styles.badge}>Processing</span></td></tr>
                       </tbody>
                    </table>
                 </div>
               </div>
            </motion.div>
          )}

          {/* TAB 4: SUPPORT (CRUD) */}
          {tab === "Support" && (
            <motion.div key="sup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.tabContent}>
               <div style={styles.card}>
                  <h3>Create Support Ticket</h3>
                  <form onSubmit={handleCreateTicket} style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                     <input style={styles.input} placeholder="Describe issue (e.g. Fuel, Engine, Pay)..." value={msg} onChange={e=>setMsg(e.target.value)} />
                     <button style={styles.primaryBtn}><Send size={18}/></button>
                  </form>
               </div>
               <div style={{marginTop:'30px'}}>
                  {tickets.map(t => (
                    <div key={t.id} style={{...styles.card, borderLeft:'4px solid #ef4444', marginBottom:'10px'}}>
                       <div style={{display:'flex', justifyContent:'space-between'}}>
                          <strong>{t.type}</strong>
                          <span style={{fontSize:'12px'}}>{t.status}</span>
                       </div>
                       <p style={{color:'#94a3b8', fontSize:'14px'}}>{t.description}</p>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// STYLES (FULL SCREEN & NO MARGINS)
const styles = {
  
  layout: { display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#0f172a', color: 'white', overflow: 'hidden' },
  sidebar: { width: '260px', minWidth: '260px', backgroundColor: '#1e293b', padding: '30px 0', display: 'flex', flexDirection: 'column', borderRight: '1px solid #334155' },
  logoSection: { padding: '0 30px', marginBottom: '40px' },
  logoText: { fontSize: '20px', fontWeight: '800', letterSpacing: '1px' },
  statusIndicator: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' },
  statusDot: { width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' },
  statusText: { fontSize: '12px', color: '#94a3b8' },
  navItem: { display: 'flex', alignItems: 'center', padding: '16px 30px', cursor: 'pointer', transition: '0.2s', fontSize: '14px' },
  main: { flex: 1, padding: '40px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '40px', alignItems: 'center' },
  headerRight: { display: 'flex', gap: '20px', alignItems: 'center' },
  searchBar: { display: 'flex', alignItems: 'center', background: '#1e293b', padding: '8px 15px', borderRadius: '12px', width: '250px' },
  searchInput: { background: 'transparent', border: 'none', color: 'white', marginLeft: '10px', outline: 'none' },
  statsGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px', marginBottom: '30px' },
  earningsCard: { background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '30px', borderRadius: '24px', border: '1px solid #334155' },
  statBox: { background: '#1e293b', padding: '20px', borderRadius: '24px', border: '1px solid #334155', textAlign:'center' },
  nextTripCard: { background: '#1e293b', padding: '30px', borderRadius: '24px', border: '1px solid #334155' },
  pTrack: { width: '100%', height: '8px', background: '#0f172a', borderRadius: '10px', marginTop:'20px' },
  pBar: { height: '100%', background: '#38bdf8', borderRadius: '10px' },
  badge: { padding: '4px 10px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '12px', fontSize: '12px' },
  tabContent: { display: 'flex', flexDirection: 'column', gap: '20px' },
  jobList: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  card: { background: '#1e293b', padding: '25px', borderRadius: '20px', border: '1px solid #334155' },
  jobPrice: { fontSize: '24px', fontWeight: '800', color: '#10b981' },
  acceptBtn: { flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  rejectBtn: { background: '#334155', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer' },
  tableCard: { background: '#0f172a', borderRadius: '15px', overflow: 'hidden', marginTop:'20px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tr: { borderBottom: '1px solid #1e293b' },
  input: { flex: 1, background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '15px', borderRadius: '12px', outline: 'none' },
  primaryBtn: { background: '#38bdf8', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  logoutBtn: { padding: '20px 30px', color: '#ef4444', display: 'flex', alignItems: 'center', cursor: 'pointer', borderTop: '1px solid #334155', marginTop: 'auto' },
  // Add these to your existing styles object
  sectionHeader: { marginBottom: '25px' },
  jobList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' },
  jobCard: { background: '#1e293b', padding: '25px', borderRadius: '24px', border: '1px solid #334155', transition: '0.3s' },
  jobHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  jobIcon: { padding: '10px', background: '#10b98120', color: '#10b981', borderRadius: '12px' },
  jobPrice: { fontSize: '24px', fontWeight: '800', color: '#10b981' },
  
  routeContainer: { position: 'relative', padding: '10px 0', marginBottom: '20px' },
  routePoint: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: '500' },
  pointDot: { width: '8px', height: '8px', borderRadius: '50%' },
  routeLine: { width: '2px', height: '20px', background: '#334155', marginLeft: '3px', margin: '4px 0' },
  
  jobMeta: { display: 'flex', gap: '15px', padding: '15px 0', borderTop: '1px solid #334155', marginBottom: '20px' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#94a3b8' },
  
  jobActions: { display: 'flex', gap: '10px' },
  applyBtn: { flex: 1, background: '#10b981', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' },
  detailsBtn: { background: '#334155', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer' },
  
  emptyState: { gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: '#1e293b', borderRadius: '24px', border: '2px dashed #334155' }

};
