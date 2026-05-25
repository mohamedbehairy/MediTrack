import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Pill, Clock, CheckCircle, AlertTriangle, ChevronDown,
  ChevronUp, Activity, Calendar, Loader2
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { api } from '../lib/axios';

// ─── Frequency to times helper ────────────────────────────────────────────────
const frequencyToTimes = (freq = '') => {
  const f = freq.toLowerCase();
  if (f.includes('once') || f === '1x daily' || f === 'once daily')     return ['08:00 AM'];
  if (f.includes('twice') || f.includes('2x') || f.includes('two'))     return ['08:00 AM', '08:00 PM'];
  if (f.includes('three') || f.includes('3x') || f.includes('thrice'))  return ['08:00 AM', '02:00 PM', '09:00 PM'];
  if (f.includes('four') || f.includes('4x'))                           return ['07:00 AM', '12:00 PM', '06:00 PM', '10:00 PM'];
  if (f.includes('morning'))                                             return ['08:00 AM'];
  if (f.includes('night') || f.includes('bedtime'))                     return ['10:00 PM'];
  return ['08:00 AM'];
};

// ─── Adherence Progress Bar ───────────────────────────────────────────────────
const AdherenceBar = ({ pct }) => {
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500';
  const textColor = pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-rose-400';
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500">Adherence</span>
        <span className={`text-sm font-bold ${textColor}`}>{pct}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
};

// ─── Medication Card ──────────────────────────────────────────────────────────
const MedCard = ({ pm, prescription, onMark, marking }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const metrics = pm.adherenceMetrics || { percentage: 0, expected: 1, actual: 0 };
  const times = frequencyToTimes(pm.frequency);

  const takenToday = (pm.adherenceLogs || []).filter(l => {
    const d = new Date(l.dateTaken);
    return d.toDateString() === new Date().toDateString() && l.status === 'TAKEN';
  }).length;

  const remaining = times.length - takenToday;
  const isLow = metrics.percentage < 50 && metrics.expected > 0;
  const isMarking = marking === pm.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card overflow-hidden border-l-4 transition-all ${isLow ? 'border-l-rose-500' : 'border-l-primary'}`}
    >
      <div className="p-5">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isLow ? 'bg-rose-500/20' : 'bg-primary/20'}`}>
            <Pill className={`w-6 h-6 ${isLow ? 'text-rose-400' : 'text-primary'}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h3 className="font-bold text-white text-lg">{pm.medication.name}</h3>
              {isLow && (
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle size={10} /> {t('patientDashboard.lowAdherence')}
                </span>
              )}
            </div>
            <p className="text-sm text-primary font-medium">{pm.dosage} · {pm.frequency}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {prescription.diagnosis} · Dr. {prescription.doctor?.user?.lastName} · {pm.durationDays} days
            </p>
          </div>

          {/* Mark Dose */}
          <div className="w-full sm:w-auto shrink-0 flex flex-row sm:flex-col items-center sm:items-end gap-2">
            {remaining > 0 ? (
              <button
                onClick={() => onMark(pm.id)}
                disabled={isMarking}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/40 rounded-xl transition-all font-bold text-sm disabled:opacity-60"
              >
                {isMarking ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                {isMarking ? 'Marking…' : `Mark Dose (${remaining} left)`}
              </button>
            ) : (
              <span className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-500 rounded-xl text-sm font-medium border border-slate-700">
                <CheckCircle size={14} /> All done today
              </span>
            )}
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
            >
              {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {expanded ? 'Hide details' : 'Show details'}
            </button>
          </div>
        </div>

        {/* Adherence bar + today's schedule */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AdherenceBar pct={metrics.percentage} />
          <div>
            <p className="text-xs text-slate-500 mb-1.5">Today's schedule</p>
            <div className="flex flex-wrap gap-1.5">
              {times.map((t, i) => {
                const taken = i < takenToday;
                return (
                  <span key={i} className={`text-xs px-2 py-1 rounded-full font-medium border ${
                    taken
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {taken ? '✓' : '○'} {t}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded log */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-800"
          >
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Medication Info</p>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Active Ingredient</dt>
                    <dd className="text-slate-200 font-medium">{pm.medication.activeIngredient}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Dosage</dt>
                    <dd className="text-slate-200 font-medium">{pm.dosage}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Duration</dt>
                    <dd className="text-slate-200 font-medium">{pm.durationDays} days</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Doses taken</dt>
                    <dd className="text-slate-200 font-medium">{metrics.actual} / {metrics.expected}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Logs</p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {(pm.adherenceLogs || []).length === 0 ? (
                    <p className="text-xs text-slate-600 italic">No doses logged yet.</p>
                  ) : (
                    [...pm.adherenceLogs].reverse().slice(0, 10).map(log => (
                      <div key={log.id} className="flex items-center gap-2 text-xs">
                        <CheckCircle size={11} className="text-emerald-400 shrink-0" />
                        <span className="text-slate-300">{new Date(log.dateTaken).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const PatientMedications = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchData = async () => {
    try {
      const res = await api.get(`/patients/${user.id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.id) fetchData(); }, [user]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMark = async (pmId) => {
    setMarking(pmId);
    try {
      await api.post('/patients/mark-dose', { prescriptionMedicationId: pmId });
      showToast(t('patientDashboard.doseMarked'));
      await fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || t('patientDashboard.failedMarkDose'), 'error');
    } finally {
      setMarking(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col h-full items-center justify-center text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin mb-4" />
      {t('patientMedications.loadingMedications')}
    </div>
  );
  if (!data) return <div className="text-slate-400 p-8">{t('patientDashboard.errorLoadingProfile')}</div>;

  const allMeds = data.prescriptions.flatMap(px => px.medications);
  const totalExpected = allMeds.reduce((s, m) => s + (m.adherenceMetrics?.expected || 0), 0);
  const totalActual   = allMeds.reduce((s, m) => s + (m.adherenceMetrics?.actual   || 0), 0);
  const overallPct    = totalExpected > 0 ? Math.round((totalActual / totalExpected) * 100) : null;
  const lowCount      = allMeds.filter(m => (m.adherenceMetrics?.percentage ?? 100) < 50).length;

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl font-medium shadow-2xl border ${toast.type === 'error' ? 'bg-rose-900/90 border-rose-500 text-rose-200' : 'bg-emerald-900/90 border-emerald-500 text-emerald-200'}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto text-white">
        <header className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Pill className="text-primary w-8 h-8" />
            {t('patientMedications.myMedications')}
          </h1>
          <p className="text-slate-400 mt-1">{t('patientMedications.activePrescriptions')}</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Pill className="text-primary w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Medications</p>
              <p className="text-2xl font-bold">{allMeds.length}</p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Activity className="text-emerald-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Overall Adherence</p>
              <p className={`text-2xl font-bold ${overallPct === null ? 'text-slate-400' : overallPct >= 80 ? 'text-emerald-400' : overallPct >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                {overallPct !== null ? `${overallPct}%` : '—'}
              </p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="text-rose-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Needs Attention</p>
              <p className={`text-2xl font-bold ${lowCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{lowCount}</p>
            </div>
          </div>
        </div>

        {/* Medication List grouped by Prescription */}
        {data.prescriptions.length === 0 ? (
          <div className="glass-card p-16 text-center flex flex-col items-center text-slate-500 border-dashed border-2 border-slate-700">
            <Pill className="w-14 h-14 mb-4 opacity-20" />
            <p className="text-xl">No medications prescribed yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {data.prescriptions.map(px => (
              <div key={px.id}>
                {/* Prescription header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{px.diagnosis}</p>
                    <p className="text-xs text-slate-400">
                      Dr. {px.doctor?.user?.firstName} {px.doctor?.user?.lastName} · {new Date(px.dateIssued).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pl-4 border-l border-slate-800">
                  {px.medications.map(pm => (
                    <MedCard
                      key={pm.id}
                      pm={pm}
                      prescription={px}
                      onMark={handleMark}
                      marking={marking}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PatientMedications;
