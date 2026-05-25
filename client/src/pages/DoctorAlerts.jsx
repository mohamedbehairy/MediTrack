import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle, Bell, CheckCircle, TrendingDown,
  User, Pill, Loader2, ShieldAlert, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { api } from '../lib/axios';

const AlertCard = ({ alert, index }) => {
  const { t } = useTranslation();

  const SEVERITY_CONFIG = {
    LOW_ADHERENCE: { color: 'rose',   icon: TrendingDown, labelKey: 'doctorAlerts.lowAdherenceLabel' },
    INTERACTION:   { color: 'amber',  icon: ShieldAlert,  labelKey: 'doctorAlerts.drugInteraction' },
    MISSED_DOSE:   { color: 'orange', icon: Bell,         labelKey: 'doctorAlerts.missedDoses' },
  };

  const cfg = SEVERITY_CONFIG[alert.type] || SEVERITY_CONFIG.LOW_ADHERENCE;
  const Icon = cfg.icon;
  const clr = cfg.color;

  const colorMap = {
    rose:   { bg: 'bg-rose-500/10',   border: 'border-rose-500/30',   text: 'text-rose-400',   badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  text: 'text-amber-400',  badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  }[clr];

  return (
    <motion.div
      key={alert.patientId + alert.type + index}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className={`glass-card p-5 border-s-4 ${colorMap.border.replace('border', 'border-s')}`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl ${colorMap.bg} flex items-center justify-center shrink-0 mt-0.5`}>
          <Icon className={`w-5 h-5 ${colorMap.text}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${colorMap.badge}`}>
              {t(cfg.labelKey)}
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold text-white">
              <User size={14} className="text-slate-400" />
              {alert.patientName}
            </span>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">{alert.message}</p>

          {alert.medicationName && (
            <div className="mt-2 flex items-center gap-2">
              <Pill size={13} className="text-slate-500" />
              <span className="text-xs text-slate-400">{t('doctorAlerts.medication')} <strong className="text-slate-200">{alert.medicationName}</strong></span>
              {alert.adherencePercentage !== undefined && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colorMap.badge} border`}>
                  {alert.adherencePercentage}% {t('patientDetail.adherence')}
                </span>
              )}
            </div>
          )}
        </div>

        <Link
          to="/doctor/patients"
          className="shrink-0 p-2 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-white transition-colors"
        >
          <ChevronRight size={18} />
        </Link>
      </div>
    </motion.div>
  );
};

const DoctorAlerts = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get(`/doctors/${user.id}/dashboard`);
        setAlerts(res.data.alerts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchAlerts();
  }, [user]);

  if (loading) return (
    <div className="flex flex-col h-full items-center justify-center text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin mb-4" />
      {t('doctorAlerts.scanningData')}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto text-white">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bell className="text-rose-400 w-8 h-8" />
          {t('doctorAlerts.clinicalAlerts')}
        </h1>
        <p className="text-slate-400 mt-2">{t('doctorAlerts.realTimeNotifications')}</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">{t('doctorAlerts.totalAlerts')}</p>
            <p className="text-2xl font-bold text-rose-400">{alerts.length}</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">{t('doctorAlerts.lowAdherence')}</p>
            <p className="text-2xl font-bold text-amber-400">
              {alerts.filter(a => a.type === 'LOW_ADHERENCE').length}
            </p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">{t('doctorAlerts.patientsAffected')}</p>
            <p className="text-2xl font-bold text-emerald-400">
              {new Set(alerts.map(a => a.patientId)).size}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {alerts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-card p-16 text-center flex flex-col items-center text-slate-500 border-dashed border-2 border-slate-700"
          >
            <CheckCircle className="w-14 h-14 mb-4 text-emerald-500 opacity-40" />
            <p className="text-xl font-medium text-emerald-400">{t('doctorAlerts.allClear')}</p>
            <p className="text-sm mt-2">{t('doctorAlerts.noActiveAlerts')}</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, idx) => (
              <AlertCard key={idx} alert={alert} index={idx} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorAlerts;
