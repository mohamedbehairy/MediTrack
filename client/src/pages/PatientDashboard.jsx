import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Clock, CheckCircle, Bell, AlertTriangle, Activity,
  Calendar, Pill, Heart, FileText, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { api } from '../lib/axios';

const frequencyToTimes = (freq = '') => {
  const f = freq.toLowerCase();
  if (f.includes('once') || f === '1x daily' || f === 'once daily')      return ['08:00'];
  if (f.includes('twice') || f === '2x daily' || f.includes('two'))      return ['08:00', '20:00'];
  if (f.includes('three') || f.includes('3x') || f.includes('thrice'))   return ['08:00', '14:00', '21:00'];
  if (f.includes('four') || f.includes('4x'))                            return ['06:00', '12:00', '18:00', '22:00'];
  if (f.includes('morning'))                                              return ['08:00'];
  if (f.includes('night') || f.includes('bedtime'))                      return ['22:00'];
  return ['08:00'];
};

const AdherenceRing = ({ pct }) => {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#f43f5e';
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
      <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="40" y="44" textAnchor="middle" fill={color} fontSize="14" fontWeight="bold">{pct}%</text>
    </svg>
  );
};

const MedScheduleCard = ({ pm, prescription, onMark }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const metrics = pm.adherenceMetrics || { percentage: 0, expected: 1, actual: 0 };
  const times = frequencyToTimes(pm.frequency);
  const takenToday = pm.adherenceLogs?.filter(l => {
    const d = new Date(l.dateTaken);
    const today = new Date();
    return d.toDateString() === today.toDateString() && l.status === 'TAKEN';
  }).length || 0;
  const isLow = metrics.percentage < 50 && metrics.expected > 0;

  return (
    <motion.div
      layout
      className={`glass-card overflow-hidden border-s-4 ${isLow ? 'border-s-rose-500' : 'border-s-primary'}`}
    >
      <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="shrink-0">
          <AdherenceRing pct={metrics.percentage} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-bold text-lg text-white">{pm.medication.name}</h3>
              <p className="text-sm text-primary font-medium">{pm.dosage} · {pm.frequency}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('patientDashboard.for')} <span className="text-slate-300">{prescription.diagnosis}</span> ·
                Dr. {prescription.doctor?.user?.lastName} · {pm.durationDays} {t('patientDetail.days')}
              </p>
            </div>
            {isLow && (
              <span className="flex items-center gap-1 text-xs text-rose-400 font-bold animate-pulse bg-rose-500/10 px-2 py-1 rounded-full border border-rose-500/30">
                <AlertTriangle size={11} /> {t('patientDashboard.lowAdherence')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-slate-500 uppercase tracking-wide">{t('patientDashboard.todaysDoses')}</span>
            {times.map((time, i) => {
              const taken = i < takenToday;
              return (
                <span key={i} className={`text-xs px-2 py-1 rounded-full font-medium border ${
                  taken ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {taken ? '✓' : '○'} {time}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end gap-2 w-full sm:w-auto shrink-0">
          {takenToday < times.length ? (
            <button
              onClick={() => onMark(pm.id)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/40 rounded-xl transition-all font-bold text-sm group"
            >
              <Bell size={15} className="animate-pulse group-hover:animate-none" />
              {t('patientDashboard.markTaken')}
            </button>
          ) : (
            <span className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-slate-500 rounded-xl text-sm font-medium">
              <CheckCircle size={15} /> {t('patientDashboard.allDoneToday')}
            </span>
          )}
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors">
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? t('patientDashboard.hide') : t('patientDashboard.history')}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-800"
          >
            <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('patientDashboard.adherenceLog')}</p>
              {pm.adherenceLogs?.length > 0 ? (
                [...pm.adherenceLogs].reverse().map(log => (
                  <div key={log.id} className="flex items-center gap-3 text-xs">
                    <CheckCircle size={12} className="text-emerald-400 shrink-0" />
                    <span className="text-slate-300">{new Date(log.dateTaken).toLocaleString()}</span>
                    <span className="text-emerald-500 font-medium">{log.status}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-600 italic">{t('patientDashboard.noDosesLogged')}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const UpcomingAppointments = ({ appointments }) => {
  const { t } = useTranslation();
  const upcoming = appointments
    .filter(a => a.status === 'SCHEDULED' && new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  if (upcoming.length === 0) return (
    <div className="glass-card p-6 text-center text-slate-500 italic text-sm">{t('patientDashboard.noUpcomingAppointments')}</div>
  );

  return (
    <div className="space-y-3">
      {upcoming.map(apt => (
        <div key={apt.id} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm">
              Dr. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName}
            </p>
            <p className="text-xs text-slate-400">
              {new Date(apt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
              {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            {apt.notes && <p className="text-xs text-slate-500 mt-0.5 truncate">{apt.notes}</p>}
          </div>
          <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/30 px-2 py-1 rounded-full shrink-0">{t('patientDashboard.scheduled')}</span>
        </div>
      ))}
    </div>
  );
};

const PatientDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/patients/${user.id}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchProfile();
  }, [user]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMarkDose = async (pMedId) => {
    setMarkingId(pMedId);
    try {
      await api.post('/patients/mark-dose', { prescriptionMedicationId: pMedId });
      showToast(t('patientDashboard.doseMarked'));
      await fetchProfile();
    } catch (err) {
      showToast(err.response?.data?.message || t('patientDashboard.failedMarkDose'), 'error');
    } finally {
      setMarkingId(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col h-full items-center justify-center text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin mb-4" />
      {t('patientDashboard.loadingTimeline')}
    </div>
  );
  if (!data) return <div className="h-full flex items-center justify-center text-slate-400">{t('patientDashboard.errorLoadingProfile')}</div>;

  const allMeds = data.prescriptions.flatMap(px => px.medications);
  const totalExpected = allMeds.reduce((s, pm) => s + (pm.adherenceMetrics?.expected || 0), 0);
  const totalActual   = allMeds.reduce((s, pm) => s + (pm.adherenceMetrics?.actual   || 0), 0);
  const overallPct    = totalExpected > 0 ? Math.round((totalActual / totalExpected) * 100) : null;
  const criticalMeds  = allMeds.filter(pm => (pm.adherenceMetrics?.percentage ?? 100) < 50 && (pm.adherenceMetrics?.expected ?? 0) > 0);

  return (
    <div className="text-white max-w-6xl mx-auto">

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 end-6 z-50 px-5 py-3 rounded-xl font-medium shadow-2xl border
              ${toast.type === 'error' ? 'bg-rose-900/90 border-rose-500 text-rose-200' : 'bg-emerald-900/90 border-emerald-500 text-emerald-200'}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="mb-8">
        <h1 className="text-3xl font-bold">
          {t('patientDashboard.welcome')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-300">{data.user.firstName}</span>
        </h1>
        <p className="text-slate-400 mt-1">{t('patientDashboard.healthTimeline')}</p>
      </header>

      <AnimatePresence>
        {criticalMeds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-8 p-5 bg-rose-500/10 border border-rose-500/40 rounded-2xl flex items-start gap-4"
          >
            <AlertTriangle className="text-rose-500 w-6 h-6 mt-0.5 shrink-0 animate-pulse" />
            <div>
              <h3 className="text-rose-400 font-bold text-lg">{t('patientDashboard.criticalAdherenceAlert')}</h3>
              <p className="text-rose-300 text-sm mt-1">
                {criticalMeds.length} {t('patientDashboard.criticalAlertDesc')}{' '}
                <strong>{criticalMeds.map(m => m.medication.name).join(', ')}</strong>. {t('patientDashboard.criticalAlertAction')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="glass-card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <Pill className="text-primary w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">{t('patientDashboard.activeRx')}</p>
            <p className="text-2xl font-bold">{data.prescriptions.length}</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Activity className="text-emerald-400 w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">{t('patientDashboard.overallAdherence')}</p>
            <p className={`text-2xl font-bold ${overallPct === null ? 'text-slate-400' : overallPct >= 80 ? 'text-emerald-400' : overallPct >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
              {overallPct !== null ? `${overallPct}%` : '—'}
            </p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-blue/20 flex items-center justify-center shrink-0">
            <Calendar className="text-accent-blue w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">{t('patientDashboard.appointments')}</p>
            <p className="text-2xl font-bold">{data.appointments?.length || 0}</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
            <Heart className="text-rose-400 w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">{t('patientDashboard.bloodType')}</p>
            <p className="text-2xl font-bold text-rose-400">{data.bloodType || '—'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-4">
            <Clock className="text-primary w-5 h-5" /> {t('patientDashboard.medicationSchedule')}
          </h2>

          {allMeds.length === 0 ? (
            <div className="glass-card p-10 text-center text-slate-500">
              <Pill className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>{t('patientDashboard.noActiveMedications')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.prescriptions.map(px =>
                px.medications.map(pm => (
                  <MedScheduleCard
                    key={pm.id}
                    pm={pm}
                    prescription={px}
                    onMark={handleMarkDose}
                  />
                ))
              )}
            </div>
          )}
        </div>

        <div className="space-y-8">

          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
              <Calendar className="text-accent-blue w-5 h-5" /> {t('patientDashboard.upcomingAppointments')}
            </h2>
            <UpcomingAppointments appointments={data.appointments || []} />
          </div>

          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
              <FileText className="text-slate-400 w-5 h-5" /> {t('patientDashboard.medicalInformation')}
            </h2>
            <div className="glass-card p-5 space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('patientDashboard.medicalHistory')}</p>
                <p className="text-slate-300 text-sm leading-relaxed">{data.medicalHistory || t('patientDashboard.noHistoryRecorded')}</p>
              </div>
              <div className="border-t border-slate-800 pt-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t('patientDashboard.recentAdherenceLogs')}</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {data.adherenceLogs.slice(-5).reverse().map(log => (
                    <div key={log.id} className="flex items-center gap-2 text-xs">
                      <CheckCircle size={12} className="text-emerald-400 shrink-0" />
                      <span className="text-slate-300 truncate">{new Date(log.dateTaken).toLocaleString()}</span>
                    </div>
                  ))}
                  {data.adherenceLogs.length === 0 && <p className="text-xs text-slate-600 italic">{t('patientDashboard.noLogsYet')}</p>}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
