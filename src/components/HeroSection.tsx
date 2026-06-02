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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-[#00FF88] opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 space-y-10 max-w-4xl mx-auto">
          
          <div className="h-24 sm:h-28 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentHeadline}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-[2.5rem] leading-[1.1] md:text-6xl font-extrabold tracking-tight font-display text-white px-5 md:px-4"
              >
                {headlines[currentHeadline]}
              </motion.h1>
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            <h2 className="text-[1.1rem] md:text-2xl font-bold font-mono text-[#00FF88] tracking-widest uppercase">
              Scanne. Découvre. Transforme-toi.
            </h2>

            <div className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed space-y-2 font-medium px-5 md:px-0">
              <p>80% des gens ne lisent jamais les étiquettes.</p>
              <p>Les 20% qui le font vivent mieux.</p>
              <p className="font-bold text-white">Fais partie des 20%.</p>
            </div>
          </div>

          <div className="pt-2 mb-10 md:mb-20 px-5 md:px-0">
            <button
              onClick={onCtaClick}
              className="w-[90%] md:w-auto px-4 md:px-8 py-4 md:py-5 rounded-full bg-[#00FF88] hover:bg-[#00e67a] hover:scale-105 active:scale-95 text-black font-extrabold text-[15px] md:text-base tracking-wider shadow-[0_0_40px_rgba(0,255,136,0.4)] transition-all flex items-center justify-center gap-3 mx-auto max-w-[320px] md:max-w-none min-h-[50px] relative z-20"
            >
              📸 Je veux savoir ce que je mange
            </button>
            <div className="mt-6 flex justify-center animate-bounce text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>

        </div>
      </section>

      {/* Phrase Choc Section (Scroll block) */}
      <section className="bg-black py-40 border-y border-[#202020] relative">
        <div className="max-w-4xl mx-auto px-5 md:px-4 text-center">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-[2rem] leading-tight sm:text-5xl md:text-6xl font-black text-white font-display"
          >
            "Le sucre caché dans ton yaourt 'light' <br/><span className="text-[#00FF88]">ruine tes efforts.</span>"
          </motion.h2>
        </div>
      </section>
    </div>
  );
}
