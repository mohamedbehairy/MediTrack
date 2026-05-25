import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck, Clock, ActivitySquare, ArrowRight, Star,
  Users, Calendar, Pill, Heart, CheckCircle, ChevronDown,
  Stethoscope, Building2, FlaskConical, Zap, Globe, Lock
} from 'lucide-react';

/* ─── Animated gradient orb ──────────────────────────────────────────────── */
const Orb = ({ className, animate: anim }) => (
  <motion.div className={`absolute rounded-full blur-[120px] pointer-events-none ${className}`} animate={anim} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
);

/* ─── Floating particle ──────────────────────────────────────────────────── */
const Particle = ({ x, y, size, delay }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: 'rgba(32,201,168,0.25)', filter: 'blur(1px)' }}
    animate={{ y: [0, -24, 0], opacity: [0.15, 0.5, 0.15] }}
    transition={{ duration: 5 + Math.random() * 4, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: 3 + Math.random() * 7, delay: Math.random() * 5,
}));

/* ─── Stat counter ───────────────────────────────────────────────────────── */
const Counter = ({ from = 0, to, suffix = '', duration = 2 }) => {
  const [val, setVal] = useState(from);
  const ref = useRef(false);
  const nodeRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !ref.current) {
        ref.current = true;
        const steps = 60;
        const step = (to - from) / steps;
        let cur = from;
        const t = setInterval(() => {
          cur += step;
          if (cur >= to) { setVal(to); clearInterval(t); } else setVal(Math.floor(cur));
        }, (duration * 1000) / steps);
      }
    }, { threshold: 0.5 });
    if (nodeRef.current) observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }, [from, to, duration]);

  return <span ref={nodeRef}>{val.toLocaleString()}{suffix}</span>;
};

/* ─── Section fade-in wrapper ────────────────────────────────────────────── */
const FadeIn = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.7, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ─── Main landing page ──────────────────────────────────────────────────── */
const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const { scrollYProgress } = useScroll();
  const navOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);

  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');

  return (
    <div className="min-h-screen bg-[#050d1a] text-white overflow-x-hidden font-sans">

      {/* ── Sticky nav ─────────────────────────────────────────────────── */}
      <motion.nav
        style={{ backgroundColor: `rgba(5,13,26,${navOpacity.get()})` }}
        className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-14 py-4 backdrop-blur-md border-b border-white/5"
      >
        <div className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="MediTrack" className="h-9 w-auto rounded-lg border border-white/10 object-contain" />
          <span className="text-lg font-bold tracking-wide text-white hidden sm:block">MediTrack</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="text-xs font-bold px-3 py-1.5 rounded-full border border-teal-500/40 text-teal-300 hover:bg-teal-500/10 transition-all"
          >
            {i18n.language === 'ar' ? 'EN' : 'عربي'}
          </button>
          <Link to="/login" className="text-slate-300 hover:text-white transition-colors text-sm font-medium px-4">{t('common.logIn')}</Link>
          <Link
            to="/signup"
            className="px-5 py-2 rounded-full text-sm font-bold text-white transition-all shadow-lg"
            style={{ background: 'linear-gradient(135deg, #1e5faa 0%, #20c9a8 100%)' }}
          >
            {t('common.signUp')}
          </Link>
        </div>
      </motion.nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden px-6">
        {/* Background gradient mesh */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #0e2d5e 0%, #050d1a 70%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 40% 40% at 80% 80%, rgba(32,201,168,0.12) 0%, transparent 70%)' }} />

        {/* Animated orbs */}
        <Orb className="w-[700px] h-[700px] bg-blue-800/25 top-[-200px] left-[-200px]"
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }} />
        <Orb className="w-[500px] h-[500px] bg-teal-500/15 bottom-[-100px] right-[-100px]"
          animate={{ x: [0, -40, 0], y: [0, -30, 0] }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {PARTICLES.map(p => <Particle key={p.id} {...p} />)}
        </div>

        <motion.div style={{ y: heroY }} className="relative z-10 max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-xs font-bold uppercase tracking-widest mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
            </span>
            Next-Generation Healthcare Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight mb-6"
          >
            <span className="text-white">Connecting</span>
            <br />
            <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #20c9a8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Health, Saving Lives
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            {t('landing.heroSubtitle')}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(32,201,168,0.35)' }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-2xl font-bold text-white flex items-center gap-2 text-base shadow-xl"
                style={{ background: 'linear-gradient(135deg, #1e5faa 0%, #20c9a8 100%)' }}
              >
                Get Started Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,0.07)' }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-2xl font-bold text-slate-200 border border-white/15 backdrop-blur-sm transition-all text-base"
              >
                Sign In to Portal
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap justify-center gap-6 mt-14 text-slate-500 text-xs font-semibold uppercase tracking-wider"
          >
            {['HIPAA Compliant', 'End-to-End Encrypted', 'Real-Time Sync', '99.9% Uptime'].map(badge => (
              <div key={badge} className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-teal-500" />
                {badge}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown size={18} />
        </motion.div>
      </section>

      {/* ── Stats band ──────────────────────────────────────────────────── */}
      <section className="relative py-16 border-y border-white/5" style={{ background: 'linear-gradient(90deg, #061225 0%, #0b1f3a 50%, #061225 100%)' }}>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: 12500, suffix: '+', label: 'Patients Served' },
            { val: 850, suffix: '+', label: 'Doctors Onboard' },
            { val: 98, suffix: '%', label: 'Safety Accuracy' },
            { val: 3, suffix: 'M+', label: 'Doses Tracked' },
          ].map(({ val, suffix, label }, i) => (
            <FadeIn key={label} delay={i * 0.1}>
              <p className="text-4xl md:text-5xl font-black" style={{ background: 'linear-gradient(135deg, #60a5fa, #20c9a8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                <Counter to={val} suffix={suffix} />
              </p>
              <p className="text-slate-400 text-sm font-semibold mt-2 uppercase tracking-wider">{label}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Feature cards ────────────────────────────────────────────────── */}
      <section className="py-28 px-6 relative" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, #081830 0%, #050d1a 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-3 block">Why MediTrack</span>
            <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
              {t('landing.heroTitle')}
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">{t('landing.heroSubtitle')}</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: t('landing.safetyEngine'),
                desc: t('landing.safetyEngineDesc'),
                gradient: 'from-teal-500/20 to-teal-500/5',
                border: 'border-teal-500/25',
                iconColor: 'text-teal-400',
                glow: 'rgba(20,184,166,0.3)',
              },
              {
                icon: Clock,
                title: t('landing.adherenceTracking'),
                desc: t('landing.adherenceTrackingDesc'),
                gradient: 'from-blue-500/20 to-blue-500/5',
                border: 'border-blue-500/25',
                iconColor: 'text-blue-400',
                glow: 'rgba(59,130,246,0.3)',
              },
              {
                icon: ActivitySquare,
                title: t('landing.automatedRx'),
                desc: t('landing.automatedRxDesc'),
                gradient: 'from-indigo-500/20 to-indigo-500/5',
                border: 'border-indigo-500/25',
                iconColor: 'text-indigo-400',
                glow: 'rgba(99,102,241,0.3)',
              },
            ].map(({ icon: Icon, title, desc, gradient, border, iconColor, glow }, i) => (
              <FadeIn key={title} delay={i * 0.15}>
                <motion.div
                  whileHover={{ y: -8, boxShadow: `0 30px 60px -10px ${glow}` }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className={`relative p-8 rounded-3xl border bg-gradient-to-b ${gradient} ${border} overflow-hidden group`}
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`} style={{ boxShadow: `inset 0 0 60px ${glow.replace('0.3', '0.1')}` }} />
                  <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 ${iconColor}`}>
                    <Icon size={26} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-28 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #061225 0%, #050d1a 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3 block">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-black mb-4">One Platform. Every Role.</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Designed for doctors, patients, pharmacies, and hospitals — seamlessly integrated.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Stethoscope, role: 'Doctors', color: '#60a5fa', step: '01', desc: 'Manage appointments, write smart prescriptions with automated safety checks, and monitor patient adherence in real time.' },
              { icon: Heart, role: 'Patients', color: '#20c9a8', step: '02', desc: 'Track your medications, mark doses, view your full health timeline, and book appointments — all in one place.' },
              { icon: FlaskConical, role: 'Pharmacies', color: '#a78bfa', step: '03', desc: 'Auto-update stock levels as patients mark doses. View prescription pipelines and dispense medications accurately.' },
            ].map(({ icon: Icon, role, color, step, desc }, i) => (
              <FadeIn key={role} delay={i * 0.15}>
                <div className="relative group">
                  <div className="text-7xl font-black text-white/[0.04] absolute -top-4 -start-2 select-none">{step}</div>
                  <div className="relative p-8 rounded-3xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.05] transition-all">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}>
                      <Icon size={22} style={{ color }} />
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color }}>{role}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature highlight strip ──────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg, #081830 0%, #0d2744 50%, #0a1f36 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Zap, label: 'Instant Drug Checks', desc: 'Prescription safety in milliseconds' },
              { icon: Globe, label: 'Global Patient Records', desc: 'Unified medical history, always accessible' },
              { icon: Lock, label: 'Bank-Grade Security', desc: 'End-to-end encrypted, HIPAA compliant' },
              { icon: Building2, label: 'Multi-Hospital Ready', desc: 'Scales across entire health networks' },
            ].map(({ icon: Icon, label, desc }, i) => (
              <FadeIn key={label} delay={i * 0.1}>
                <div className="flex items-start gap-4 p-5 rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.05] transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-teal-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{label}</p>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA section ─────────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, #0e2d5e 0%, #050d1a 100%)' }} />
        <Orb className="w-[600px] h-[600px] bg-teal-600/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={{ scale: [1, 1.15, 1] }} />

        <FadeIn className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-widest mb-8">
            <Star size={12} className="text-yellow-400 fill-yellow-400" /> Trusted by healthcare professionals worldwide
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Ready to Transform<br />
            <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #20c9a8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Healthcare Delivery?
            </span>
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of doctors, patients, and pharmacies already using MediTrack to deliver safer, smarter care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 50px rgba(32,201,168,0.4)' }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 rounded-2xl font-bold text-white text-base shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #1e5faa 0%, #20c9a8 100%)' }}
              >
                Start For Free — No Card Required
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.04 }}
                className="px-10 py-4 rounded-2xl font-bold text-slate-300 border border-white/15 transition-all text-base"
              >
                Sign In
              </motion.button>
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 py-14 px-6" style={{ background: '#030b18' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.jpeg" alt="MediTrack" className="h-10 w-auto rounded-lg opacity-90 object-contain" />
                <span className="text-lg font-bold text-white">MediTrack</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                Connecting Health, Saving Lives. A unified, deterministic healthcare management platform.
              </p>
            </div>
            <div>
              <p className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Platform</p>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li><a href="#" className="hover:text-teal-400 transition-colors">For Doctors</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">For Patients</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">For Pharmacies</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">For Hospitals</a></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Legal</p>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li><a href="#" className="hover:text-teal-400 transition-colors">{t('landing.privacyPolicy')}</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">{t('landing.termsOfService')}</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">{t('landing.contactSupport')}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-sm">
              &copy; {new Date().getFullYear()} MediTrack. {t('landing.copyright')}
            </p>
            <div className="flex items-center gap-2">
              {[{color:'bg-teal-500'},{color:'bg-blue-500'},{color:'bg-indigo-500'}].map((c,i)=>(
                <div key={i} className={`w-2 h-2 rounded-full ${c.color} opacity-60`} />
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
