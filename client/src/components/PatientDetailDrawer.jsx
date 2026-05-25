import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  X, AlertTriangle, Pill, Calendar, FileText, Loader2, Heart, Activity, User
} from 'lucide-react';
import { api } from '../lib/axios';
import { Link } from 'react-router-dom';

const AdherenceBadge = ({ pct }) => {
  const { t } = useTranslation();
  if (pct === null) return (
    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{t('patientDetail.adherence', 'No data')}</span>
  );
  const color = pct >= 80 ? 'emerald' : pct >= 50 ? 'amber' : 'rose';
  const cls = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber:   'bg-amber-500/10  text-amber-400  border-amber-500/30',
    rose:    'bg-rose-500/10   text-rose-400   border-rose-500/30',
  }[color];
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cls}`}>
      {pct}% adherence
    </span>
  );
};

const PatientDetailDrawer = ({ patientId, isOpen, onClose }) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && patientId) {
      const fetchPatient = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/patients/${patientId}`);
          setPatient(res.data);
        } catch (err) {
          console.error('Failed to fetch patient details', err);
        } finally {
          setLoading(false);
        }
      };
      fetchPatient();
    }
  }, [isOpen, patientId]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end"
        onClick={onClose}
      >
        <motion
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full max-w-2xl h-full bg-slate-900 border-l border-slate-800 overflow-y-auto flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
               <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
               <p className="text-lg">Fetching complete records...</p>
             </div>
          ) : !patient ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
                <p>Patient not found or unauthorized.</p>
                <button onClick={onClose} className="mt-4 text-primary font-bold">Close Drawer</button>
             </div>
          ) : (
            <>
              {/* Header */}
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/40 to-accent-blue/40 flex items-center justify-center text-xl font-bold text-white border border-slate-700">
                    {patient.user.firstName[0]}{patient.user.lastName[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{patient.user.firstName} {patient.user.lastName}</h2>
                    <p className="text-slate-400 text-sm">{patient.user.email}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-8 flex-1">
                {/* Vital Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 text-center shadow-lg">
                    <Heart className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider font-bold">Blood Type</p>
                    <p className="font-bold text-white">{patient.bloodType || '—'}</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 text-center shadow-lg">
                    <Activity className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider font-bold">Avg. Adherence</p>
                    <p className="font-bold text-white">
                      {patient.prescriptions?.[0]?.medications?.[0]?.adherenceMetrics?.percentage || '0'}%
                    </p>
                  </div>
                  <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 text-center shadow-lg">
                    <FileText className="w-5 h-5 text-accent-blue mx-auto mb-1" />
                    <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider font-bold">History Entries</p>
                    <p className="font-bold text-white">{patient.prescriptions?.length || 0}</p>
                  </div>
                </div>

                {/* Medical History */}
                <div>
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText size={14} className="text-primary" /> Clinical History & Notes
                  </h3>
                  <p className="text-slate-300 text-sm bg-slate-800/50 p-4 rounded-xl border border-slate-700 leading-relaxed min-h-[80px]">
                    {patient.medicalHistory || 'No baseline medical history recorded for this patient.'}
                  </p>
                </div>

                {/* Active Prescriptions */}
                <div>
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Pill size={14} className="text-emerald-400" /> Active Prescriptions
                  </h3>
                  {(!patient.prescriptions || patient.prescriptions.length === 0) ? (
                    <div className="p-8 text-center bg-slate-800/30 rounded-xl border border-slate-800 border-dashed">
                       <p className="text-slate-500 text-sm italic">No active prescriptions on record.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {patient.prescriptions.map(px => (
                        <div key={px.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-bold text-white text-lg">{px.diagnosis}</h4>
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                <User size={10} /> Prescribed by Dr. {px.doctor?.user?.firstName} {px.doctor?.user?.lastName} ·{' '}
                                <Calendar size={10} className="ml-1" /> {new Date(px.dateIssued).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {px.medications.map(pm => (
                              <div key={pm.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                                 <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                     <Pill size={14} />
                                   </div>
                                   <div>
                                     <p className="text-sm font-bold text-white">{pm.medication.name}</p>
                                     <p className="text-[10px] text-slate-500">{pm.dosage} · {pm.frequency}</p>
                                   </div>
                                 </div>
                                 <AdherenceBadge pct={pm.adherenceMetrics?.percentage} />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Appointment history */}
                <div>
                   <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                     <Calendar size={14} className="text-accent-blue" /> Appointment History
                   </h3>
                   <div className="space-y-3">
                     {patient.appointments?.slice(0, 3).map(apt => (
                       <div key={apt.id} className="bg-slate-800/30 px-4 py-3 rounded-lg border border-slate-800 flex justify-between items-center text-sm">
                          <div>
                            <p className="text-white font-medium">{new Date(apt.date).toLocaleDateString()}</p>
                            <p className="text-xs text-slate-500">Dr. {apt.doctor?.user?.lastName}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            apt.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'
                          }`}>
                            {apt.status}
                          </span>
                       </div>
                     ))}
                     {(!patient.appointments || patient.appointments.length === 0) && (
                       <p className="text-slate-500 text-xs italic">No past appointments recorded.</p>
                     )}
                   </div>
                </div>

                {/* Footer Action */}
                <div className="pt-6 border-t border-slate-800">
                  <Link
                    to="/doctor/prescribe"
                    state={{ preSelectedPatientId: patient.userId }}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-primary hover:bg-orange-600 text-white font-extrabold rounded-2xl shadow-[0_8px_30px_rgba(255,102,0,0.2)] transition-all transform hover:-translate-y-0.5"
                  >
                    <Pill size={18} /> New Prescription
                  </Link>
                </div>
              </div>
            </>
          )}
        </motion>
      </motion>
    </AnimatePresence>
  );
};

export default PatientDetailDrawer;
