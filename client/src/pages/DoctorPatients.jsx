import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Users, Search, ChevronRight, AlertTriangle,
  CheckCircle2, Pill, Clock, User, Heart, Loader2
} from 'lucide-react';
import { api } from '../lib/axios';
import PatientDetailDrawer from '../components/PatientDetailDrawer';

const AdherenceBadge = ({ pct }) => {
  const { t } = useTranslation();
  if (pct === null) return (
    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{t('doctorPatients.noData')}</span>
  );
  const color = pct >= 80 ? 'emerald' : pct >= 50 ? 'amber' : 'rose';
  const cls = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber:   'bg-amber-500/10  text-amber-400  border-amber-500/30',
    rose:    'bg-rose-500/10   text-rose-400   border-rose-500/30',
  }[color];
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cls}`}>
      {pct}% {t('doctorPatients.adherence')}
    </span>
  );
};

const DoctorPatients = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [searching, setSearching] = useState(false);

  const fetchPatients = useCallback(async (q = '') => {
    setSearching(true);
    try {
      const res = await api.get(`/patients${q ? `?q=${encodeURIComponent(q)}` : ''}`);
      setPatients(res.data);
    } catch (err) {
      console.error('Failed to load patients', err);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  useEffect(() => {
    const timer = setTimeout(() => fetchPatients(search), 350);
    return () => clearTimeout(timer);
  }, [search, fetchPatients]);

  if (loading) return (
    <div className="flex flex-col h-full items-center justify-center text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin mb-4" />
      {t('doctorPatients.loadingPatientRegistry')}
    </div>
  );

  return (
    <>
      <div className="max-w-6xl mx-auto text-white">

        <header className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="text-primary w-8 h-8" />
            {t('doctorPatients.patientDirectory')}
          </h1>
          <p className="text-slate-400 mt-2">{t('doctorPatients.fullUnifiedView')}</p>
        </header>

        <div className="relative mb-8">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            placeholder={t('doctorPatients.searchByNameOrEmail')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 focus:border-primary rounded-xl ps-12 pe-4 py-4 text-white outline-none transition-colors placeholder:text-slate-500 text-base shadow-inner"
          />
          {searching && (
            <Loader2 className="absolute end-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5 animate-spin" />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-slate-400">{t('doctorPatients.totalPatients')}</p>
              <p className="text-xl font-bold">{patients.length}</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">{t('doctorPatients.lowAdherence')}</p>
              <p className="text-xl font-bold text-rose-400">
                {patients.filter(p => p.overallAdherence !== null && p.overallAdherence < 50).length}
              </p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">{t('doctorPatients.highAdherence')}</p>
              <p className="text-xl font-bold text-emerald-400">
                {patients.filter(p => p.overallAdherence !== null && p.overallAdherence >= 80).length}
              </p>
            </div>
          </div>
        </div>

        {patients.length === 0 ? (
          <div className="glass-card p-16 text-center flex flex-col items-center text-slate-500 border-dashed border-2 border-slate-700">
            <User className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">{t('doctorPatients.noPatients')}{search ? ` matching "${search}"` : ''}.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {patients.map((patient, idx) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => setSelectedPatientId(patient.userId)}
                className="glass-card glass-card-hover p-5 flex items-center justify-between gap-4 cursor-pointer group transition-all hover:border-primary/40"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent-blue/30 flex items-center justify-center text-sm font-bold text-white border border-slate-700 shrink-0">
                    {patient.user.firstName[0]}{patient.user.lastName[0]}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-white text-lg leading-none">
                        {patient.user.firstName} {patient.user.lastName}
                      </h3>
                      <AdherenceBadge pct={patient.overallAdherence} />
                      {patient.overallAdherence !== null && patient.overallAdherence < 50 && (
                        <span className="flex items-center gap-1 text-xs text-rose-400 font-medium animate-pulse">
                          <AlertTriangle size={12} /> {t('doctorPatients.needsAttention')}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm truncate mt-0.5">{patient.user.email}</p>
                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Pill size={11} /> {patient.prescriptions.length} {t('doctorPatients.prescriptions')}</span>
                      {patient.appointments.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {t('doctorPatients.lastVisit')} {new Date(patient.appointments[0].date).toLocaleDateString()}
                        </span>
                      )}
                      {patient.bloodType && (
                        <span className="flex items-center gap-1"><Heart size={11} /> {patient.bloodType}</span>
                      )}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-primary transition-colors shrink-0" />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <PatientDetailDrawer
        patientId={selectedPatientId}
        isOpen={!!selectedPatientId}
        onClose={() => setSelectedPatientId(null)}
      />
    </>
  );
};

export default DoctorPatients;
