import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Building2, Users, Stethoscope, FlaskConical, Calendar,
  Pill, AlertTriangle, CheckCircle2, Activity, TrendingUp,
  ArrowRight, Loader2, Shield, Clock, Lock, Unlock, Search,
  RefreshCw, Eye, Lock as LockIcon, X, AlertCircle, Phone, Mail,
} from 'lucide-react';
import { api } from '../lib/axios';

const ROLE_META = {
  DOCTOR:     { label: 'Doctors',     color: 'text-blue-400',    bg: 'bg-blue-500/15',   border: 'border-blue-500/25',   icon: Stethoscope },
  PATIENT:    { label: 'Patients',    color: 'text-teal-400',    bg: 'bg-teal-500/15',   border: 'border-teal-500/25',   icon: Users },
  PHARMACIST: { label: 'Pharmacists', color: 'text-purple-400',  bg: 'bg-purple-500/15', border: 'border-purple-500/25', icon: FlaskConical },
  ADMIN:      { label: 'Admins',      color: 'text-orange-400',  bg: 'bg-orange-500/15', border: 'border-orange-500/25', icon: Shield },
};

/* ── User Lock/Unlock Modal ───────────────────────────────────────────── */
const UserControlModal = ({ user, onClose, onAction }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isLocked = user.isLocked;

  const handleToggleLock = async () => {
    setLoading(true);
    setError('');
    try {
      await api.patch(`/admin/users/${user.id}/${isLocked ? 'unlock' : 'lock'}`);
      onAction();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {isLocked ? <Unlock className="text-emerald-400 w-5 h-5" /> : <LockIcon className="text-rose-400 w-5 h-5" />}
            {isLocked ? 'Unlock' : 'Lock'} User
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="flex-1">
                <p className="font-bold text-white">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded border ${
                ROLE_META[user.role]?.color ?? 'text-slate-400'
              } ${ROLE_META[user.role]?.bg ?? 'bg-slate-800'} ${ROLE_META[user.role]?.border ?? 'border-slate-700'}`}>
                {user.role}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm flex items-center gap-2">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <div className={`p-3 rounded-lg border ${isLocked ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
            <p className={`text-sm font-medium ${isLocked ? 'text-emerald-300' : 'text-rose-300'}`}>
              {isLocked
                ? '✅ This account is currently LOCKED. Click below to UNLOCK it and restore access.'
                : '🔒 This account is currently ACTIVE. Click below to LOCK it and prevent access.'}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-medium text-slate-300 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={handleToggleLock}
              disabled={loading}
              className={`flex-1 py-3 text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${
                isLocked
                  ? 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-600'
                  : 'bg-rose-600 hover:bg-rose-500 border border-rose-600'
              }`}
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Processing...</>
              ) : isLocked ? (
                <><Unlock size={15} /> Unlock Account</>
              ) : (
                <><LockIcon size={15} /> Lock Account</>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Stat card ─────────────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, sub, color, bg, border, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className={`glass-card p-6 border ${border} flex items-center gap-5`}
  >
    <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
      <Icon className={`w-7 h-7 ${color}`} />
    </div>
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-black mt-0.5 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  </motion.div>
);

/* ── Status Badge ──────────────────────────────────────────────────────────── */
const StatusBadge = ({ status, isLocked }) => {
  if (isLocked) {
    return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center gap-1"><LockIcon size={12} /> Locked</span>;
  }
  const config = {
    SCHEDULED: { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400', label: '📅 Scheduled' },
    COMPLETED: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', label: '✅ Completed' },
    CANCELLED: { bg: 'bg-slate-500/20', border: 'border-slate-500/40', text: 'text-slate-400', label: '❌ Cancelled' },
  };
  const c = config[status] || config.SCHEDULED;
  return <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${c.bg} ${c.border} ${c.text}`}>{c.label}</span>;
};

/* ── Module card ───────────────────────────────────────────────────────────── */
const ModuleCard = ({ icon: Icon, title, stats, linkTo, color, border, bg, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className={`glass-card p-6 border ${border} flex flex-col gap-5`}
  >
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <h3 className="font-bold text-white text-lg">{title}</h3>
    </div>

    <div className="space-y-2">
      {stats.map(({ label, value, highlight }) => (
        <div key={label} className="flex justify-between items-center text-sm">
          <span className="text-slate-400">{label}</span>
          <span className={`font-bold ${highlight || 'text-white'}`}>{value}</span>
        </div>
      ))}
    </div>

    {linkTo && (
      <Link
        to={linkTo}
        className={`mt-auto flex items-center justify-between px-4 py-2.5 rounded-xl border ${border} ${bg} ${color} text-xs font-bold uppercase tracking-wider transition-all hover:opacity-80`}
      >
        Manage <ArrowRight size={13} />
      </Link>
    )}
  </motion.div>
);

/* ── Main page ─────────────────────────────────────────────────────────────── */
const HospitalDashboard = () => {
  const [data, setData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview | appointments | patients | users
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userControlModal, setUserControlModal] = useState(false);
  const [filterRole, setFilterRole] = useState('all');

  const fetch = useCallback(async () => {
    try {
      const [overviewRes, usersRes, appointmentsRes, patientsRes] = await Promise.all([
        api.get('/admin/overview').catch(err => { console.error('Overview error:', err); return { data: {} }; }),
        api.get('/admin/users').catch(err => { console.error('Users error:', err); return { data: [] }; }),
        api.get('/admin/appointments').catch(err => { console.error('Appointments error:', err); return { data: [] }; }),
        api.get('/admin/patients').catch(err => { console.error('Patients error:', err); return { data: [] }; }),
      ]);
      setData(overviewRes.data || {});
      setAllUsers(usersRes.data || []);
      setAllAppointments(appointmentsRes.data || []);
      setAllPatients(patientsRes.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleUserAction = async () => {
    await fetch();
    setSelectedUser(null);
  };

  // Filtered data
  const filteredUsers = allUsers.filter(user => {
    const matchSearch = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole === 'all' || user.role === filterRole;
    return matchSearch && matchRole;
  });

  const filteredAppointments = allAppointments.filter(apt =>
    `${apt.patient?.user?.firstName} ${apt.patient?.user?.lastName} ${apt.doctor?.user?.firstName} ${apt.doctor?.user?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPatients = allPatients.filter(p =>
    `${p.user?.firstName} ${p.user?.lastName} ${p.user?.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col h-full items-center justify-center text-slate-400">
      <Loader2 className="w-9 h-9 animate-spin mb-4 text-primary" />
      <p>Loading platform overview…</p>
    </div>
  );

  const c = data?.counts || {};
  const totalUsers = (c.DOCTOR || 0) + (c.PATIENT || 0) + (c.PHARMACIST || 0) + (c.ADMIN || 0);

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: Activity },
    { id: 'appointments', label: '📅 Appointments', icon: Calendar, badge: allAppointments.length },
    { id: 'patients', label: '👥 Patients', icon: Users, badge: allPatients.length },
    { id: 'users', label: '🔐 User Control', icon: Shield, badge: allUsers.length },
  ];

  return (
    <div className="max-w-7xl mx-auto text-white space-y-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Hospital Administration</h1>
              <p className="text-slate-400 text-sm">Complete system control & management</p>
            </div>
          </div>
          <button
            onClick={() => { setSearchQuery(''); fetch(); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 font-medium text-sm transition-colors"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </header>

      {/* ── Quick Stats (Always visible) ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}        label="Total Users"        value={totalUsers}                      color="text-white"        bg="bg-slate-700/50"   border="border-slate-600/30"   delay={0} />
        <StatCard icon={Calendar}     label="Appointments"       value={data?.totalAppointments ?? 0}    color="text-blue-400"     bg="bg-blue-500/15"    border="border-blue-500/20"    delay={0.05}
          sub={`${data?.scheduledAppointments ?? 0} scheduled`} />
        <StatCard icon={Users}        label="Patients"           value={c.PATIENT || 0}                  color="text-teal-400"     bg="bg-teal-500/15"    border="border-teal-500/20"    delay={0.1} />
        <StatCard icon={AlertTriangle} label="Locked Accounts"   value={allUsers.filter(u => u.isLocked).length} color="text-rose-400"  bg="bg-rose-500/15"    border="border-rose-500/20"    delay={0.15} />
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div className="flex gap-2 border-b border-slate-700 overflow-x-auto pb-0">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-b-primary text-primary'
                  : 'border-b-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {tab.label}
              {tab.badge !== undefined && (
                <span className="bg-slate-700 px-2 py-0.5 rounded-full text-xs font-bold text-white ml-1">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Role breakdown + module cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Role breakdown */}
              <div className="lg:col-span-1 glass-card p-6 space-y-4">
                <h2 className="font-bold text-white text-lg flex items-center gap-2">
                  <Users size={18} /> Users by Role
                </h2>
                {Object.entries(ROLE_META).map(([role, meta], i) => {
                  const count = c[role] || 0;
                  const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
                  const Icon = meta.icon;
                  return (
                    <motion.div
                      key={role}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${meta.border} ${meta.bg}`}
                    >
                      <Icon size={16} className={meta.color} />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold text-white">{meta.label}</span>
                          <span className={`text-sm font-black ${meta.color}`}>{count}</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.3 + i * 0.07, duration: 0.6 }}
                            className={`h-full rounded-full ${meta.bg.replace('/15', '')}`}
                            style={{ background: `currentColor` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 shrink-0">{pct}%</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Module cards */}
              <div className="lg:col-span-2 space-y-4">
                <div className="glass-card p-6 border border-slate-700/40">
                  <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                    <Clock size={18} /> Recently Joined Users
                  </h3>
                  <div className="space-y-3">
                    {(data?.recentUsers || []).slice(0, 5).map(u => (
                      <div key={u.id} className="flex items-center gap-3 pb-3 border-b border-slate-800 last:border-0 last:pb-0">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded border shrink-0 ${ROLE_META[u.role]?.color ?? 'text-slate-400'}`}>
                          {ROLE_META[u.role]?.label || u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {(data?.lowStockItems ?? 0) > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-4"
                  >
                    <AlertTriangle className="text-amber-400 w-5 h-5 mt-0.5 shrink-0 animate-pulse" />
                    <div>
                      <p className="font-bold text-amber-300">⚠️ Pharmacy Stock Alert</p>
                      <p className="text-amber-200/70 text-sm mt-0.5">
                        {data.lowStockItems} medication{data.lowStockItems > 1 ? 's are' : ' is'} running low. Contact pharmacy to restock.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'appointments' && (
          <motion.div
            key="appointments"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by patient or doctor name…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 focus:border-primary rounded-xl ps-11 pe-4 py-2.5 text-white outline-none transition-colors text-sm"
                />
              </div>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="glass-card p-12 text-center text-slate-500 border-dashed border-2 border-slate-700">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No appointments found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((apt, idx) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card p-4 border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-sm font-bold shrink-0">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-white">{apt.patient?.user?.firstName} {apt.patient?.user?.lastName}</p>
                          <p className="text-xs text-slate-400">with Dr. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName}</p>
                        </div>
                      </div>
                      <StatusBadge status={apt.status} />
                    </div>
                    <p className="text-xs text-slate-400">📅 {new Date(apt.date).toLocaleDateString()} at {new Date(apt.date).toLocaleTimeString()}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'patients' && (
          <motion.div
            key="patients"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by patient name or email…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 focus:border-primary rounded-xl ps-11 pe-4 py-2.5 text-white outline-none transition-colors text-sm"
                />
              </div>
            </div>

            {filteredPatients.length === 0 ? (
              <div className="glass-card p-12 text-center text-slate-500 border-dashed border-2 border-slate-700">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No patients found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredPatients.map((patient, idx) => (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card p-4 border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center text-sm font-bold text-teal-400 shrink-0 border border-teal-500/30">
                          {patient.user?.firstName[0]}{patient.user?.lastName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white">{patient.user?.firstName} {patient.user?.lastName}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                            <Mail size={12} /> {patient.user?.email}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            🩺 Blood Type: {patient.bloodType || 'Not specified'} | 📋 {patient.prescriptions?.length || 0} prescriptions
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search users…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 focus:border-primary rounded-xl ps-11 pe-4 py-2.5 text-white outline-none transition-colors text-sm"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'DOCTOR', 'PATIENT', 'PHARMACIST', 'ADMIN'].map(role => (
                  <button
                    key={role}
                    onClick={() => setFilterRole(role)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      filterRole === role
                        ? 'bg-primary/25 border border-primary text-primary'
                        : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {role === 'all' ? 'All' : ROLE_META[role]?.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="glass-card p-12 text-center text-slate-500 border-dashed border-2 border-slate-700">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto">
                {filteredUsers.map((user, idx) => {
                  const meta = ROLE_META[user.role];
                  const isLocked = user.isLocked;
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`glass-card p-4 border transition-all cursor-pointer hover:shadow-lg ${
                        isLocked
                          ? 'border-rose-500/30 opacity-75'
                          : `border-slate-700 ${meta?.border}`
                      }`}
                      onClick={() => { setSelectedUser(user); setUserControlModal(true); }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 border ${
                            meta?.bg
                          } ${meta?.border}`}>
                            <span className={meta?.color}>{user.firstName[0]}{user.lastName[0]}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white flex items-center gap-2">
                              {user.firstName} {user.lastName}
                              {isLocked && <LockIcon size={14} className="text-rose-400" />}
                            </p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge isLocked={isLocked} status="ACTIVE" />
                          <span className={`text-xs font-bold px-2.5 py-1 rounded border ${meta?.color} ${meta?.bg} ${meta?.border}`}>
                            {meta?.label || user.role}
                          </span>
                          <button
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-colors"
                            title={isLocked ? 'Unlock user' : 'Lock user'}
                            onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setUserControlModal(true); }}
                          >
                            {isLocked ? <Unlock size={16} /> : <LockIcon size={16} />}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── User Control Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {userControlModal && selectedUser && (
          <UserControlModal
            user={selectedUser}
            onClose={() => { setUserControlModal(false); setSelectedUser(null); }}
            onAction={handleUserAction}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HospitalDashboard;
