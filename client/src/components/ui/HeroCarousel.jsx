import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, Calendar } from "lucide-react";

// Mock implementation of shadcn/ui Button if not available
const Button = React.forwardRef(({ className, variant = "default", size = "default", children, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-primary text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20",
    outline: "border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-100",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-12 rounded-lg px-8",
    icon: "h-10 w-10"
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ""}`;

  return (
    <button ref={ref} className={combinedClassName} {...props}>
      {children}
    </button>
  );
});
Button.displayName = "Button";

const SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81628dc0?auto=format&fit=crop&w=2000&q=80",
    title: "Smart Healthcare Starts Here",
    subtitle: "Connecting patients, doctors, and pharmacies in one intelligent deterministic system.",
    badge: "Next-Gen Infrastructure"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=2000&q=80",
    title: "Empowering Medical Decisions",
    subtitle: "Advanced safety engines prevent adverse drug interactions automatically before they occur.",
    badge: "AI-Assisted Safety"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=2000&q=80",
    title: "Proactive Patient Care",
    subtitle: "Real-time medication adherence tracking loops right back to your pharmacy stock.",
    badge: "Automated Logistics"
  }
];

const AUTO_PLAY_INTERVAL = 5000;

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);

  const navigateSlide = useCallback((newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = SLIDES.length - 1;
      if (next >= SLIDES.length) next = 0;
      return next;
    });
    setProgress(0);
  }, []);

  const handleNext = () => navigateSlide(1);
  const handlePrev = () => navigateSlide(-1);

  // Auto-play logic with progress bar
  useEffect(() => {
    if (isHovered) return;

    const intervalTime = 50; // Update progress every 50ms
    const step = (intervalTime / AUTO_PLAY_INTERVAL) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          navigateSlide(1);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isHovered, navigateSlide]);

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 1.1, // Start slightly zoomed out for Ken Burns effect
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1, // Normal scale
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
        scale: { duration: 10, ease: "linear" }, // Slow zoom Ken Burns effect while active
      },
    },
    exit: (dir) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 }
      }
    }),
  };

  const textContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const textItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden bg-slate-950 group flex items-center justify-center font-sans tracking-tight"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 z-20 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }}></div>

      {/* Floating Particles/Shapes (Subtle) */}
      <motion.div 
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] z-10 pointer-events-none"
      />
      <motion.div 
        animate={{ y: [0, 20, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent-blue/20 rounded-full blur-[120px] z-10 pointer-events-none"
      />

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = offset.x;
            if (swipe < -100) handleNext();
            else if (swipe > 100) handlePrev();
          }}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        >
          {/* Background Image with Parallax & Ken Burns */}
          <div 
             className="absolute inset-0 w-full h-full bg-cover bg-center"
             style={{ backgroundImage: `url(${SLIDES[currentIndex].image})` }}
          />

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-950/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Layer */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-center h-full pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            variants={textContainerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="pointer-events-auto max-w-2xl"
          >
            {/* Glassmorphism Card Wrapper */}
            <div className="relative p-8 md:p-12 rounded-2xl backdrop-blur-xl bg-slate-950/40 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] overflow-hidden">
               {/* Edge glow */}
               <div className="absolute inset-0 rounded-2xl border border-primary/20 opacity-50 mix-blend-overlay shadow-[inset_0_0_20px_rgba(255,102,0,0.15)] pointer-events-none" />

               <motion.div variants={textItemVariants} className="mb-6 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur-sm">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  {SLIDES[currentIndex].badge}
               </motion.div>
               
               <motion.h1 variants={textItemVariants} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 drop-shadow-md">
                 {SLIDES[currentIndex].title}
               </motion.h1>
               
               <motion.p variants={textItemVariants} className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed mb-8 drop-shadow-sm max-w-xl">
                 {SLIDES[currentIndex].subtitle}
               </motion.p>
               
               <motion.div variants={textItemVariants} className="flex flex-col sm:flex-row gap-4">
                  <Link to="/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full font-bold group">
                      Get Started
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full font-bold backdrop-blur-md hover:bg-white/10 group">
                      <Calendar className="mr-2 w-4 h-4 text-slate-300 group-hover:text-white" />
                      Book Appointment
                    </Button>
                  </Link>
               </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute right-6 md:right-12 bottom-24 flex items-center gap-4 z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
         <button 
           onClick={handlePrev} 
           className="p-3 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-colors"
         >
           <ChevronLeft className="w-6 h-6" />
         </button>
         <button 
           onClick={handleNext} 
           className="p-3 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-colors"
         >
           <ChevronRight className="w-6 h-6" />
         </button>
      </div>

      {/* Progress Bar & Dots Indicators */}
      <div className="absolute bottom-0 left-0 w-full z-40">
        <div className="h-[3px] bg-slate-800/50 w-full">
           <motion.div 
             className="h-full bg-gradient-to-r from-primary/50 to-primary origin-left"
             style={{ width: `${progress}%` }}
             layout
           />
        </div>
        
        <div className="flex justify-center gap-3 py-6 relative bottom-0">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
                setProgress(0);
              }}
              className="group relative flex h-4 items-center justify-center p-2"
            >
              <span 
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === index 
                    ? "w-8 bg-primary shadow-[0_0_8px_rgba(255,102,0,0.8)]" 
                    : "w-2 bg-slate-500/50 group-hover:bg-slate-400 group-hover:w-4"
                }`} 
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
