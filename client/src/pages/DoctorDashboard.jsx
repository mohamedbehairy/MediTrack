import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import { api } from '../lib/axios';
import { Users, Calendar, AlertTriangle, LogOut, Search, Settings, ChevronRight, Activity, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import PatientDetailDrawer from '../components/PatientDetailDrawer';

const DoctorDashboard = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get(`/doctors/${user.id}/dashboard`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchDashboard();
  }, [user]);

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-400">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-lg font-medium tracking-tight">{t('doctorDashboard.synchronizing')}</p>
    </div>
  );

  if (!data) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-400">
      <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
      <p className="text-xl font-bold">{t('doctorDashboard.accessDenied')}</p>
      <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">{t('doctorDashboard.retryConnection')}</button>
    </div>
  );

  return (
    <div className="text-white max-w-7xl mx-auto px-4 py-6">
      {/* Header Area */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/30 to-accent-blue/30 p-0.5 shadow-2xl relative group">
            <div className="absolute inset-0 bg-primary/30 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center overflow-hidden border border-white/10 relative z-10 shadow-inner">
              {data.profileImage ? (
                <img src={`http://localhost:5002${data.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
                  {data.user.lastName[0]}
                </span>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-slate-950 flex items-center justify-center z-20 shadow-lg">
              <CheckCircle2 size={14} className="text-white" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white">
                Dr. {data.user.lastName}
              </h1>
              <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/5">{t('doctorDashboard.verifiedMD')}</span>
            </div>
            <p className="text-slate-400 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-semibold text-base sm:text-lg">
              <span className="text-primary/90">{data.specialization}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <span className="text-slate-500">{data.clinicAddress || 'MediTrack Global Net'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={() => window.location.href = '/doctor/settings'}
            className="flex items-center gap-3 px-6 py-3 bg-slate-900/50 hover:bg-slate-800 rounded-2xl transition-all border border-slate-800 hover:border-primary/50 font-bold text-sm shadow-xl group"
          >
            <Settings size={18} className="text-slate-400 group-hover:text-primary group-hover:rotate-90 transition-all duration-500" /> {t('doctorDashboard.myProfile')}
          </button>
          <button
            onClick={() => { logout(); window.location.href = '/login'; }}
            className="flex items-center gap-3 px-6 py-3 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400/80 hover:text-rose-400 rounded-2xl transition-all border border-rose-500/10 hover:border-rose-500/30 font-bold text-sm shadow-xl"
          >
            <LogOut size={18} /> {t('doctorDashboard.signOut')}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Main Column: Appointments */}
        <div className="lg:col-span-8 space-y-10">
          <div className="flex justify-between items-end border-b border-white/10 pb-6">
            <div>
              <h2 className="text-3xl font-black flex items-center gap-4 text-white">
                <Calendar className="text-primary w-8 h-8" /> {t('doctorDashboard.appointmentsQueue')}
              </h2>
              <p className="text-slate-500 font-medium mt-1">{t('doctorDashboard.pendingSessions')}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-3xl font-black text-white">{data.appointments.length}</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('doctorDashboard.activeCases')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.appointments.map((apt, idx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.08, type: 'spring', stiffness: 100 }}
                key={apt.id}
                className="group glass-card-hover glass-card relative overflow-hidden p-7 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-white/5 hover:border-primary/30 transition-all duration-500"
              >
                <div className={`absolute top-0 start-0 w-1.5 h-full ${apt.status === 'COMPLETED' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-primary shadow-[0_0_15px_rgba(255,102,0,0.3)]'} group-hover:w-2.5 transition-all`} />

                <div className="flex justify-between items-start mb-8">
                  <div className="min-w-0 pe-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t('doctorDashboard.patientDetails')}</span>
                    </div>
                    <h3 className="font-extrabold text-2xl text-white truncate group-hover:text-primary transition-colors">{apt.patient.user.firstName} {apt.patient.user.lastName}</h3>
                    <p className="text-xs text-slate-500 font-bold mt-1 tracking-tight">{apt.patient.user.email}</p>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">{new Date(apt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <div className="bg-slate-950/60 px-3 py-1.5 rounded-xl border border-white/5 font-black text-white">
                      {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/50 rounded-2xl p-5 border border-white/5 mb-8 min-h-[70px] relative overflow-hidden shadow-inner">
                  <div className="absolute top-0 start-0 w-1 h-full bg-slate-800" />
                  <p className="text-sm text-slate-400 italic leading-relaxed">"{apt.notes || 'Routine follow-up for clinical assessment and medication adherence check.'}"</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedPatientId(apt.patient.userId)}
                    className="flex-[2] py-4 text-xs font-black bg-primary/10 hover:bg-primary text-primary transition-all hover:text-white rounded-2xl border border-primary/20 flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-primary/5 uppercase tracking-widest"
                  >
                    <Activity size={16} /> {t('doctorDashboard.patientProfile')}
                  </button>
                  <button
                    onClick={() => window.location.href = '/doctor/prescribe'}
                    className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl border border-slate-800 transition-all hover:border-primary/40 flex items-center justify-center shadow-lg active:scale-95"
                  >
                    <ArrowUpRight size={22} />
                  </button>
                </div>
              </motion.div>
            ))}
            {data.appointments.length === 0 && (
              <div className="col-span-1 md:col-span-2 glass-card border-dashed border-2 border-slate-800 py-24 text-center flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mb-6">
                  <Calendar className="w-10 h-10 text-slate-700" />
                </div>
                <h4 className="text-xl font-bold text-slate-400">{t('doctorDashboard.noScheduledSessions')}</h4>
                <p className="text-slate-600 font-medium max-w-xs mx-auto mt-2">{t('doctorDashboard.queueEmpty')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column: Search & Alerts */}
        <div className="lg:col-span-4 space-y-10">
          <div className="space-y-6">
            <h2 className="text-2xl font-black flex items-center gap-4 text-white">
              <Search className="text-accent-blue w-7 h-7" /> {t('doctorDashboard.patientHistory')}
            </h2>
            <div className="glass-card p-8 relative overflow-hidden group border-white/5 shadow-2xl">
              <div className="absolute top-0 end-0 w-32 h-32 bg-accent-blue/5 rounded-full blur-3xl -me-16 -mt-16 transition-all group-hover:bg-accent-blue/10" />
              <div className="relative z-10">
                <div className="relative mb-6">
                  <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent-blue transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder={t('doctorDashboard.searchGlobalRecords')}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl ps-12 pe-4 py-4 text-white outline-none focus:border-accent-blue transition-all font-bold text-base shadow-inner placeholder:text-slate-600"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (window.location.href = `/doctor/patients?q=${searchQuery}`)}
                  />
                </div>
                <button
                  onClick={() => window.location.href = '/doctor/patients'}
                  className="w-full py-4 bg-accent-blue/10 hover:bg-accent-blue text-accent-blue hover:text-white border border-accent-blue/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98]"
                >
                  {t('doctorDashboard.launchPatientDirectory')} <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 px-4 py-2 border-s-4 border-accent-rose rounded-e-xl">
              <h2 className="text-xl font-black flex items-center gap-4 text-white">
                <AlertTriangle className="text-accent-rose w-6 h-6" /> {t('doctorDashboard.adherenceAlerts')}
              </h2>
            </div>

            <div className="space-y-5">
              {data.alerts?.map((alert, idx) => (
                <motion.div
                  key={idx}
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + (idx * 0.1) }}
                  className="glass-card border-s-[6px] border-s-rose-500 p-6 group hover:bg-rose-500/5 transition-all cursor-pointer shadow-xl relative overflow-hidden"
                  onClick={() => setSelectedPatientId(alert.patientId)}
                >
                  <div className="absolute top-0 end-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <AlertTriangle size={60} className="text-rose-500" />
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-black text-[10px] text-rose-500 uppercase tracking-[0.2em]">{alert.type}</span>
                    <div className="bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full font-black text-[10px] uppercase shadow-inner">{alert.adherencePercentage}% {t('doctorDashboard.avgAdherence')}</div>
                  </div>
                  <h4 className="font-black text-xl text-white group-hover:text-rose-400 transition-colors mb-2">{alert.patientName}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold italic">"{alert.message}"</p>
                </motion.div>
              ))}
              {(!data.alerts || data.alerts.length === 0) && (
                <div className="glass-card border-x-emerald-500/30 p-10 text-center bg-emerald-500/[0.03] shadow-lg">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-5 rotate-12 group-hover:rotate-0 transition-transform">
                    <CheckCircle2 className="text-emerald-500" size={32} />
                  </div>
                  <h5 className="text-lg font-black text-white">{t('doctorDashboard.allClear')}</h5>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{t('doctorDashboard.systemMonitoring')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <PatientDetailDrawer
        patientId={selectedPatientId}
        isOpen={!!selectedPatientId}
        onClose={() => setSelectedPatientId(null)}
      />
    </div>
  );
};

export default DoctorDashboard;
