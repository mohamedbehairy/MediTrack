import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  Calendar,
  Users,
  AlertTriangle,
  Clock,
  Package,
  Pill,
  AlertCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FileText,
  ShieldAlert,
  Languages,
  X,
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const Sidebar = ({ mobileOpen = false, onMobileClose }) => {
  const { user, logout } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    onMobileClose?.();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleLanguage = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(next);
  };

  if (!user) return null;

  const doctorLinks = [
    { name: t('nav.overview'), path: '/doctor/dashboard', icon: Activity },
    { name: t('nav.appointments'), path: '/doctor/appointments', icon: Calendar },
    { name: t('nav.patients'), path: '/doctor/patients', icon: Users },
    { name: t('nav.prescribe'), path: '/doctor/prescribe', icon: ShieldAlert },
    { name: t('nav.alerts'), path: '/doctor/alerts', icon: AlertTriangle, alertCounts: 3 },
    { name: t('nav.myProfile'), path: '/doctor/settings', icon: Settings },
  ];

  const patientLinks = [
    { name: t('nav.myTimeline'), path: '/patient/dashboard', icon: Activity },
    { name: t('nav.medications'), path: '/patient/medications', icon: Clock },
    { name: t('nav.bookAppointment'), path: '/book-appointment', icon: Calendar },
    { name: t('nav.myProfile'), path: '/patient/settings', icon: Settings },
  ];

  const pharmacyLinks = [
    { name: t('nav.inventory'), path: '/pharmacy/dashboard', icon: Package },
    { name: 'Medicines', path: '/pharmacy/medicines', icon: Pill },
    { name: 'Drug Interactions', path: '/pharmacy/interactions', icon: AlertCircle },
    { name: t('nav.prescriptions'), path: '/pharmacy/prescriptions', icon: FileText },
    { name: t('nav.patients'), path: '/pharmacy/patients', icon: Users },
  ];

  const hospitalLinks = [
    { name: t('nav.overview'), path: '/hospital/dashboard', icon: Activity },
    { name: t('nav.userManagement'), path: '/hospital/users', icon: Users },
  ];

  let links = [];
  if (user.role === 'DOCTOR') links = doctorLinks;
  else if (user.role === 'PATIENT') links = patientLinks;
  else if (user.role === 'PHARMACIST') links = pharmacyLinks;
  else if (user.role === 'ADMIN') links = hospitalLinks;

  const CollapseIcon = isRTL
    ? isExpanded ? ChevronRight : ChevronLeft
    : isExpanded ? ChevronLeft : ChevronRight;

  const renderNav = (expanded, onNavigate) => (
    <>
      <nav className="p-3 space-y-2 mt-4 flex-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;

          return (
            <Link to={link.path} key={link.name} onClick={onNavigate}>
              <div className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(255,102,0,0.15)]'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
              }`}>
                <Icon size={20} className="shrink-0" />

                {expanded && (
                  <div className="whitespace-nowrap flex-1 flex items-center justify-between overflow-hidden">
                    <span className="font-medium">{link.name}</span>
                    {link.alertCounts > 0 && (
                      <span className="bg-accent-rose text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        {link.alertCounts}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800 space-y-2 shrink-0">
        <button
          onClick={toggleLanguage}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title={t('common.language')}
        >
          <Languages size={20} className="shrink-0" />
          {expanded && (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-medium">{t('common.language')}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border transition-colors ${
                i18n.language === 'ar'
                  ? 'bg-primary/20 text-primary border-primary/40'
                  : 'bg-slate-700 text-slate-300 border-slate-600'
              }`}>
                {i18n.language === 'ar' ? 'AR' : 'EN'}
              </span>
            </div>
          )}
        </button>

        <div
          onClick={() => { logout(); window.location.href = '/login'; }}
          className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer text-slate-400 hover:bg-slate-800 hover:text-accent-rose transition-colors"
        >
          <LogOut size={20} className="shrink-0" />
          {expanded && (
            <span className="whitespace-nowrap font-medium">{t('common.signOut')}</span>
          )}
        </div>
      </div>
    </>
  );

  const slideFrom = isRTL ? '100%' : '-100%';

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <motion.aside
        initial={false}
        animate={{ x: mobileOpen ? 0 : slideFrom }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-50 w-[280px] max-w-[85vw] bg-slate-900/95 backdrop-blur-md border-e border-slate-800 flex flex-col lg:hidden`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <img
              src="/logo.jpeg"
              alt="Logo"
              className="h-10 w-auto rounded-xl shadow-md shrink-0 object-contain border border-slate-700 bg-slate-800"
            />
            <span className="font-bold text-lg tracking-wide text-white">{t('common.appName')}</span>
          </div>
          <button
            onClick={onMobileClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        {renderNav(true, onMobileClose)}
      </motion.aside>

      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isExpanded ? 260 : 80 }}
        className="hidden lg:flex h-screen sticky top-0 shrink-0 bg-slate-900/80 backdrop-blur-md border-e border-slate-800 flex-col justify-between"
      >
        <div className="flex flex-col flex-1 min-h-0">
          <div className="p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2 overflow-hidden">
              <img
                src="/logo.jpeg"
                alt="Logo"
                className="h-10 w-auto rounded-xl shadow-md shrink-0 object-contain border border-slate-700 bg-slate-800"
              />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-bold text-lg tracking-wide whitespace-nowrap text-white"
                  >
                    {t('common.appName')}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
            >
              <CollapseIcon size={18} />
            </button>
          </div>
          {renderNav(isExpanded)}
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
