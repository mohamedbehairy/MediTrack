import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { User, CheckCircle2, Shield, Heart, FileText, Calendar } from 'lucide-react';
import { api } from '../lib/axios';
import useAuthStore from '../store/useAuthStore';

const PatientSettings = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [patientData, setPatientData] = useState(null);
  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/patients/${user.id}`);
        setPatientData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (user?.id) fetchProfile();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    const data = new FormData(e.target);
    const payload = Object.fromEntries(data.entries());

    try {
      await api.put('/patients/profile', payload);
      setStatus({ type: 'success', message: t('patientSettings.profileUpdated') });
      // Update local state and auth store if necessary, though we'll just refetch here
      const updated = await api.get(`/patients/${user.id}`);
      setPatientData(updated.data);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.response?.data?.message || t('patientSettings.failedUpdate') });
    } finally {
      setLoading(false);
    }
  };

  if (!patientData) return (
    <div className="flex flex-col items-center justify-center p-20 text-slate-400">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
      <p>{t('doctorSettings.loadingProfile')}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto text-white">
      <header className="mb-10">
        <h1 className="text-3xl font-black flex items-center gap-4">
          <User className="text-primary w-8 h-8" />
          General Account Settings
        </h1>
        <p className="text-slate-400 mt-2 font-medium italic">Manage your patient demographics and accessibility credentials.</p>
      </header>

      {status.message && (
        <div className={`p-5 rounded-2xl mb-10 border ${status.type === 'error' ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'} flex items-center gap-4 shadow-lg`}>
          {status.type === 'success' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <Shield className="w-6 h-6 shrink-0" />}
          <span className="font-bold">{status.message}</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-10">
        {/* Personal Info */}
        <section className="bg-slate-900/40 p-10 rounded-[32px] glass-card border-white/5 space-y-8 shadow-2xl">
           <div className="flex items-center gap-3 border-b border-white/10 pb-6 mb-2">
              <User className="text-slate-500 w-5 h-5"/>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Demographics</h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                <input name="firstName" defaultValue={user.firstName} className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold shadow-inner" required />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                <input name="lastName" defaultValue={user.lastName} className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold shadow-inner" required />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                   <Heart size={12} className="text-rose-500" /> Blood Type
                </label>
                <select name="bloodType" defaultValue={patientData.bloodType || ""} className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-primary outline-none font-bold shadow-inner">
                   <option value="" disabled>Select Blood Type</option>
                   <option value="A+">A+</option>
                   <option value="B+">B+</option>
                   <option value="O+">O+</option>
                   <option value="AB+">AB+</option>
                   <option value="A-">A-</option>
                   <option value="B-">B-</option>
                   <option value="O-">O-</option>
                   <option value="AB-">AB-</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                   <Calendar size={12} className="text-accent-blue" /> Date of Birth
                </label>
                <input name="dateOfBirth" type="date" defaultValue={patientData.dateOfBirth ? new Date(patientData.dateOfBirth).toISOString().split('T')[0] : ""} className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-primary outline-none font-bold shadow-inner" />
              </div>
           </div>
        </section>

        {/* Medical Section */}
        <section className="bg-slate-900/40 p-10 rounded-[32px] glass-card border-white/5 space-y-8 shadow-2xl">
           <div className="flex items-center gap-3 border-b border-white/10 pb-6 mb-2">
              <FileText className="text-slate-500 w-5 h-5"/>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Clinical Background</h2>
           </div>
           
           <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Current Conditions / History</label>
              <textarea 
                name="medicalHistory" 
                defaultValue={patientData.medicalHistory} 
                rows={4}
                placeholder="Disclose any known allergies, chronic conditions, or past surgeries..."
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-primary outline-none font-medium shadow-inner leading-relaxed"
              />
           </div>
        </section>

        {/* Security Section */}
        <section className="bg-slate-900/40 p-10 rounded-[32px] glass-card border-white/5 space-y-8 shadow-2xl">
           <div className="flex items-center gap-3 border-b border-white/10 pb-6 mb-2">
              <Shield className="text-slate-500 w-5 h-5"/>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Security & Privacy</h2>
           </div>
           
           <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">New Account Password</label>
              <input 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-primary outline-none font-bold shadow-inner"
              />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter ml-1">Leave empty to retain your current cryptographic key.</p>
           </div>
        </section>

        <div className="flex justify-center pt-10">
           <button 
             type="submit" 
             disabled={loading}
             className="w-full max-w-md py-5 bg-primary hover:bg-orange-600 text-white font-black rounded-[24px] shadow-[0_20px_40px_rgba(255,102,0,0.2)] transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm"
           >
             {loading ? <span className="animate-pulse">Rewriting Identity...</span> : 'Commit Profile Changes'}
           </button>
        </div>
      </form>
    </div>
  );
};

export default PatientSettings;
