import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Calendar as CalendarIcon, Clock, CheckCircle, XCircle, Loader2,
  Plus, Search, FileEdit, X, AlertTriangle, Pill
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { api } from '../lib/axios';

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const cfg = {
    SCHEDULED: 'bg-primary/10  text-primary  border-primary/30',
    COMPLETED:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    CANCELLED:  'bg-rose-500/10 text-rose-400 border-rose-500/30',
  }[status] || 'bg-slate-800 text-slate-400 border-slate-700';
  const labels = {
    SCHEDULED: t('doctorAppointments.scheduled'),
    COMPLETED: t('doctorAppointments.completed'),
    CANCELLED: t('doctorAppointments.cancelled'),
  };
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cfg}`}>
      {labels[status] || status}
    </span>
  );
};

const BookModal = ({ doctorUserId, onClose, onBooked }) => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [loadingPts, setLoadingPts] = useState(true);
  const [form, setForm] = useState({ patientId: '', date: '', time: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/patients').then(r => setPatients(r.data)).finally(() => setLoadingPts(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.date || !form.time) { setError(t('doctorAppointments.fillAllFields')); return; }
    setSaving(true); setError('');
    try {
      const datetime = `${form.date}T${form.time}:00`;
      const res = await api.post('/appointments', {
        patientId: parseInt(form.patientId),
        doctorId: doctorUserId,
        date: datetime,
        notes: form.notes || null,
      });
      onBooked(res.data.appointment);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || t('doctorAppointments.failedBook'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="text-primary w-5 h-5" /> {t('doctorAppointments.bookNewAppointment')}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm flex items-center gap-2">
              <AlertTriangle size={15} /> {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">{t('doctorAppointments.patient')} <span className="text-rose-400">*</span></label>
            {loadingPts ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm"><Loader2 size={14} className="animate-spin" /> {t('doctorAppointments.loadingPatients')}</div>
            ) : (
              <select
                value={form.patientId}
                onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition-colors"
                required
              >
                <option value="">{t('doctorAppointments.selectPatient')}</option>
                {patients.map(p => (
                  <option key={p.id} value={p.user.id}>
                    {p.user.firstName} {p.user.lastName} — {p.user.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">{t('doctorAppointments.date')} <span className="text-rose-400">*</span></label>
              <input
                type="date"
                value={form.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">{t('doctorAppointments.time')} <span className="text-rose-400">*</span></label>
              <input
                type="time"
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">{t('doctorAppointments.notes')} <span className="text-slate-600">({t('common.optional')})</span></label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder={t('doctorAppointments.reasonForVisit')}
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition-colors resize-none placeholder:text-slate-600"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-medium transition-colors text-slate-300">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(255,102,0,0.25)] transition-all disabled:opacity-60">
              {saving ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> {t('doctorAppointments.booking')}</span> : t('doctorAppointments.confirmAppointment')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const NotesEditor = ({ appointmentId, initialNotes, onSaved }) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes || '');
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/appointments/${appointmentId}/notes`, { notes });
      onSaved(notes);
      setEditing(false);
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  if (!editing) return (
    <div className="flex items-center gap-2 group/notes">
      <p className="text-slate-400 text-sm flex-1">{notes || <span className="italic text-slate-600">{t('doctorAppointments.noNotes')}</span>}</p>
      <button onClick={() => setEditing(true)} className="opacity-0 group-hover/notes:opacity-100 transition-opacity p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300">
        <FileEdit size={13} />
      </button>
    </div>
  );

  return (
    <div className="flex items-end gap-2 mt-1">
      <textarea
        ref={ref}
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={2}
        className="flex-1 bg-slate-900 border border-primary/50 rounded-lg px-3 py-2 text-white text-sm outline-none resize-none"
        onKeyDown={e => { if (e.key === 'Escape') setEditing(false); if (e.key === 'Enter' && e.ctrlKey) save(); }}
      />
      <div className="flex flex-col gap-1">
        <button onClick={save} disabled={saving} className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors">
          {saving ? '…' : t('common.save')}
        </button>
        <button onClick={() => setEditing(false)} className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-600 transition-colors">
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );
};

const DoctorAppointments = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('SCHEDULED');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchAppointments = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/appointments/doctor/${user.id}`);
      setAppointments(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch { alert('Error updating appointment status'); }
  };

  const handleNotesSaved = (id, notes) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, notes } : a));
  };

  const handleBooked = () => { fetchAppointments(); };

  if (loading) return (
    <div className="flex flex-col h-full items-center justify-center text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin mb-4" />
      {t('doctorAppointments.loadingSchedule')}
    </div>
  );

  const counts = { SCHEDULED: 0, COMPLETED: 0, CANCELLED: 0 };
  appointments.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });

  const filtered = appointments.filter(a => {
    if (a.status !== filter) return false;
    if (search) {
      const name = `${a.patient.user.firstName} ${a.patient.user.lastName}`.toLowerCase();
      const email = (a.patient.user.email || '').toLowerCase();
      if (!name.includes(search.toLowerCase()) && !email.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const grouped = filtered.reduce((g, a) => {
    const key = new Date(a.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!g[key]) g[key] = [];
    g[key].push(a);
    return g;
  }, {});

  const statusColor = { SCHEDULED: '#f97316', COMPLETED: '#10b981', CANCELLED: '#f43f5e' };

  const statusLabels = {
    SCHEDULED: t('doctorAppointments.scheduled'),
    COMPLETED:  t('doctorAppointments.completed'),
    CANCELLED:  t('doctorAppointments.cancelled'),
  };

  return (
    <>
      <div className="max-w-6xl mx-auto text-white">

        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <CalendarIcon className="text-primary w-8 h-8" />
              {t('doctorAppointments.appointmentSchedule')}
            </h1>
            <p className="text-slate-400 mt-1">{t('doctorAppointments.manageConsultations')}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(255,102,0,0.3)] transition-all hover:scale-105"
          >
            <Plus size={18} /> {t('doctorAppointments.bookAppointment')}
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: t('doctorAppointments.scheduled'), key: 'SCHEDULED', icon: Clock, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
            { label: t('doctorAppointments.completed'), key: 'COMPLETED', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { label: t('doctorAppointments.cancelled'), key: 'CANCELLED', icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
          ].map(({ label, key, icon: Icon, color, bg, border }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`glass-card p-5 flex items-center gap-4 transition-all hover:scale-[1.02] ${filter === key ? `ring-2 ring-offset-1 ring-offset-slate-950 ${border.replace('border', 'ring')}` : ''}`}
            >
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div className="text-start">
                <p className="text-xs text-slate-400">{label}</p>
                <p className={`text-3xl font-extrabold ${color}`}>{counts[key]}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder={t('doctorAppointments.searchPatient')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 focus:border-primary rounded-xl ps-11 pe-4 py-3 text-white outline-none transition-colors placeholder:text-slate-500"
            />
          </div>
          <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800 shrink-0 overflow-x-auto max-w-full">
            {['SCHEDULED', 'COMPLETED', 'CANCELLED'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${filter === f ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
              >
                {statusLabels[f]}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {Object.keys(grouped).length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-card p-16 text-center flex flex-col items-center text-slate-500 border-dashed border-2 border-slate-700"
            >
              <CalendarIcon className="w-14 h-14 mb-4 opacity-20" />
              <p className="text-xl font-medium">{t('doctorAppointments.noAppointments', { status: statusLabels[filter].toLowerCase() })}{search ? ` matching "${search}"` : ''}.</p>
              {filter === 'SCHEDULED' && (
                <button onClick={() => setShowModal(true)} className="mt-6 flex items-center gap-2 px-5 py-3 bg-primary/20 hover:bg-primary text-primary hover:text-white border border-primary/40 rounded-xl transition-all font-medium text-sm">
                  <Plus size={16} /> {t('doctorAppointments.bookFirst')}
                </button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-10">
              {Object.keys(grouped).map(dateKey => (
                <motion.div key={dateKey} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest sticky top-0 bg-slate-950 py-2 z-10 flex items-center gap-3">
                    <span className="flex-1 h-px bg-slate-800" />
                    {dateKey}
                    <span className="flex-1 h-px bg-slate-800" />
                  </h3>

                  <div className="space-y-3">
                    {grouped[dateKey].map(apt => (
                      <motion.div
                        key={apt.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        className="glass-card overflow-hidden group"
                        style={{ borderInlineStart: `4px solid ${statusColor[apt.status]}` }}
                      >
                        <div className="p-5 flex flex-col md:flex-row gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-slate-700 flex items-center justify-center text-sm font-bold text-white border border-slate-700 shrink-0">
                              {apt.patient.user.firstName[0]}{apt.patient.user.lastName[0]}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h4 className="text-lg font-bold text-white">
                                  {apt.patient.user.firstName} {apt.patient.user.lastName}
                                </h4>
                                <StatusBadge status={apt.status} />
                                <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Clock size={11} />
                                  {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mb-2">{apt.patient.user.email}</p>
                              <NotesEditor
                                appointmentId={apt.id}
                                initialNotes={apt.notes}
                                onSaved={(notes) => handleNotesSaved(apt.id, notes)}
                              />
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col items-center justify-end gap-2 shrink-0">
                            {apt.status === 'SCHEDULED' && (
                              <>
                                <button
                                  onClick={() => updateStatus(apt.id, 'COMPLETED')}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/40 rounded-lg transition-all text-sm font-medium w-full justify-center"
                                >
                                  <CheckCircle size={15} /> {t('doctorAppointments.complete')}
                                </button>
                                <button
                                  onClick={() => updateStatus(apt.id, 'CANCELLED')}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/40 rounded-lg transition-all text-sm font-medium w-full justify-center"
                                >
                                  <XCircle size={15} /> {t('doctorAppointments.cancel')}
                                </button>
                                <Link
                                  to="/doctor/prescribe"
                                  state={{ preSelectedPatientId: apt.patient.user.id }}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-all text-sm font-medium w-full justify-center"
                                >
                                  <Pill size={15} /> {t('doctorAppointments.prescribe')}
                                </Link>
                              </>
                            )}
                            {apt.status !== 'SCHEDULED' && (
                              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium
                                ${apt.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                                {apt.status === 'COMPLETED' ? <CheckCircle size={15} /> : <XCircle size={15} />}
                                {apt.status === 'COMPLETED' ? t('doctorAppointments.completed') : t('doctorAppointments.cancelled')}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showModal && (
          <BookModal
            doctorUserId={user.id}
            onClose={() => setShowModal(false)}
            onBooked={handleBooked}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default DoctorAppointments;
