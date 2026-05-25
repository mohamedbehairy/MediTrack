import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, Loader2, Printer, Eye, X,
  Pill, User, Calendar, AlertTriangle, CheckCircle2,
  RefreshCw, ChevronDown, ChevronUp, Activity
} from 'lucide-react';
import { api } from '../lib/axios';

/* ── Adherence mini-ring ───────────────────────────────────────────────────── */
const MiniRing = ({ pct }) => {
  const r = 14;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#f43f5e';
  return (
    <svg width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r={r} fill="none" stroke="#1e293b" strokeWidth="4" />
      <circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform="rotate(-90 18 18)" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
      <text x="18" y="22" textAnchor="middle" fill={color} fontSize="8" fontWeight="bold">{pct}%</text>
    </svg>
  );
};

/* ── Prescription detail modal ─────────────────────────────────────────────── */
const PrescriptionModal = ({ prescription: px, onClose }) => {
  const [expanded, setExpanded] = useState(null);

  // Compute adherence per med
  const getAdherence = (pm) => {
    const logs = pm.adherenceLogs || [];
    const taken = logs.filter(l => l.status === 'TAKEN').length;
    const total = pm.durationDays * (pm.frequency?.includes('twice') || pm.frequency?.includes('2x') ? 2
      : pm.frequency?.includes('three') || pm.frequency?.includes('3x') ? 3 : 1);
    return total > 0 ? Math.round((taken / total) * 100) : 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
        id="print-prescription"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800/50 flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="text-teal-400 w-5 h-5" /> Prescription #{px.id}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Issued {new Date(px.dateIssued).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 rounded-lg text-sm font-medium transition-colors"
            >
              <Printer size={14} /> Print
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Patient & Doctor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><User size={11} /> Patient</p>
              <p className="font-bold text-white">{px.patient?.user?.firstName} {px.patient?.user?.lastName}</p>
              <p className="text-slate-400 text-sm mt-0.5">{px.patient?.user?.email}</p>
              {px.patient?.bloodType && (
                <span className="inline-block mt-2 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                  Blood: {px.patient.bloodType}
                </span>
              )}
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Activity size={11} /> Prescribing Doctor</p>
              <p className="font-bold text-white">Dr. {px.doctor?.user?.firstName} {px.doctor?.user?.lastName}</p>
              <p className="text-slate-400 text-sm mt-1 italic">"{px.diagnosis}"</p>
            </div>
          </div>

          {/* Medications */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1"><Pill size={11} /> Medications ({px.medications?.length})</p>
            <div className="space-y-3">
              {px.medications?.map(pm => {
                const adh = getAdherence(pm);
                const stock = pm.medication?.inventory?.stockLevel ?? 0;
                const isExpanded = expanded === pm.id;

                return (
                  <div key={pm.id} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="p-4 flex items-center gap-4">
                      <MiniRing pct={adh} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white">{pm.medication?.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                            stock === 0 ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                            : stock < 50 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                            : 'text-teal-400 bg-teal-500/10 border-teal-500/30'
                          }`}>
                            {stock === 0 ? 'Out of Stock' : stock < 50 ? `Low: ${stock}u` : `${stock} units`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {pm.dosage} · {pm.frequency} · {pm.durationDays} days
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Active: <span className="text-slate-300">{pm.medication?.activeIngredient}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : pm.id)}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-slate-700"
                        >
                          <div className="p-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Adherence Logs</p>
                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                              {(pm.adherenceLogs || []).length === 0 ? (
                                <p className="text-xs text-slate-600 italic">No doses logged yet.</p>
                              ) : (
                                [...pm.adherenceLogs].reverse().map(log => (
                                  <div key={log.id} className="flex items-center gap-2 text-xs">
                                    <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                                    <span className="text-slate-300">{new Date(log.dateTaken).toLocaleString()}</span>
                                    <span className="text-emerald-500 font-medium">{log.status}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <button onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Main page ─────────────────────────────────────────────────────────────── */
const PharmacyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPx, setSelectedPx] = useState(null);

  const fetchPrescriptions = useCallback(async (q = '') => {
    try {
      const res = await api.get(`/pharmacy/prescriptions${q ? `?q=${encodeURIComponent(q)}` : ''}`);
      setPrescriptions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrescriptions(); }, [fetchPrescriptions]);

  useEffect(() => {
    const t = setTimeout(() => fetchPrescriptions(search), 350);
    return () => clearTimeout(t);
  }, [search, fetchPrescriptions]);

  // Group by date
  const grouped = prescriptions.reduce((g, px) => {
    const key = new Date(px.dateIssued).toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    if (!g[key]) g[key] = [];
    g[key].push(px);
    return g;
  }, {});

  if (loading) return (
    <div className="flex flex-col h-full items-center justify-center text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin mb-4 text-teal-500" />
      <p>Loading prescription pipeline…</p>
    </div>
  );

  return (
    <>
      <div className="max-w-5xl mx-auto text-white">

        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="text-teal-400 w-8 h-8" />
              Prescription Pipeline
            </h1>
            <p className="text-slate-400 mt-1">View all issued prescriptions, check medications and patient adherence.</p>
          </div>
          <button onClick={() => fetchPrescriptions(search)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 font-medium text-sm transition-colors">
            <RefreshCw size={15} /> Refresh
          </button>
        </header>

        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center">
              <FileText className="text-teal-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Prescriptions</p>
              <p className="text-2xl font-bold">{prescriptions.length}</p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <Pill className="text-blue-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Medications</p>
              <p className="text-2xl font-bold">
                {prescriptions.reduce((s, px) => s + (px.medications?.length || 0), 0)}
              </p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/15 flex items-center justify-center">
              <AlertTriangle className="text-rose-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Stock Warnings</p>
              <p className="text-2xl font-bold text-rose-400">
                {prescriptions.reduce((s, px) =>
                  s + (px.medications || []).filter(pm => (pm.medication?.inventory?.stockLevel ?? 0) < 50).length, 0
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by patient name or diagnosis…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 focus:border-teal-500 rounded-xl ps-11 pe-4 py-3 text-white outline-none transition-colors placeholder:text-slate-500"
          />
        </div>

        {/* Grouped prescription list */}
        {Object.keys(grouped).length === 0 ? (
          <div className="glass-card p-16 text-center flex flex-col items-center text-slate-500 border-dashed border-2 border-slate-700">
            <FileText className="w-14 h-14 mb-4 opacity-20" />
            <p className="text-xl">No prescriptions found{search ? ` matching "${search}"` : ''}.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([dateKey, pxList]) => (
              <div key={dateKey}>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-3">
                  <span className="flex-1 h-px bg-slate-800" />
                  <Calendar size={12} /> {dateKey}
                  <span className="flex-1 h-px bg-slate-800" />
                </h3>

                <div className="space-y-3">
                  {pxList.map((px, idx) => {
                    const lowStockMeds = (px.medications || []).filter(pm => (pm.medication?.inventory?.stockLevel ?? 0) < 50);
                    const medCount = px.medications?.length || 0;

                    return (
                      <motion.div
                        key={px.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="glass-card p-5 flex items-center justify-between gap-4 hover:border-teal-500/30 transition-colors group"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Patient avatar */}
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500/30 to-blue-500/20 flex items-center justify-center text-sm font-bold text-white border border-slate-700 shrink-0">
                            {px.patient?.user?.firstName?.[0]}{px.patient?.user?.lastName?.[0]}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <p className="font-bold text-white">
                                {px.patient?.user?.firstName} {px.patient?.user?.lastName}
                              </p>
                              <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                                Rx #{px.id}
                              </span>
                              {lowStockMeds.length > 0 && (
                                <span className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                                  <AlertTriangle size={10} /> {lowStockMeds.length} low stock
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-400 truncate">{px.diagnosis}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Dr. {px.doctor?.user?.firstName} {px.doctor?.user?.lastName} ·{' '}
                              {medCount} medication{medCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        {/* Medication stock pills */}
                        <div className="hidden md:flex items-center gap-1.5 shrink-0">
                          {(px.medications || []).slice(0, 3).map(pm => {
                            const stock = pm.medication?.inventory?.stockLevel ?? 0;
                            const cls = stock === 0 ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                              : stock < 50 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                              : 'text-teal-400 border-teal-500/30 bg-teal-500/10';
                            return (
                              <span key={pm.id} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cls}`}>
                                {pm.medication?.name?.split(' ')[0]}
                              </span>
                            );
                          })}
                          {(px.medications?.length || 0) > 3 && (
                            <span className="text-xs text-slate-500">+{px.medications.length - 3}</span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setSelectedPx(px)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-teal-600/15 hover:bg-teal-500 text-teal-400 hover:text-white border border-teal-500/30 rounded-lg text-sm font-medium transition-all"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button
                            onClick={() => { setSelectedPx(px); setTimeout(() => window.print(), 200); }}
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Printer size={14} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedPx && <PrescriptionModal prescription={selectedPx} onClose={() => setSelectedPx(null)} />}
      </AnimatePresence>
    </>
  );
};

export default PharmacyPrescriptions;
