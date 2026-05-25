import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatBot from '../chat/ChatBot';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DashboardLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <div className="flex h-screen bg-gradient-secondary overflow-hidden">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <img
            src="/logo.jpeg"
            alt="Logo"
            className="h-8 w-auto rounded-lg object-contain border border-slate-700"
          />
          <span className="font-bold text-white truncate">{t('common.appName')}</span>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full relative">
          <div className="absolute top-[-20%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[0%] right-[-10%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-accent-blue/10 rounded-full blur-[120px] pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 sm:p-6 md:p-10 relative z-10 mx-auto max-w-7xl w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      <ChatBot />
    </div>
  );
};

export default DashboardLayout;
