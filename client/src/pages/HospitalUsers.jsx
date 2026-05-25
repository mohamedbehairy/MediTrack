import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Loader2, Plus, Trash2, X,
  Stethoscope, FlaskConical, Shield, User,
  AlertTriangle, CheckCircle2, UserPlus, ChevronDown
} from 'lucide-react';
import { api } from '../lib/axios';

/* ── Role config ───────────────────────────────────────────────────────────── */
const ROLES = [
  { key: 'ALL',        label: 'All Users',   icon: Users,       color: 'text-slate-300',  bg: 'bg-slate-700/50',   border: 'border-slate-600/40' },
  { key: 'DOCTOR',     label: 'Doctors',     icon: Stethoscope, color: 'text-blue-400',   bg: 'bg-blue-500/15',    border: 'border-blue-500/25' },
  { key: 'PATIENT',    label: 'Patients',    icon: User,        color: 'text-teal-400',   bg: 'bg-teal-500/15',    border: 'border-teal-500/25' },
  { key: 'PHARMACIST', label: 'Pharmacists', icon: FlaskConical,color: 'text-purple-400', bg: 'bg-purple-500/15',  border: 'border-purple-500/25' },
  { key: 'ADMIN',      label: 'Admins',      icon: Shield,      color: 'text-orange-400', bg: 'bg-orange-500/15',  border: 'border-orange-500/25' },
];

const roleMeta = (role) => ROLES.find(r => r.key === role) || ROLES[0];

/* ── Delete confirmation modal ─────────────────────────────────────────────── */
const DeleteModal = ({ user, onConfirm, onClose, loading }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-2xl shadow-2xl p-6"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-rose-500/15 flex items-center justify-center">
          <AlertTriangle className="text-rose-400 w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-white">Delete User</h2>
          <p className="text-slate-400 text-sm">This action cannot be undone.</p>
        </div>
      </div>

      <p className="text-slate-300 text-sm mb-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
        Permanently delete <strong className="text-white">{user.firstName} {user.lastName}</strong> ({user.email})?
        All related appointments, prescriptions and adherence records will also be removed.
      </p>

      <div className="flex gap-3">
        <button onClick={onClose}
          className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-medium text-slate-300 transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          {loading ? 'Deleting…' : 'Delete User'}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

/* ── Create user modal ─────────────────────────────────────────────────────── */
const CreateModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'PATIENT' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.post('/auth/register', form);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  const field = (label, name, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type={type} name={name} required placeholder={placeholder}
        value={form[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        className="w-full bg-slate-800 border border-slate-700 focus:border-primary rounded-xl px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-600"
      />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserPlus className="text-primary w-5 h-5" /> Register New User
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-center gap-2">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('First Name', 'firstName', 'text', 'John')}
            {field('Last Name',  'lastName',  'text', 'Doe')}
          </div>
          {field('Email Address', 'email', 'email', 'name@hospital.com')}
          {field('Temporary Password', 'password', 'password', '••••••••')}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Platform Role</label>
            <div className="relative">
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full appearance-none bg-slate-800 border border-slate-700 focus:border-primary rounded-xl px-4 py-3 text-white outline-none transition-colors"
              >
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
                <option value="PHARMACIST">Pharmacist</option>
                <option value="ADMIN">Admin</option>
              </select>
              <ChevronDown size={16} className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-medium text-slate-300 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <><Loader2 size={15} className="animate-spin" /> Creating…</> : <><UserPlus size={15} /> Create User</>}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

/* ── Main page ─────────────────────────────────────────────────────────────── */
const HospitalUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (search) params.set('q', search);
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(fetchUsers, 350);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${deleteTarget.id}`);
      showToast(`"${deleteTarget.firstName} ${deleteTarget.lastName}" deleted.`);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Role counts for tab badges
  const counts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});
  const totalVisible = users.length;

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className={`fixed top-5 end-5 z-50 px-5 py-3 rounded-xl font-medium shadow-2xl border flex items-center gap-2
              ${toast.type === 'error' ? 'bg-rose-900/90 border-rose-500 text-rose-200' : 'bg-emerald-900/90 border-emerald-500 text-emerald-200'}`}
          >
            {toast.type === 'error' ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto text-white">

        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="text-primary w-8 h-8" /> User Management
            </h1>
            <p className="text-slate-400 mt-1">Register, view and remove all platform users.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105"
          >
            <UserPlus size={17} /> New User
          </button>
        </header>

        {/* Role tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {ROLES.map(({ key, label, icon: Icon, color, bg, border }) => {
            const count = key === 'ALL' ? Object.values(counts).reduce((a, b) => a + b, 0) : (counts[key] || 0);
            const active = roleFilter === key;
            return (
              <button
                key={key}
                onClick={() => setRoleFilter(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                  active ? `${bg} ${border} ${color}` : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={14} />
                {label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/15' : 'bg-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 focus:border-primary rounded-xl ps-11 pe-4 py-3 text-white outline-none transition-colors placeholder:text-slate-500"
          />
        </div>

        {/* User list */}
        {loading ? (
          <div className="flex justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : totalVisible === 0 ? (
          <div className="glass-card p-16 text-center flex flex-col items-center text-slate-500 border-dashed border-2 border-slate-700">
            <Users className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">No users found{search ? ` matching "${search}"` : ''}.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {users.map((user, idx) => {
                const meta = roleMeta(user.role);
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={user.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ delay: idx * 0.03 }}
                    className="glass-card p-4 flex items-center gap-4 group hover:border-white/15 transition-colors"
                  >
                    {/* Avatar */}
                    <div className={`w-11 h-11 rounded-full ${meta.bg} flex items-center justify-center text-sm font-bold ${meta.color} border ${meta.border} shrink-0`}>
                      {user.firstName[0]}{user.lastName[0]}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.border} ${meta.color}`}>
                          <Icon size={10} /> {user.role}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm truncate">{user.email}</p>
                    </div>

                    {/* Date */}
                    <span className="hidden md:block text-xs text-slate-500 shrink-0">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>

                    {/* Delete */}
                    <button
                      onClick={() => setDeleteTarget(user)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-500 transition-all shrink-0"
                      title="Delete user"
                    >
                      <Trash2 size={15} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* Modals */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            user={deleteTarget}
            loading={deleting}
            onConfirm={handleDelete}
            onClose={() => setDeleteTarget(null)}
          />
        )}
        {showCreate && (
          <CreateModal
            onClose={() => setShowCreate(false)}
            onCreated={() => { showToast('User created successfully!'); fetchUsers(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default HospitalUsers;
