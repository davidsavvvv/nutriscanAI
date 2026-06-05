import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const headlines = [
  "Tu sais ce que tu manges vraiment ?",
  "Chaque aliment raconte une histoire.",
  "Ton corps mérite mieux que ça.",
  "Et si tu savais tout en 3 secondes ?"
];

interface HeroSectionProps {
  onCtaClick: () => void;
}

export function HeroSection({ onCtaClick }: HeroSectionProps) {
  const [currentHeadline, setCurrentHeadline] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeadline((prev) => (prev + 1) % headlines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      <section className="relative pt-8 pb-16 md:pt-16 md:pb-32 text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[50vh] flex flex-col justify-start md:justify-center">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-emerald-500 opacity-[0.08] blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 space-y-10 max-w-4xl mx-auto flex flex-col items-center">
          
          <div className="min-h-[110px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentHeadline}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight font-display text-white px-5 md:px-4 text-center leading-tight drop-shadow-sm"
              >
                {headlines[currentHeadline]}
              </motion.h1>
            </AnimatePresence>
          </div>

          <div className="space-y-6 text-center text-slate-300">
            <h2 className="text-sm md:text-base font-bold font-mono text-emerald-400 tracking-widest uppercase">
              Scanne. Découvre. Transforme-toi.
            </h2>
            <div className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed space-y-2 font-medium px-5 md:px-0">
              <p>80% des gens ne lisent jamais les étiquettes.</p>
              <p>Les 20% qui le font vivent en meilleure santé.</p>
              <p className="font-bold text-white">Fais partie des 20%.</p>
            </div>
          </div>

          <div className="pt-4 mb-2 md:mb-12 px-5 md:px-0 flex flex-col items-center w-full">
            <button
              onClick={onCtaClick}
              className="w-full sm:w-auto px-6 md:px-10 py-4 md:py-5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 hover:scale-[1.02] active:scale-95 text-white font-extrabold text-[15px] md:text-lg tracking-wide shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-3 relative z-20 group"
            >
              Scanner mon premier repas
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
            <p className="mt-4 text-xs font-medium text-slate-400 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Gratuit • Sans carte bancaire • Analyse en 3 secondes
            </p>
          </div>

          {/* Smartphone Mockup */}
          <div className="relative mx-auto mt-8 w-full max-w-sm md:max-w-md px-4 perspective-[1000px]">
            <div className="relative bg-slate-900 border-[8px] border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden aspect-[9/16] transform rotate-x-6 rotate-y-3 hover:rotate-x-0 hover:rotate-y-0 transition-transform duration-500 ease-out">
              {/* Top Notch/Dynamic Island */}
              <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-20">
                <div className="w-24 h-6 bg-slate-950 rounded-b-3xl"></div>
              </div>
              
              {/* Screen Content */}
              <div className="absolute inset-0 bg-slate-950 flex shadow-inner">
                <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?&auto=format&fit=crop&w=800&q=80" alt="Assiette équilibrée" className="w-full h-full object-cover opacity-80" />
                
                {/* Floating Badges */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6 gap-3 pb-8">
                  <div className="self-end bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold px-3 py-1.5 rounded-full text-xs shadow-lg animate-bounce flex items-center gap-1.5">
                    <span className="text-red-400">🔥</span> 450 kcal
                  </div>
                  <div className="self-start bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold px-3 py-1.5 rounded-full text-xs shadow-lg animate-pulse flex items-center gap-1.5">
                    <span className="text-emerald-400">🍗</span> 35g Protéines
                  </div>
                  <div className="self-end bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold px-3 py-1.5 rounded-full text-xs shadow-lg flex items-center gap-1.5 mb-4">
                    <span className="text-blue-400">💧</span> 12g Lipides Sains
                  </div>
                  
                  {/* Fake UI bottom */}
                  <div className="w-full h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                    <div className="w-1/3 h-1.5 bg-white/30 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Phrase Choc Section (Scroll block) */}
      <section className="bg-slate-950 py-32 border-y border-slate-900 shadow-inner relative">
        <div className="max-w-4xl mx-auto px-5 md:px-4 text-center">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-3xl leading-snug sm:text-4xl md:text-5xl font-black text-white font-display"
          >
            Le sucre caché dans votre yaourt "light" <br className="hidden md:block"/><span className="text-emerald-500">détruit vos efforts.</span>
          </motion.h2>
        </div>
      </section>
    </div>
  );
}
