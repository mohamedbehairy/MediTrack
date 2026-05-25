import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Loader2, ChevronRight, X,
  Pill, Heart, AlertTriangle, CheckCircle2,
  FileText, Calendar, Activity, User
} from 'lucide-react';
import { api } from '../lib/axios';

/* ── Adherence badge ───────────────────────────────────────────────────────── */
const AdherenceBadge = ({ pct }) => {
  if (pct === null) return <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">No data</span>;
  const [cls, label] = pct >= 80
    ? ['bg-emerald-500/10 text-emerald-400 border-emerald-500/30', `${pct}%`]
    : pct >= 50
    ? ['bg-amber-500/10 text-amber-400 border-amber-500/30', `${pct}%`]
    : ['bg-rose-500/10 text-rose-400 border-rose-500/30', `${pct}%`];
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cls}`}>{label} adherence</span>;
};

/* ── Patient detail side panel ─────────────────────────────────────────────── */
const PatientPanel = ({ patient: p, onClose }) => {
  if (!p) return null;

  // Compute overall adherence
  const allMeds = p.prescriptions.flatMap(px => px.medications);
  const totalExpected = allMeds.reduce((s, pm) => {
    const freq = pm.frequency?.toLowerCase() || '';
    const perDay = freq.includes('twice') || freq.includes('2x') ? 2
      : freq.includes('three') || freq.includes('3x') ? 3
      : freq.includes('four') || freq.includes('4x') ? 4 : 1;
    return s + (pm.durationDays * perDay);
  }, 0);
  const totalActual = allMeds.reduce((s, pm) =>
    s + (pm.adherenceLogs || []).filter(l => l.status === 'TAKEN').length, 0
  );
  const overallPct = totalExpected > 0 ? Math.round((totalActual / totalExpected) * 100) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full sm:w-[480px] h-[90vh] sm:h-full bg-slate-900 border-s border-slate-700 shadow-2xl flex flex-col overflow-hidden rounded-t-2xl sm:rounded-none sm:rounded-s-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500/30 to-blue-500/20 flex items-center justify-center text-lg font-bold text-white border border-slate-700">
              {p.user.firstName[0]}{p.user.lastName[0]}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{p.user.firstName} {p.user.lastName}</h2>
              <p className="text-slate-400 text-sm">{p.user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 text-center">
              <p className="text-xs text-slate-500">Prescriptions</p>
              <p className="text-xl font-bold text-white">{p.prescriptions.length}</p>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 text-center">
              <p className="text-xs text-slate-500">Medications</p>
              <p className="text-xl font-bold text-white">{allMeds.length}</p>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 text-center">
              <p className="text-xs text-slate-500">Adherence</p>
              <p className={`text-xl font-bold ${overallPct === null ? 'text-slate-400' : overallPct >= 80 ? 'text-emerald-400' : overallPct >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                {overallPct !== null ? `${overallPct}%` : '—'}
              </p>
            </div>
          </div>

          {/* Medical info */}
          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medical Details</p>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Blood Type</span>
              <span className="font-bold text-rose-400">{p.bloodType || '—'}</span>
            </div>
            {p.medicalHistory && (
              <div>
                <span className="text-slate-500 text-xs">Medical History</span>
                <p className="text-slate-300 text-sm mt-1 leading-relaxed">{p.medicalHistory}</p>
              </div>
            )}
          </div>

          {/* Prescriptions */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Prescriptions & Medications</p>
            <div className="space-y-4">
              {p.prescriptions.length === 0 ? (
                <p className="text-slate-600 text-sm italic text-center py-4">No prescriptions on record.</p>
              ) : p.prescriptions.map(px => (
                <div key={px.id} className="bg-slate-800/40 rounded-xl border border-slate-700/60 overflow-hidden">
                  {/* Prescription header */}
                  <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-700/60">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-white text-sm">{px.diagnosis}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Dr. {px.doctor?.user?.firstName} {px.doctor?.user?.lastName} ·{' '}
                          {new Date(px.dateIssued).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-700">
                        Rx #{px.id}
                      </span>
                    </div>
                  </div>
                  {/* Medications */}
                  <div className="divide-y divide-slate-700/40">
                    {px.medications.map(pm => {
                      const logs = pm.adherenceLogs || [];
                      const taken = logs.filter(l => l.status === 'TAKEN').length;
                      const stock = pm.medication?.inventory?.stockLevel ?? 0;

                      return (
                        <div key={pm.id} className="px-4 py-3 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${stock < 50 ? 'bg-amber-500/15' : 'bg-teal-500/15'}`}>
                            <Pill size={14} className={stock < 50 ? 'text-amber-400' : 'text-teal-400'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-medium text-white">{pm.medication?.name}</span>
                              {stock === 0 && <span className="text-xs text-rose-400 font-bold">Out of Stock</span>}
                              {stock > 0 && stock < 50 && <span className="text-xs text-amber-400 font-bold">Low: {stock}u</span>}
                            </div>
                            <p className="text-xs text-slate-400">{pm.dosage} · {pm.frequency} · {pm.durationDays}d</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-emerald-400">{taken} taken</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Main page ─────────────────────────────────────────────────────────────── */
const PharmacyPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchPatients = useCallback(async (q = '') => {
    setSearching(true);
    try {
      const res = await api.get(`/pharmacy/patients${q ? `?q=${encodeURIComponent(q)}` : ''}`);
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);
  useEffect(() => {
    const t = setTimeout(() => fetchPatients(search), 350);
    return () => clearTimeout(t);
  }, [search, fetchPatients]);

  if (loading) return (
    <div className="flex flex-col h-full items-center justify-center text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin mb-4 text-teal-500" />
      <p>Loading patient records…</p>
    </div>
  );

  // Compute overall adherence for list view
  const withAdherence = patients.map(p => {
    const allMeds = p.prescriptions.flatMap(px => px.medications);
    const freq = (pm) => {
      const f = pm.frequency?.toLowerCase() || '';
      return f.includes('twice') || f.includes('2x') ? 2 : f.includes('three') || f.includes('3x') ? 3 : f.includes('four') ? 4 : 1;
    };
    const totalExp = allMeds.reduce((s, pm) => s + (pm.durationDays * freq(pm)), 0);
    const totalAct = allMeds.reduce((s, pm) => s + (pm.adherenceLogs || []).filter(l => l.status === 'TAKEN').length, 0);
    const overallAdherence = totalExp > 0 ? Math.round((totalAct / totalExp) * 100) : null;
    return { ...p, overallAdherence };
  });

  const lowAdh = withAdherence.filter(p => p.overallAdherence !== null && p.overallAdherence < 50).length;
  const highAdh = withAdherence.filter(p => p.overallAdherence !== null && p.overallAdherence >= 80).length;

  return (
    <>
      <div className="max-w-5xl mx-auto text-white">
        <header className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="text-teal-400 w-8 h-8" />
            Patient Lookup
          </h1>
          <p className="text-slate-400 mt-1">Search patients to review their prescriptions and medication adherence.</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center">
              <Users className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Patients</p>
              <p className="text-xl font-bold">{patients.length}</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/15 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Needs Attention</p>
              <p className="text-xl font-bold text-rose-400">{lowAdh}</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">High Adherence</p>
              <p className="text-xl font-bold text-emerald-400">{highAdh}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 focus:border-teal-500 rounded-xl ps-12 pe-4 py-4 text-white outline-none transition-colors placeholder:text-slate-500 text-base"
          />
          {searching && <Loader2 className="absolute end-4 top-1/2 -translate-y-1/2 text-teal-500 w-5 h-5 animate-spin" />}
        </div>

        {/* Patient list */}
        {withAdherence.length === 0 ? (
          <div className="glass-card p-16 text-center flex flex-col items-center text-slate-500 border-dashed border-2 border-slate-700">
            <User className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">No patients found{search ? ` matching "${search}"` : ''}.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {withAdherence.map((patient, idx) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => setSelected(patient)}
                className="glass-card p-5 flex items-center gap-4 cursor-pointer group hover:border-teal-500/30 transition-all"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500/30 to-blue-500/20 flex items-center justify-center text-sm font-bold text-white border border-slate-700 shrink-0">
                  {patient.user.firstName[0]}{patient.user.lastName[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-white text-lg leading-none">
                      {patient.user.firstName} {patient.user.lastName}
                    </h3>
                    <AdherenceBadge pct={patient.overallAdherence} />
                    {patient.overallAdherence !== null && patient.overallAdherence < 50 && (
                      <span className="flex items-center gap-1 text-xs text-rose-400 font-medium animate-pulse">
                        <AlertTriangle size={11} /> Needs attention
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm truncate mt-0.5">{patient.user.email}</p>

                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <FileText size={11} /> {patient.prescriptions.length} rx
                    </span>
                    <span className="flex items-center gap-1">
                      <Pill size={11} /> {patient.prescriptions.flatMap(px => px.medications).length} meds
                    </span>
                    {patient.bloodType && (
                      <span className="flex items-center gap-1">
                        <Heart size={11} /> {patient.bloodType}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock warning badges */}
                <div className="hidden md:flex flex-col items-end gap-1.5 shrink-0">
                  {patient.prescriptions.flatMap(px => px.medications).filter(pm => (pm.medication?.inventory?.stockLevel ?? 0) < 50 && (pm.medication?.inventory?.stockLevel ?? 0) > 0).length > 0 && (
                    <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                      Low stock meds
                    </span>
                  )}
                  {patient.prescriptions.flatMap(px => px.medications).filter(pm => (pm.medication?.inventory?.stockLevel ?? 0) === 0).length > 0 && (
                    <span className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full font-medium">
                      Out of stock
                    </span>
                  )}
                </div>

                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-teal-400 transition-colors shrink-0" />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && <PatientPanel patient={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  );
};

export default PharmacyPatients;
